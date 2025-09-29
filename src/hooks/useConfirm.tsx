import { JSX, useState } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";

export const useConfirm = (
  title: string,
  message: string,
  variant: ButtonProps["variant"] = "default"
): [() => JSX.Element, () => Promise<unknown>] => {
  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = () => {
    return new Promise((resolve) => {
      setPromise({ resolve });
    });
  };

  const handleClose = () => {
    setPromise(null);
  };

  const handleConfirm = () => {
    promise?.resolve(true);
    handleClose();
  };

  const handleCancel = () => {
    promise?.resolve(false);
    handleClose();
  };

  const ConfirmationDialog = () => (
    <ResponsiveModal open={promise !== null} onOpenChange={handleClose}>
      <DialogTitle className="sr-only">{title}</DialogTitle>
      <DialogDescription className="sr-only">{message}</DialogDescription>
      <Card className="w-full h-full border-none shadow-none">
        <CardContent className="pt-8">
          <CardHeader className="p-0">
            <h2 className="text-lg leading-none font-semibold">{title}</h2>
            <p className="text-muted-foreground text-sm">{message}</p>
          </CardHeader>

          <div className="pt-4 w-full flex flex-col gap-y-2 lg:flex-row gap-x-2 items-center justify-end">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="w-full lg:w-auto cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              variant={variant}
              className="w-full lg:w-auto cursor-pointer"
            >
              Confirm
            </Button>
          </div>
        </CardContent>
      </Card>
    </ResponsiveModal>
  );

  return [ConfirmationDialog, confirm];
};
