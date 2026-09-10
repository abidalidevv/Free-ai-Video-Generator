import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Video, FolderKanban, Subtitles, Sparkles, Library,
  LayoutTemplate, Mic2, Music2, FileVideo, Languages, ScrollText,
  Settings as SettingsIcon, Code2, Info, Search, Bell, ChevronDown, Sun, Moon,
  Command, Wand2, LogOut, User, CreditCard, Shield, Receipt, Gauge, UserCircle,
  CheckCircle2, AlertTriangle, Mic, FileText, Download, Filter, Check, Clapperboard,
  AudioLines, Rocket, ListVideo, Menu, X,
} from "lucide-react";
import { useState, useRef, useEffect, type ReactNode } from "react";
import { CommandPalette, useCommandPalette } from "@/components/command-palette";


const navMain = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/" },
  { icon: Video, label: "Create Video", to: "/create", badge: "AI" },
  { icon: Clapperboard, label: "Video Settings", to: "/video-settings", badge: "NEW" },
  { icon: Mic2, label: "Audio Studio", to: "/audio-studio", badge: "NEW" },
  { icon: FolderKanban, label: "Projects", to: "/projects", badge: "24" },
  { icon: Subtitles, label: "Subtitle Studio", to: "/subtitle-studio" },
  { icon: Sparkles, label: "Video Effects", to: "/effects" },
  { icon: Library, label: "Assets Library", to: "/assets" },
  { icon: LayoutTemplate, label: "Templates", to: "/templates" },
  { icon: AudioLines, label: "Voices", to: "/voices" },
  { icon: Music2, label: "Music", to: "/music" },
  { icon: Rocket, label: "Render Studio", to: "/render", badge: "PRO" },
  { icon: ListVideo, label: "Render Queue", to: "/queue" },
  { icon: FileVideo, label: "Outputs", to: "/outputs", badge: "3" },
  { icon: UserCircle, label: "Account", to: "/account" },
];

const navGeneral = [
  { icon: SettingsIcon, label: "Basic Settings", to: "/basic-settings", badge: "NEW" },
  { icon: Sparkles, label: "Render Settings", to: "/render-settings" },
  { icon: Languages, label: "Languages", to: "/languages" },
  { icon: ScrollText, label: "Logs", to: "/logs" },
  
  { icon: Code2, label: "Developer Mode", to: "/developer" },
  { icon: Info, label: "About", to: "/about" },
];

export function AppShell({ children, maxWidth = 1760 }: { children: ReactNode; maxWidth?: number }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: s => s.location.pathname });
  // Auto-close drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        {/* Mobile drawer */}
        {mobileOpen && (
          <>
            <button
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm"
            />
            <div className="lg:hidden fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] shadow-card-lg animate-in slide-in-from-left duration-200">
              <div className="relative h-full">
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-lg bg-card border border-border grid place-items-center"
                >
                  <X className="w-4 h-4" />
                </button>
                <Sidebar />
              </div>
            </div>
          </>
        )}
        <main className="flex-1 min-w-0 w-full">
          <TopBar maxWidth={maxWidth} onOpenMenu={() => setMobileOpen(true)} />
          <div
            className="app-content px-4 sm:px-6 lg:px-8 pb-10 pt-2 mx-auto w-full"
            style={{ maxWidth }}
          >
            {children}
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}

