import { History, Pencil, Trash2, Plus } from "lucide-react";
import { formatDate } from "@/helpers";
import { useLanguage } from "@/components/custom/LanguageContext";
import {
  deleteApplicationForm,
  listApplicationForms,
} from "@/db/queries";
import { useEffect, useState } from "react";
import type { ApplicationForm } from "@/db/schema";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function HistoryView({
  grade,
  onViewSession,
  onNewForm,
  clearSelection,
}: {
  name: string;
  grade: number;
  onViewSession: (form: ApplicationForm) => void;
  onNewForm: () => void;
  clearSelection: () => void;
}) {
  const { t, language } = useLanguage();
  const [forms, setForms] = useState<ApplicationForm[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadForms = () => {
    setIsLoading(true);
    listApplicationForms()
      .then((data) => {
        setForms(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Dexie fetch failed:", err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadForms();
  }, [grade]);

  const onDeleteSession = async (formId: number) => {
    try {
      await deleteApplicationForm(formId);
      toast.success(t("deletionMessage"), {
        position: "top-center",
        className: "bg-background",
      });
      setForms((prev) => prev.filter((f) => f.id !== formId));
      clearSelection();
    } catch (error) {
      toast.error(t("generalError"), { position: "top-center" });
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-foreground mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading application data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">{t("historyTitle")}</h1>
            <p className="page-subtitle">{t("historySubtitle")}</p>
          </div>
          <div className="page-actions">
            <Button className="page-action-btn" onClick={onNewForm}>
              <Plus size={15} />
              {t("newForm")}
            </Button>
          </div>
        </div>
      </div>

      <div className="page-content">
        {!forms.length ? (
          <div className="empty-state">
            <History size={36} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">{t("noHistoryYet")}</p>
            <p className="text-xs mt-1 mb-4">{t("noHistoryHint")}</p>
            <Button onClick={onNewForm}>
              <Plus size={15} />
              {t("newForm")}
            </Button>
          </div>
        ) : (
          <div className="space-y-3 max-w-2xl">
            {forms.map((s) => (
              <div
                key={s.id}
                className="bg-card border border-border rounded-xl p-4 shadow-sm hover:border-foreground/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                      <History size={16} className="text-accent-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {s.label || formatDate(s.createdAt.toISOString(), language)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {s.label
                          ? formatDate(s.createdAt.toISOString(), language)
                          : null}
                        {s.label ? " · " : ""}
                        {t("gradeLabel")}{" "}
                        <span className="font-semibold text-foreground">
                          {s.studentGrade.toFixed(1)}%
                        </span>
                        {" · "}
                        <span className="font-semibold text-foreground">
                          {s.choices.length}
                        </span>{" "}
                        {t("facultiesChosen")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onViewSession(s)}
                      className="flex items-center gap-1.5 h-10 px-4 rounded-lg border border-border bg-secondary text-sm font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      <Pencil size={14} />
                      {t("editForm")}
                    </button>
                    <button
                      onClick={() => onDeleteSession(s.id ?? 0)}
                      className="flex items-center justify-center h-10 w-10 rounded-lg border border-border bg-secondary text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                      title={t("removeProgram")}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex flex-wrap gap-1.5">
                    {s.choices.slice(0, 5).map((p) => (
                      <span
                        key={p.thresholdId}
                        className="text-xs px-2 py-0.5 rounded-md bg-secondary text-muted-foreground border border-border"
                      >
                        {p.facultyName} · {p.universityName.split(" ")[0]}
                      </span>
                    ))}
                    {s.choices.length > 5 && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-secondary text-muted-foreground border border-border">
                        {t("moreCount", { count: s.choices.length - 5 })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
