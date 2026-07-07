import { useCallback, useEffect, useState } from "react";
import { GraduationCap, LogOut, Pencil } from "lucide-react";
import { LoginView } from "@/views/LoginView";
import { Sidebar } from "@/components/custom/Sidebar";
import { MobileNav } from "@/components/custom/MobileNav";
import { HomeView } from "@/views/HomeView";
import { ShortlistView } from "@/views/ShortListView";
import { HistoryView } from "@/views/HistoryView";
import type { View } from "./types";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/custom/LanguageContext";
import { LanguageSwitcher } from "@/components/custom/LangugeSwitcher";
import { EditProfileDialog } from "@/components/custom/EditProfileDialog";
import { ThemeToggle } from "@/components/custom/ThemeToggle";
import { seedDatabase } from "./db/seed";
import { updateApplicationForm, type EligibleDepartment } from "./db/queries";
import { toast, Toaster } from "sonner";
import { useTheme } from "next-themes";
import type { ApplicationForm } from "./db/schema";
import { clearSession, loadSession, saveSession } from "./helpers/session";

// ─── App Shell ────────────────────────────────────────────────────────────────

function AppShell() {
  const { t, dir, language } = useLanguage();
  const [loggedIn, setLoggedIn] = useState(() => !!loadSession());
  const [grade, setGrade] = useState(() => loadSession()?.grade ?? 0);
  const [name, setName] = useState(() => loadSession()?.name ?? "");
  const [view, setView] = useState<View>("home");
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState<EligibleDepartment[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [formId, setFormId] = useState(0);
  const [formLabel, setFormLabel] = useState("");
  const [isSeeding, setIsSeeding] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  useEffect(() => {
    // Seed the database when the app starts
    const initDb = async () => {
      try {
        await seedDatabase();
        setIsSeeding(false);
      } catch (err) {
        console.error("Failed to initialize database:", err);
        setError("Failed to load application data. Please refresh the page.");
        setIsSeeding(false);
      }
    };

    initDb();
  }, []);

  // Keep <html dir="..." lang="..."> in sync so native browser behavior
  // (scrollbars, text selection, form controls) follows the chosen language.
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [dir, language]);

  const handleLogin = (g: number, userName: string) => {
    setGrade(g);
    setName(userName);
    setLoggedIn(true);
    saveSession({ name: userName, grade: g });
  };

  const handleProfileUpdate = (userName: string, g: number) => {
    setName(userName);
    setGrade(g);
    saveSession({ name: userName, grade: g });
    toast.success(t("profileUpdated"), { position: "top-center" });
  };

  const handleSignOut = () => {
    setLoggedIn(false);
    setGrade(0);
    setName("");
    setSelected([]);
    setView("home");
    clearSession();
  };

  const syncFormChoices = useCallback(
    async (choices: EligibleDepartment[]) => {
      if (!editMode || !formId) return;
      try {
        await updateApplicationForm(formId, { choices });
      } catch (error) {
        console.error(`error detected: ${error}`);
        toast.error(t("generalError"), { position: "top-center" });
      }
    },
    [editMode, formId, t],
  );

  const setSelectedAndSync = useCallback(
    (value: EligibleDepartment[] | ((prev: EligibleDepartment[]) => EligibleDepartment[])) => {
      setSelected((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        if (editMode && formId) {
          void syncFormChoices(next);
        }
        return next;
      });
    },
    [editMode, formId, syncFormChoices],
  );

  const handleViewSession = (form: ApplicationForm) => {
    setFormId(form.id ?? 0);
    setFormLabel(form.label ?? "");
    setEditMode(true);
    setSelected(form.choices);
    setView("shortlist");
  };

  const handleNewForm = () => {
    setFormId(0);
    setFormLabel("");
    setEditMode(false);
    setSelected([]);
    setView("home");
  };

  const onFormSaved = () => {
    setSelected([]);
  };

  if (!loggedIn) {
    return <LoginView onLogin={handleLogin} />;
  }

  if (isSeeding) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading application data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      dir={dir}
      className="flex h-screen overflow-hidden bg-background"
    >
      <Sidebar
        view={view}
        setView={setView}
        name={name}
        grade={grade}
        shortlistCount={selected.length}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onSignOut={handleSignOut}
        onEditProfile={() => setProfileDialogOpen(true)}
      />

      <main className="flex-1 overflow-hidden flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between border-b border-border bg-card px-3 h-14 shrink-0 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <GraduationCap size={15} className="text-primary-foreground" />
            </div>
            <span className="text-base font-semibold text-foreground truncate">
              {t("appName")}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-28">
              <ThemeToggle compact />
            </div>
            <button
              type="button"
              onClick={() => setProfileDialogOpen(true)}
              className="flex items-center gap-1.5 h-9 px-2.5 text-sm font-medium text-foreground bg-input-background border border-input rounded-lg hover:bg-secondary transition-colors"
              title={t("editProfile")}
            >
              <span className="tabular-nums">{grade.toFixed(1)}%</span>
              <Pencil size={13} className="text-muted-foreground" />
            </button>
            <LanguageSwitcher compact />
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden pb-16 md:pb-0">
          {view === "home" && (
            <HomeView
              name={name}
              grade={grade}
              selected={selected}
              setSelected={setSelectedAndSync}
              editMode={editMode}
              formLabel={formLabel}
            />
          )}
          {view === "shortlist" && (
            <ShortlistView
              name={name}
              selected={selected}
              grade={grade}
              onDelete={async (id) => {
                const next = selected.filter((x) => x.thresholdId !== id);
                setSelected(next);
                if (editMode && formId) {
                  await syncFormChoices(next);
                }
              }}
              onFormSaved={onFormSaved}
              onFormUpdated={(label) => setFormLabel(label)}
              onReorder={async (newSelected) => {
                setSelected(newSelected);
                if (editMode && formId) {
                  await syncFormChoices(newSelected);
                }
              }}
              onAddPrograms={() => setView("home")}
              editMode={editMode}
              formId={formId || undefined}
              formLabel={formLabel}
            />
          )}
          {view === "history" && (
            <HistoryView
              name={name}
              grade={grade}
              onViewSession={handleViewSession}
              onNewForm={handleNewForm}
              clearSelection={() => setSelected([])}
            />
          )}
        </div>
      </main>

      <MobileNav
        view={view}
        setView={setView}
        shortlistCount={selected.length}
      />

      <EditProfileDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        name={name}
        grade={grade}
        onSave={handleProfileUpdate}
      />
    </div>
  );
}

export default function App() {
  const { theme = "system" } = useTheme();
  return (
    <LanguageProvider>
      <AppShell />
      <Toaster theme={theme as "light" | "dark" | "system"} />
    </LanguageProvider>
  );
}
