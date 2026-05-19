import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function PlaceholderDialog({
  open,
  onOpenChange,
  title,
  description,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 bg-[oklch(0.96_0.005_230)]">
        <DialogHeader className="bg-[var(--erp-header)] text-white px-4 py-2">
          <DialogTitle className="text-white text-sm font-normal">{title}</DialogTitle>
        </DialogHeader>
        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            {description ?? `${title} is configured in this build. Forms, validations and reports for this option are part of the full ERP rollout.`}
          </p>
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}