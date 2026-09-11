// ============================================================================
// VideoForge AI — Global Application State
// Connected to client-side project persistence (project-storage.service.ts)
// ============================================================================

import {
  createContext, useCallback, useContext, useMemo, useReducer,
  type ReactNode,
} from "react";
import type {
  Project, Script, Keyword, Voice, SubtitleTemplate, SubtitleAnimation,
  TransitionId, VideoSettings, AudioSettings, SubtitleSettings,
  Notification, UserPreferences, RenderTask, Output, ThemeMode,
} from "@/types";
import {
  DEFAULT_VIDEO_SETTINGS, DEFAULT_AUDIO_SETTINGS, DEFAULT_SUBTITLE_SETTINGS,
} from "@/lib/constants";
// Mock seeds eliminated in Phase 16 hardening
import { projectStorageService } from "@/services/project-storage.service";

// ── Shape ──────────────────────────────────────────────────────────────────
export interface AppState {
  currentProject: Project | null;
  currentScript: Script | null;
  currentKeywords: Keyword[];
  selectedVoice: Voice | null;
  selectedSubtitleTemplate: SubtitleTemplate | null;
  selectedSubtitleAnimation: SubtitleAnimation | null;
  selectedTransition: TransitionId;
  videoSettings: VideoSettings;
  audioSettings: AudioSettings;
  subtitleSettings: SubtitleSettings;
  recentProjects: Project[];
  recentOutputs: Output[];
  notifications: Notification[];
  preferences: UserPreferences;
  renderQueue: RenderTask[];
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
}

// ── Initial State Loader ───────────────────────────────────────────────────
function getInitialState(): AppState {
  const savedProjects = typeof window !== "undefined" ? projectStorageService.listProjects() : [];
  const activeId = typeof window !== "undefined" ? projectStorageService.getActiveProjectId() : null;
  const initialProject = savedProjects.find(p => p.id === activeId) || savedProjects[0] || null;
  const savedOutputs = typeof window !== "undefined" ? projectStorageService.listOutputs() : [];

  return {
    currentProject: initialProject,
    currentScript: initialProject?.script || null,
    currentKeywords: initialProject?.keywords || [],
    selectedVoice: initialProject?.voice || null,
    selectedSubtitleTemplate: null,
    selectedSubtitleAnimation: null,
    selectedTransition: "fade",
    videoSettings: (initialProject?.videoSettings || DEFAULT_VIDEO_SETTINGS) as VideoSettings,
    audioSettings: (initialProject?.audioSettings || DEFAULT_AUDIO_SETTINGS) as AudioSettings,
    subtitleSettings: (initialProject?.subtitleSettings || DEFAULT_SUBTITLE_SETTINGS) as unknown as SubtitleSettings,
    recentProjects: savedProjects,
    recentOutputs: savedOutputs,
    notifications: [],
    preferences: {
      theme: "light",
      language: "en-US",
      desktopNotifications: true,
      audioNotifications: false,
      autoSave: true,
      autoUpdate: true,
      reduceMotion: false,
      developerMode: false,
    },
    renderQueue: typeof window !== 'undefined' ? projectStorageService.listQueue() : [],
    isDirty: false,
    isSaving: false,
    lastSavedAt: null,
  };
}