function Sidebar() {
  const pathname = useRouterState({ select: s => s.location.pathname });
  return (
    <aside className="w-[260px] shrink-0 h-screen lg:sticky top-0 bg-sidebar border-r border-border flex flex-col">
      <Link to="/" className="px-6 pt-6 pb-5 block">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-gradient grid place-items-center shadow-brand">
            <Wand2 className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display font-extrabold text-[15px] leading-none tracking-tight">VideoForge AI</div>
            <div className="text-[10px] text-sidebar-muted font-medium mt-1 tracking-wider uppercase">Pro AI Video Studio</div>
          </div>
        </div>
      </Link>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="px-3 pt-2 pb-2 text-[10px] font-semibold tracking-[0.14em] text-sidebar-muted">STUDIO</div>
        <nav className="space-y-0.5">
          {navMain.map(i => <NavItem key={i.label} {...i} active={pathname === i.to} />)}
        </nav>
        <div className="px-3 pt-6 pb-2 text-[10px] font-semibold tracking-[0.14em] text-sidebar-muted">SYSTEM</div>
        <nav className="space-y-0.5">
          {navGeneral.map(i => <NavItem key={i.label} {...i} active={pathname === i.to} />)}
        </nav>
      </div>

      <div className="p-3">
        <div className="relative rounded-2xl bg-brand-gradient-radial p-4 overflow-hidden">
          <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, rgba(255,255,255,.6), transparent 40%)" }} />
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur grid place-items-center mb-3">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="text-white font-display font-bold text-[15px] leading-tight">Upgrade to <br />VideoForge Pro</div>
            <div className="text-white/70 text-[11px] mt-1.5 leading-snug">4K rendering, unlimited voices & priority GPU.</div>
            <button className="mt-3 w-full bg-white text-[#164E32] text-[12px] font-semibold py-2 rounded-lg hover:bg-white/95 transition">Upgrade</button>
          </div>
        </div>
      </div>
    </aside>
  );
}


function NavItem({ icon: Icon, label, to, active, badge }: any) {
  return (
    <Link
      to={to}
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition cursor-pointer
        ${active ? "text-primary bg-accent" : "text-sidebar-foreground/70 hover:bg-secondary hover:text-sidebar-foreground"}`}
    >
      {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-brand-gradient" />}
      <Icon className="w-[18px] h-[18px]" strokeWidth={active ? 2.4 : 2} />
      <span className="flex-1">{label}</span>
      {badge && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${badge === "AI" ? "bg-brand-gradient text-white" : "bg-secondary text-muted-foreground group-hover:bg-card"}`}>{badge}</span>
      )}
      {/* Tooltip on hover (hidden by default; shows when title-style hover) */}
      <span className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md bg-foreground text-background text-[10.5px] font-semibold opacity-0 group-hover:opacity-0 whitespace-nowrap shadow-card transition-opacity" />
    </Link>
  );
}

function TopBar({ maxWidth, onOpenMenu }: { maxWidth: number; onOpenMenu?: () => void }) {
  const { open, setOpen } = useCommandPalette();
  return (
    <div className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border/60">
      <div
        className="px-4 sm:px-6 lg:px-8 h-[60px] sm:h-[68px] flex items-center gap-2 sm:gap-3 mx-auto w-full"
        style={{ maxWidth }}
      >
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open navigation"
          className="lg:hidden shrink-0 w-10 h-10 rounded-xl bg-card border border-border grid place-items-center text-muted-foreground hover:text-foreground transition"
        >
          <Menu className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open command palette (Cmd or Ctrl + K)"
          className="flex-1 min-w-0 max-w-xl relative h-10 sm:h-11 group text-left"
        >
          <Search className="w-4 h-4 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <span className="block w-full h-10 sm:h-11 pl-9 sm:pl-11 pr-14 sm:pr-24 rounded-xl bg-card border border-border text-[12.5px] sm:text-[13.5px] text-muted-foreground leading-[40px] sm:leading-[44px] group-hover:border-primary/30 transition truncate">
            <span className="hidden sm:inline">Search projects, voices, templates…</span>
            <span className="sm:hidden">Search…</span>
          </span>
          <span className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10.5px] sm:text-[11px] text-muted-foreground bg-secondary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md font-medium">
            <Command className="w-3 h-3" /> K
          </span>
        </button>

        <div className="hidden xl:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-card border border-border" title="System status: all services healthy">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-success" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-success animate-ping opacity-60" />
          </div>
          <span className="text-[12px] font-medium text-foreground">All Systems Online</span>
        </div>

        <div className="hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent/40 border border-primary/15">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-[12px] font-semibold text-primary">Pro Plan</span>
        </div>

        <LanguageSwitch />
        <ThemeSwitch />
        <NotificationBell />

        <UserMenu />
      </div>
      <CommandPalette open={open} onClose={() => setOpen(false)} />
    </div>
  );
}


function ThemeSwitch() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return (
    <button
      onClick={() => setDark(v => !v)}
      title={dark ? "Switch to light" : "Switch to dark"}
      className="w-10 h-10 rounded-xl bg-card border border-border grid place-items-center text-muted-foreground hover:text-foreground transition"
    >
      {dark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
    </button>
  );
}

