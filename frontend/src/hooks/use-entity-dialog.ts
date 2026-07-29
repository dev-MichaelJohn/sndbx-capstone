import { useState } from "react";
import toast from "react-hot-toast";

interface MinimalFormApi {
  state: {
    isDirty: boolean;
    [key: string]: any;
  };
  reset: () => void;
  [key: string]: any;
}

interface UseEntityDialogOptions<TFormData, TForm extends MinimalFormApi = MinimalFormApi> {
  form: TForm;
  mutationFn: (values: TFormData) => Promise<any>;
  loadingText?: string;
  successText?: string;
  onReset?: () => void;
}

export function useEntityDialog<TFormData, TForm extends MinimalFormApi = MinimalFormApi>({
  form,
  mutationFn,
  loadingText = "Saving changes...",
  successText = "Changes saved successfully.",
  onReset,
}: UseEntityDialogOptions<TFormData, TForm>) {
  const [open, setOpen] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const [pendingValue, setPendingValue] = useState<TFormData | null>(null);

  const resetEverything = () => {
    form.reset();
    onReset?.();
    setPendingValue(null);
    setConfirmSaveOpen(false);
    setConfirmDiscardOpen(false);
  };

  const attemptClose = () => {
    if (form.state.isDirty) {
      setConfirmDiscardOpen(true);
      return;
    }
    setOpen(false);
    resetEverything();
  };

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setOpen(true);
      resetEverything();
      return;
    }
    attemptClose();
  };

  const confirmDiscard = () => {
    setConfirmDiscardOpen(false);
    setOpen(false);
    resetEverything();
  };

  const handleFormSubmit = ({ value }: { value: TFormData }) => {
    setPendingValue(value);
    setConfirmSaveOpen(true);
  };

  const confirmSave = async () => {
    if (!pendingValue) return;
    const toastId = toast.loading(loadingText);

    try {
      await mutationFn(pendingValue);
      toast.success(successText, { id: toastId });
      setConfirmSaveOpen(false);
      setOpen(false);
      resetEverything();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn't save changes. Please try again.",
        { id: toastId },
      );
      setConfirmSaveOpen(false);
    }
  };

  return {
    open,
    setOpen,
    confirmSaveOpen,
    setConfirmSaveOpen,
    confirmDiscardOpen,
    setConfirmDiscardOpen,
    pendingValue,
    handleOpenChange,
    attemptClose,
    confirmDiscard,
    confirmSave,
    handleFormSubmit,
  };
}
