// ============================================================================
// VideoForge AI — Global Application State
// Thin React Context store. No backend coupling. Ready to be swapped for
// Zustand or wired to TanStack Query when Phase 7 connects MoneyPrinterTurbo.
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
import { SEED_RENDER_QUEUE, SEED_OUTPUTS, SEED_NOTIFICATIONS } from "@/lib/render-pipeline";


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

// ── Initial ────────────────────────────────────────────────────────────────
const INITIAL: AppState = {
  currentProject: null,
  currentScript: null,
  currentKeywords: [],
  selectedVoice: null,
  selectedSubtitleTemplate: null,
  selectedSubtitleAnimation: null,
  selectedTransition: "fade",
  videoSettings: DEFAULT_VIDEO_SETTINGS as VideoSettings,
  audioSettings: DEFAULT_AUDIO_SETTINGS as AudioSettings,
  subtitleSettings: DEFAULT_SUBTITLE_SETTINGS as unknown as SubtitleSettings,
  recentProjects: [],
  recentOutputs: SEED_OUTPUTS,
  notifications: SEED_NOTIFICATIONS,
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
  renderQueue: SEED_RENDER_QUEUE,
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
};

// ── Actions ────────────────────────────────────────────────────────────────
type Action =
  | { type: "SET_PROJECT"; payload: Project | null }
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
  | { type: "MARK_DIRTY" }
  | { type: "MARK_SAVING"; payload: boolean }
  | { type: "MARK_SAVED" };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_PROJECT":     return { ...state, currentProject: action.payload, isDirty: false };
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
    case "ENQUEUE_RENDER":  return { ...state, renderQueue: [action.payload, ...state.renderQueue] };
    case "UPDATE_RENDER":
      return {
        ...state,
        renderQueue: state.renderQueue.map(t => t.id === action.payload.id ? { ...t, ...action.payload.patch } : t),
      };
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
  // ergonomic helpers
  setProject: (p: Project | null) => void;
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
  const [state, dispatch] = useReducer(reducer, INITIAL);

  const value = useMemo<AppStateContextValue>(() => ({
    state,
    dispatch,
    setProject:   (p) => dispatch({ type: "SET_PROJECT", payload: p }),
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

// Convenience selector hook — re-render only on slice change is callers' concern;
// today this just returns the slice for ergonomic destructuring.
export function useAppSlice<T>(selector: (s: AppState) => T): T {
  const { state } = useAppState();
  return useCallback(() => selector(state), [state, selector])();
}