function LanguageSwitch() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState("EN");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const langs = [
    { code: "EN", label: "English" }, { code: "ES", label: "Español" },
    { code: "FR", label: "Français" }, { code: "DE", label: "Deutsch" },
    { code: "ZH", label: "中文" }, { code: "JA", label: "日本語" },
    { code: "AR", label: "العربية" }, { code: "HI", label: "हिन्दी" },
  ];
  return (
    <div className="relative hidden md:block" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        title="Language"
        className="h-10 px-3 rounded-xl bg-card border border-border flex items-center gap-1.5 text-[12px] font-semibold text-foreground hover:border-primary/30 transition"
      >
        <Languages className="w-3.5 h-3.5 text-muted-foreground" /> {lang}
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-[200px] max-h-[320px] overflow-auto rounded-2xl bg-card border border-border shadow-card-lg p-1.5 z-50">
          {langs.map(l => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-[13px] hover:bg-secondary transition ${lang === l.code ? "text-primary font-semibold" : ""}`}
            >
              <span>{l.label}</span>
              <span className="flex items-center gap-2">
                <span className="text-[10.5px] text-muted-foreground font-mono">{l.code}</span>
                {lang === l.code && <Check className="w-3.5 h-3.5 text-primary" />}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const initialNotifications = [
  { id: 1, icon: CheckCircle2, tone: "success", title: "Render completed", body: "Morning Habits of CEOs · 4K · 248 MB", time: "2m", unread: true },
  { id: 2, icon: Mic, tone: "primary", title: "Voice generated", body: "Narrator — David v2 ready to use", time: "14m", unread: true },
  { id: 3, icon: Subtitles, tone: "primary", title: "Subtitles ready", body: "Top 10 AI Tools · 1,248 words", time: "32m", unread: true },
  { id: 4, icon: AlertTriangle, tone: "warning", title: "API key missing", body: "Pexels provider needs reconnection", time: "1h", unread: false },
  { id: 5, icon: FileText, tone: "default", title: "Script drafted", body: "Productivity Hacks · 920 words", time: "3h", unread: false },
  { id: 6, icon: Download, tone: "default", title: "Export finished", body: "Tokyo at Midnight saved to library", time: "5h", unread: false },
];

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const unread = items.filter(i => i.unread).length;
  const list = filter === "unread" ? items.filter(i => i.unread) : items;
  const toneCls: Record<string, string> = {
    success: "bg-success/10 text-success",
    primary: "bg-accent text-primary",
    warning: "bg-warning/15 text-amber-700",
    default: "bg-secondary text-muted-foreground",
  };
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        title="Notifications"
        className="relative w-10 h-10 rounded-xl bg-card border border-border grid place-items-center text-muted-foreground hover:text-foreground transition"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-gradient text-white text-[10px] font-bold grid place-items-center shadow-brand">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-[380px] rounded-2xl bg-card border border-border shadow-card-lg overflow-hidden z-50">
          <div className="px-4 py-3.5 border-b border-border flex items-center justify-between">
            <div>
              <div className="font-display font-bold text-[14px]">Notifications</div>
              <div className="text-[10.5px] text-muted-foreground mt-0.5">{unread} unread · {items.length} total</div>
            </div>
            <button
              onClick={() => setItems(items.map(i => ({ ...i, unread: false })))}
              className="text-[11px] font-semibold text-primary hover:underline"
            >
              Mark all read
            </button>
          </div>
          <div className="px-3 py-2 flex items-center gap-1.5 border-b border-border/60 bg-secondary/30">
            <button
              onClick={() => setFilter("all")}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition ${filter === "all" ? "bg-card border border-border text-foreground shadow-card" : "text-muted-foreground hover:text-foreground"}`}
            >All</button>
            <button
              onClick={() => setFilter("unread")}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition ${filter === "unread" ? "bg-card border border-border text-foreground shadow-card" : "text-muted-foreground hover:text-foreground"}`}
            >Unread</button>
            <div className="flex-1" />
            <button className="text-[11px] font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter
            </button>
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {list.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-secondary grid place-items-center mb-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-[13px] font-semibold">All caught up</div>
                <div className="text-[11.5px] text-muted-foreground mt-1">No unread notifications.</div>
              </div>
            ) : list.map(n => (
              <div key={n.id} className={`relative px-4 py-3 flex items-start gap-3 border-b border-border/40 last:border-0 hover:bg-secondary/30 transition ${n.unread ? "" : "opacity-70"}`}>
                {n.unread && <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-brand-gradient" />}
                <div className={`w-8 h-8 rounded-lg grid place-items-center shrink-0 ${toneCls[n.tone]}`}>
                  <n.icon className="w-3.5 h-3.5" strokeWidth={2.4} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-[12.5px] font-semibold leading-tight">{n.title}</div>
                    <div className="text-[10.5px] text-muted-foreground shrink-0">{n.time}</div>
                  </div>
                  <div className="text-[11.5px] text-muted-foreground mt-0.5 truncate">{n.body}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-border bg-secondary/20 flex items-center justify-between">
            <Link to="/logs" onClick={() => setOpen(false)} className="text-[11.5px] font-semibold text-primary hover:underline">Open activity log</Link>
            <Link to="/notifications" onClick={() => setOpen(false)} className="text-[11.5px] font-medium text-muted-foreground hover:text-foreground">Notification preferences</Link>
          </div>
        </div>
      )}
    </div>
  );
}

function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const items = [
    { icon: User, label: "Profile" },
    { icon: UserCircle, label: "Account" },
    { icon: CreditCard, label: "Billing" },
    { icon: Gauge, label: "Usage" },
    { icon: Receipt, label: "Subscription" },
    { icon: Shield, label: "Security" },
    
  ];
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-3 pl-3 pr-1.5 py-1.5 rounded-xl bg-card border border-border cursor-pointer hover:border-primary/20 transition"
      >
        <div className="text-right leading-tight hidden sm:block">
          <div className="text-[12.5px] font-semibold flex items-center justify-end gap-1.5">
            Abid Ali
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-gradient text-white">PRO</span>
          </div>
          <div className="text-[10.5px] text-muted-foreground">abid@abidalidev.com</div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-brand-gradient grid place-items-center text-white font-semibold text-[12px]">AA</div>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-[280px] rounded-2xl bg-card border border-border shadow-card-lg p-2 z-50">
          <div className="p-3 flex items-center gap-3 border-b border-border mb-2">
            <div className="w-11 h-11 rounded-xl bg-brand-gradient grid place-items-center text-white font-bold text-[14px]">AA</div>
            <div className="min-w-0">
              <div className="text-[13px] font-bold truncate flex items-center gap-1.5">
                Abid Ali
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-accent text-primary">PRO</span>
              </div>
              <div className="text-[11px] text-muted-foreground truncate">abid@abidalidev.com</div>
            </div>
          </div>
          {items.map(i => (
            <Link key={i.label} to="/account" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] hover:bg-secondary transition">
              <i.icon className="w-4 h-4 text-muted-foreground" />
              <span className="flex-1">{i.label}</span>
            </Link>
          ))}
          <div className="h-px bg-border my-2" />
          <Link to="/login" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-destructive hover:bg-destructive/5 transition">
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </Link>
        </div>
      )}
    </div>
  );
}

function Footer() {
  return (
    <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-[11.5px] text-muted-foreground">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="w-5 h-5 rounded-md bg-brand-gradient grid place-items-center shrink-0">
          <Wand2 className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
        </div>
        <span className="font-medium">VideoForge AI</span>
        <span className="hidden sm:inline">· v1.0.0 · Professional AI Video Studio</span>
      </div>
      <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
        <a href="https://abidalidev.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition">abidalidev.com</a>
        <a href="https://github.com/abidmmp" target="_blank" rel="noreferrer" className="hover:text-foreground transition">GitHub</a>
        <a href="https://linkedin.com/in/abidalidev" target="_blank" rel="noreferrer" className="hover:text-foreground transition">LinkedIn</a>
        <span>© 2026 Abid Ali</span>
      </div>
    </div>
  );
}

/* ============ Shared page primitives ============ */

export function PageHeader({ crumb, title, subtitle, actions }: { crumb: string[]; title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between pt-5 sm:pt-7 pb-5 sm:pb-6 gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[11.5px] sm:text-[12px] text-muted-foreground mb-2 flex-wrap">
          {crumb.map((c, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-border">/</span>}
              <span className={i === crumb.length - 1 ? "text-foreground font-medium" : ""}>{c}</span>
            </span>
          ))}
        </div>
        <h1 className="font-display font-extrabold text-[26px] sm:text-[30px] lg:text-[34px] leading-[1.05] tracking-tight break-words">{title}</h1>
        {subtitle && <p className="text-[12.5px] sm:text-[13.5px] text-muted-foreground mt-2 sm:mt-2.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap md:flex-nowrap md:shrink-0">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "", padding = "p-4 sm:p-6" }: { children: ReactNode; className?: string; padding?: string }) {
  return <div className={`rounded-2xl sm:rounded-3xl bg-card border border-border shadow-card ${padding} ${className}`}>{children}</div>;
}



export function SectionCard({ title, subtitle, right, children, defaultOpen = true, collapsible = true }: { title: string; subtitle?: string; right?: ReactNode; children: ReactNode; defaultOpen?: boolean; collapsible?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-3xl bg-card border border-border shadow-card overflow-hidden">
      <div className={`w-full flex items-center justify-between gap-4 px-6 py-5 ${collapsible ? "hover:bg-secondary/30" : ""} transition`}>
        {collapsible ? (
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            className="flex-1 min-w-0 text-left cursor-pointer flex items-center gap-3"
            aria-expanded={open}
          >
            <div className="min-w-0">
              <h3 className="font-display font-bold text-[16px] truncate">{title}</h3>
              {subtitle && <p className="text-[11.5px] text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition shrink-0 ${open ? "" : "-rotate-90"}`} />
          </button>
        ) : (
          <div className="flex-1 min-w-0 text-left">
            <h3 className="font-display font-bold text-[16px] truncate">{title}</h3>
            {subtitle && <p className="text-[11.5px] text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
          </div>
        )}
        {right && <div className="flex items-center gap-3 shrink-0">{right}</div>}
      </div>
      {open && <div className="px-6 pb-6 pt-1 border-t border-border/60">{children}</div>}
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <div className="text-[12px] font-semibold text-foreground mb-1.5">{label}</div>
      {children}
      {hint && <div className="text-[11px] text-muted-foreground mt-1.5">{hint}</div>}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full h-10 px-3.5 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition ${props.className ?? ""}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition resize-y ${props.className ?? ""}`} />;
}

export function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`w-full h-10 px-3 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition ${props.className ?? ""}`}>{children}</select>;
}

export function Toggle({ checked = false, onChange }: { checked?: boolean; onChange?: (v: boolean) => void }) {
  const [on, setOn] = useState(checked);
  return (
    <button
      onClick={() => { setOn(!on); onChange?.(!on); }}
      className={`relative w-10 h-6 rounded-full transition ${on ? "bg-brand-gradient" : "bg-secondary"}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition ${on ? "left-[18px]" : "left-0.5"}`} />
    </button>
  );
}

export function PrimaryButton({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={`h-11 px-5 rounded-xl bg-brand-gradient text-white text-[13px] font-semibold shadow-brand hover:opacity-95 transition flex items-center justify-center gap-2 ${className}`}>{children}</button>;
}

export function GhostButton({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={`h-11 px-5 rounded-xl bg-card border border-border text-[13px] font-semibold hover:bg-secondary transition flex items-center justify-center gap-2 ${className}`}>{children}</button>;
}

export function Pill({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "success" | "warning" | "primary" | "danger" }) {
  const tones = {
    default: "bg-secondary text-muted-foreground",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-amber-700",
    primary: "bg-accent text-primary",
    danger: "bg-destructive/10 text-destructive",
  } as const;
  return <span className={`inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-1 rounded-md ${tones[tone]}`}>{children}</span>;
}

export function Slider({ value = 50, min = 0, max = 100, onChange }: { value?: number; min?: number; max?: number; onChange?: (v: number) => void }) {
  const [v, setV] = useState(value);
  return (
    <input
      type="range" min={min} max={max} value={v}
      onChange={(e) => { const n = +e.target.value; setV(n); onChange?.(n); }}
      className="w-full accent-[#227850]"
    />
  );
}
