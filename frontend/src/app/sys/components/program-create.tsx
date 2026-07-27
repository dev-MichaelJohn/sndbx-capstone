import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatFullName } from "@/lib/nameFormatter";
import { useForm } from "@tanstack/react-form";
import { CreateProgram, type CreateProgramType } from "backend/types/program.type";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { ExistingChairSearch } from "./existing-program-search";
import { FormTextField } from "./form-text-field";
import { useChairSelection, useCreateProgram } from "@/features/sys/program.service";
import { Label } from "@/components/ui/label";

interface ProgramCreateDialogProps {
  collegeId: number;
  icon: LucideIcon;
  triggerText: string;
}

type ChairTabValue = "no-chair" | "existing" | "new";

export const ProgramCreateDialog = ({
  collegeId,
  icon: Icon,
  triggerText,
}: ProgramCreateDialogProps) => {
  const [open, setOpen] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const [pendingValue, setPendingValue] = useState<CreateProgramType | null>(null);

  const { mutateAsync, isPending } = useCreateProgram();
  const chair = useChairSelection(null);

  const initialFormData: CreateProgramType = {
    program: {
      college_id: collegeId,
      name: "",
      initialism: "",
    },
    chair: undefined,
  };

  const form = useForm({
    defaultValues: initialFormData,
    validators: { onSubmit: CreateProgram },
    onSubmit: async ({ value }) => {
      setPendingValue(value);
      setConfirmSaveOpen(true);
    },
  });

  const resetEverything = () => {
    form.reset();
    chair.reset(null);
    setPendingValue(null);
    setConfirmSaveOpen(false);
    setConfirmDiscardOpen(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setOpen(true);
      resetEverything();
      return;
    }
    attemptClose();
  };

  const attemptClose = () => {
    if (form.state.isDirty) {
      setConfirmDiscardOpen(true);
      return;
    }
    setOpen(false);
    resetEverything();
  };

  const confirmDiscard = () => {
    setConfirmDiscardOpen(false);
    setOpen(false);
    resetEverything();
  };

  const confirmSave = async () => {
    if (!pendingValue) return;
    const toastId = toast.loading("Creating program record...");
    try {
      await mutateAsync(pendingValue);
      toast.success("Program created successfully.", { id: toastId });
      setConfirmSaveOpen(false);
      setOpen(false);
      resetEverything();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create program. Please try again.",
        { id: toastId },
      );
      setConfirmSaveOpen(false);
    }
  };

  const chairChangeSummary = (() => {
    if (!pendingValue?.chair) {
      return "This program will be created without an assigned program chair.";
    }
    if (pendingValue.chair.type === "existing") {
      return chair.selected
        ? `${formatFullName({
            first_name: chair.selected.first_name,
            middle_name: chair.selected.middle_name,
            last_name: chair.selected.last_name,
            suffix: chair.selected.suffix,
          })} will be assigned as the program chair.`
        : "The selected faculty member will be assigned as the program chair.";
    }
    const { first_name, last_name } = pendingValue.chair.details.personalDetails;
    return `A new faculty record for ${first_name} ${last_name} will be created and assigned as program chair.`;
  })();

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button type="button" className="rounded-lg p-4 flex items-center justify-center gap-1">
            <Icon className="size-3.5" />
            <span className="leading-none text-sm">{triggerText}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Program</DialogTitle>
            <DialogDescription>
              Add a new academic program and optionally assign a program chair.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <form.Field
              name="program.name"
              children={(field) => (
                <FormTextField
                  field={field}
                  label="Program Name"
                  disabled={isPending}
                  placeholder="e.g. Bachelor of Science in Civil Engineering"
                />
              )}
            />
            <form.Field
              name="program.initialism"
              children={(field) => (
                <FormTextField
                  field={field}
                  label="Initialism / Code"
                  disabled={isPending}
                  placeholder="e.g. BSCE"
                />
              )}
            />

            <form.Subscribe
              selector={(state): ChairTabValue => state.values.chair?.type ?? "no-chair"}
              children={(activeTab) => (
                <Tabs
                  value={activeTab}
                  className="w-full mt-2"
                  onValueChange={(v) => {
                    if (v !== "no-chair" && v !== "existing" && v !== "new") return;

                    if (v === "no-chair") {
                      form.setFieldValue("chair", undefined);
                      chair.reset(null);
                    } else if (v === "existing") {
                      const existingId = chair.selected?.account_id ?? 0;
                      form.setFieldValue("chair", { type: "existing", id: existingId });
                    } else {
                      form.setFieldValue("chair", {
                        type: "new",
                        details: {
                          credentials: { email: "" },
                          personalDetails: {
                            institutional_id: "",
                            first_name: "",
                            last_name: "",
                            middle_name: "",
                            suffix: "",
                          },
                        },
                      });
                      chair.reset(null);
                    }
                  }}
                >
                  <Label>Assign Program Chair</Label>
                  <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="no-chair">No Chair</TabsTrigger>
                    <TabsTrigger value="existing">Existing Faculty</TabsTrigger>
                    <TabsTrigger value="new">New Faculty</TabsTrigger>
                  </TabsList>

                  <TabsContent value="existing" className="space-y-2 mt-3">
                    <ExistingChairSearch
                      search={chair.search}
                      onSearchChange={chair.setSearch}
                      candidates={chair.candidates}
                      isSearching={chair.isSearching}
                      selected={chair.selected}
                      onSelect={(candidate) => {
                        const targetId = Number(candidate.account_id);

                        // Set field value directly in TanStack Form state
                        form.setFieldValue("chair", {
                          type: "existing",
                          id: targetId,
                        });
                        chair.setSelected(candidate);
                      }}
                      onClear={() => {
                        chair.setSelected(null);
                        form.setFieldValue("chair", { type: "existing", id: 0 });
                      }}
                    />
                  </TabsContent>

                  <TabsContent value="new" className="space-y-3 mt-3">
                    <form.Field
                      name="chair.details.credentials.email"
                      children={(field) =>
                        field.state.value === undefined ? null : (
                          <FormTextField
                            field={field}
                            label="Email"
                            type="email"
                            disabled={isPending}
                            placeholder="chair@school.edu"
                          />
                        )
                      }
                    />
                    <form.Field
                      name="chair.details.personalDetails.institutional_id"
                      children={(field) =>
                        field.state.value === undefined ? null : (
                          <FormTextField
                            field={field}
                            label="Institutional ID"
                            disabled={isPending}
                            placeholder="e.g. 2021-00456"
                          />
                        )
                      }
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <form.Field
                        name="chair.details.personalDetails.first_name"
                        children={(field) =>
                          field.state.value === undefined ? null : (
                            <FormTextField field={field} label="First Name" disabled={isPending} />
                          )
                        }
                      />
                      <form.Field
                        name="chair.details.personalDetails.last_name"
                        children={(field) =>
                          field.state.value === undefined ? null : (
                            <FormTextField field={field} label="Last Name" disabled={isPending} />
                          )
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <form.Field
                        name="chair.details.personalDetails.middle_name"
                        children={(field) =>
                          field.state.value === undefined ? null : (
                            <FormTextField field={field} label="Middle Name" disabled={isPending} />
                          )
                        }
                      />
                      <form.Field
                        name="chair.details.personalDetails.suffix"
                        children={(field) =>
                          field.state.value === undefined ? null : (
                            <FormTextField
                              field={field}
                              label="Suffix"
                              disabled={isPending}
                              placeholder="Jr., Sr., III"
                            />
                          )
                        }
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={attemptClose} disabled={isPending}>
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting] as const}
              children={([canSubmit]) => (
                <Button
                  type="button"
                  disabled={!canSubmit || isPending}
                  onClick={() => form.handleSubmit()}
                >
                  {isPending ? "Creating..." : "Create Program"}
                </Button>
              )}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Confirmation Modal */}
      <AlertDialog open={confirmSaveOpen} onOpenChange={setConfirmSaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create new program?</AlertDialogTitle>
            <AlertDialogDescription>{chairChangeSummary}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Go back</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave} disabled={isPending}>
              {isPending ? "Creating..." : "Yes, create program"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Discard Confirmation Modal */}
      <AlertDialog open={confirmDiscardOpen} onOpenChange={setConfirmDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved input in this form. Closing now will discard your entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDiscard}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
