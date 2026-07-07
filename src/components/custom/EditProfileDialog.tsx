import { useEffect, useState } from "react";
import { useLanguage } from "./LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  grade: number;
  onSave: (name: string, grade: number) => void;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  name,
  grade,
  onSave,
}: EditProfileDialogProps) {
  const { t } = useLanguage();
  const [nameInput, setNameInput] = useState(name);
  const [gradeInput, setGradeInput] = useState(String(grade));
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setNameInput(name);
      setGradeInput(String(grade));
      setError("");
    }
  }, [open, name, grade]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(gradeInput);
    if (isNaN(val) || val < 50 || val > 100) {
      setError(t("loginError"));
      return;
    }
    if (!nameInput.trim()) {
      setError(t("loginNameError"));
      return;
    }
    onSave(nameInput.trim(), val);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("editProfileTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("loginNameLabel")}
            </label>
            <input
              type="text"
              maxLength={50}
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                setError("");
              }}
              className="w-full h-10 px-3 rounded-lg border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("loginGradeLabel")}
            </label>
            <input
              type="number"
              step="0.1"
              min="50"
              max="100"
              value={gradeInput}
              onChange={(e) => {
                setGradeInput(e.target.value);
                setError("");
              }}
              className="w-full h-10 px-3 rounded-lg border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("cancelText")}
            </Button>
            <Button type="submit">{t("saveProfile")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