// ── Actions ────────────────────────────────────────────────────────────────
type Action =
  | { type: "SET_PROJECT"; payload: Project | null }
  | { type: "SAVE_PROJECT"; payload: Project }
  | { type: "DELETE_PROJECT"; payload: string }
  | { type: "SAVE_OUTPUT"; payload: Output }
  | { type: "DELETE_OUTPUT"; payload: string }
  | { type: "SET_SCRIPT"; payload: Script | null }
  | { type: "SET_KEYWORDS"; payload: Keyword[] }
  | { type: "SET_VOICE"; payload: Voice | null }
  | { type: "SET_TEMPLATE"; payload: SubtitleTemplate | null }
  | { type: "SET_ANIMATION"; payload: SubtitleAnimation | null }
  | { type: "SET_TRANSITION"; payload: TransitionId }
  | { type: "PATCH_VIDEO"; payload: Partial<VideoSettings> }
  | { type: "PATCH_AUDIO"; payload: Partial<AudioSettings> }
  | { type: "PATCH_SUBTITLE"; payload: Partial<SubtitleSettings> }
  | { type: "SET_THEME"; payload: ThemeMode }
  | { type: "PATCH_PREFS"; payload: Partial<UserPreferences> }
  | { type: "PUSH_NOTIFICATION"; payload: Notification }
  | { type: "MARK_NOTIFICATIONS_READ" }
  | { type: "ENQUEUE_RENDER"; payload: RenderTask }
  | { type: "UPDATE_RENDER"; payload: { id: string; patch: Partial<RenderTask> } }
  | { type: "REMOVE_RENDER"; payload: string }
  | { type: "SET_RENDER_QUEUE"; payload: RenderTask[] }
  | { type: "CLEAR_COMPLETED_RENDERS" }
  | { type: "MARK_DIRTY" }
  | { type: "MARK_SAVING"; payload: boolean }
  | { type: "MARK_SAVED" };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_PROJECT": {
      const p = action.payload;
      if (p) {
        projectStorageService.setActiveProjectId(p.id);
      }
      return {
        ...state,
        currentProject: p,
        currentScript: p?.script ?? state.currentScript,
        currentKeywords: p?.keywords ?? state.currentKeywords,
        selectedVoice: p?.voice ?? state.selectedVoice,
        videoSettings: p?.videoSettings ?? state.videoSettings,
        audioSettings: p?.audioSettings ?? state.audioSettings,
        subtitleSettings: p?.subtitleSettings ?? state.subtitleSettings,
        isDirty: false,
      };
    }
    case "SAVE_PROJECT": {
      const clean = projectStorageService.saveProject(action.payload);
      projectStorageService.setActiveProjectId(clean.id);
      const existingIdx = state.recentProjects.findIndex(p => p.id === clean.id);
      const updatedProjects = existingIdx >= 0
        ? state.recentProjects.map(p => p.id === clean.id ? clean : p)
        : [clean, ...state.recentProjects];
      return {
        ...state,
        currentProject: clean,
        recentProjects: updatedProjects,
        isDirty: false,
        lastSavedAt: new Date().toISOString(),
      };
    }
    case "DELETE_PROJECT": {
      projectStorageService.deleteProject(action.payload);
      const updatedProjects = state.recentProjects.filter(p => p.id !== action.payload);
      const nextActive = state.currentProject?.id === action.payload
        ? (updatedProjects[0] || null)
        : state.currentProject;
      return {
        ...state,
        currentProject: nextActive,
        recentProjects: updatedProjects,
      };
    }
    case "SAVE_OUTPUT": {
      const clean = projectStorageService.saveOutput(action.payload);
      const existingIdx = state.recentOutputs.findIndex(o => o.id === clean.id);
      const updatedOutputs = existingIdx >= 0
        ? state.recentOutputs.map(o => o.id === clean.id ? clean : o)
        : [clean, ...state.recentOutputs];
      return {
        ...state,
        recentOutputs: updatedOutputs,
      };
    }
    case "DELETE_OUTPUT": {
      projectStorageService.deleteOutput(action.payload);
      return {
        ...state,
        recentOutputs: state.recentOutputs.filter(o => o.id !== action.payload),
      };
    }
    case "SET_SCRIPT":      return { ...state, currentScript: action.payload, isDirty: true };
    case "SET_KEYWORDS":    return { ...state, currentKeywords: action.payload, isDirty: true };
    case "SET_VOICE":       return { ...state, selectedVoice: action.payload, isDirty: true };
    case "SET_TEMPLATE":    return { ...state, selectedSubtitleTemplate: action.payload, isDirty: true };
    case "SET_ANIMATION":   return { ...state, selectedSubtitleAnimation: action.payload, isDirty: true };
    case "SET_TRANSITION":  return { ...state, selectedTransition: action.payload, isDirty: true };
    case "PATCH_VIDEO":     return { ...state, videoSettings: { ...state.videoSettings, ...action.payload }, isDirty: true };
    case "PATCH_AUDIO":     return { ...state, audioSettings: { ...state.audioSettings, ...action.payload }, isDirty: true };
    case "PATCH_SUBTITLE":  return { ...state, subtitleSettings: { ...state.subtitleSettings, ...action.payload }, isDirty: true };
    case "SET_THEME":       return { ...state, preferences: { ...state.preferences, theme: action.payload } };
    case "PATCH_PREFS":     return { ...state, preferences: { ...state.preferences, ...action.payload } };
    case "PUSH_NOTIFICATION":
      return { ...state, notifications: [action.payload, ...state.notifications].slice(0, 100) };
    case "MARK_NOTIFICATIONS_READ":
      return { ...state, notifications: state.notifications.map(n => ({ ...n, isRead: true })) };
    case "ENQUEUE_RENDER": {
      const updated = [action.payload, ...state.renderQueue];
      projectStorageService.saveQueue(updated);
      return { ...state, renderQueue: updated };
    }
    case "UPDATE_RENDER": {
      const updated = state.renderQueue.map((t) =>
        t.id === action.payload.id ? { ...t, ...action.payload.patch } : t
      );
      projectStorageService.saveQueue(updated);
      return { ...state, renderQueue: updated };
    }
    case "REMOVE_RENDER": {
      const updated = state.renderQueue.filter((t) => t.id !== action.payload);
      projectStorageService.saveQueue(updated);
      return { ...state, renderQueue: updated };
    }
    case "SET_RENDER_QUEUE": {
      projectStorageService.saveQueue(action.payload);
      return { ...state, renderQueue: action.payload };
    }
    case "CLEAR_COMPLETED_RENDERS": {
      const updated = state.renderQueue.filter((t) => t.status !== "completed");
      projectStorageService.saveQueue(updated);
      return { ...state, renderQueue: updated };
    }
    case "MARK_DIRTY":      return { ...state, isDirty: true };
    case "MARK_SAVING":     return { ...state, isSaving: action.payload };
    case "MARK_SAVED":      return { ...state, isDirty: false, isSaving: false, lastSavedAt: new Date().toISOString() };
    default:                return state;
  }
}

// ── Context ────────────────────────────────────────────────────────────────
interface AppStateContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  setProject: (p: Project | null) => void;
  saveProject: (p: Project) => void;
  deleteProject: (id: string) => void;
  saveOutput: (o: Output) => void;
  deleteOutput: (id: string) => void;
  setScript: (s: Script | null) => void;
  setKeywords: (k: Keyword[]) => void;
  setVoice: (v: Voice | null) => void;
  setTemplate: (t: SubtitleTemplate | null) => void;
  setTransition: (t: TransitionId) => void;
  patchVideo: (p: Partial<VideoSettings>) => void;
  patchAudio: (p: Partial<AudioSettings>) => void;
  patchSubtitle: (p: Partial<SubtitleSettings>) => void;
  setTheme: (t: ThemeMode) => void;
  pushNotification: (n: Notification) => void;
  markNotificationsRead: () => void;
  markSaved: () => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);

  const value = useMemo<AppStateContextValue>(() => ({
    state,
    dispatch,
    setProject:   (p) => dispatch({ type: "SET_PROJECT", payload: p }),
    saveProject:  (p) => dispatch({ type: "SAVE_PROJECT", payload: p }),
    deleteProject:(id) => dispatch({ type: "DELETE_PROJECT", payload: id }),
    saveOutput:   (o) => dispatch({ type: "SAVE_OUTPUT", payload: o }),
    deleteOutput: (id) => dispatch({ type: "DELETE_OUTPUT", payload: id }),
    setScript:    (s) => dispatch({ type: "SET_SCRIPT", payload: s }),
    setKeywords:  (k) => dispatch({ type: "SET_KEYWORDS", payload: k }),
    setVoice:     (v) => dispatch({ type: "SET_VOICE", payload: v }),
    setTemplate:  (t) => dispatch({ type: "SET_TEMPLATE", payload: t }),
    setTransition:(t) => dispatch({ type: "SET_TRANSITION", payload: t }),
    patchVideo:   (p) => dispatch({ type: "PATCH_VIDEO", payload: p }),
    patchAudio:   (p) => dispatch({ type: "PATCH_AUDIO", payload: p }),
    patchSubtitle:(p) => dispatch({ type: "PATCH_SUBTITLE", payload: p }),
    setTheme:     (t) => dispatch({ type: "SET_THEME", payload: t }),
    pushNotification: (n) => dispatch({ type: "PUSH_NOTIFICATION", payload: n }),
    markNotificationsRead: () => dispatch({ type: "MARK_NOTIFICATIONS_READ" }),
    markSaved:    () => dispatch({ type: "MARK_SAVED" }),
  }), [state]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside <AppStateProvider>");
  return ctx;
}

export function useAppSlice<T>(selector: (s: AppState) => T): T {
  const { state } = useAppState();
  return useCallback(() => selector(state), [state, selector])();
}
