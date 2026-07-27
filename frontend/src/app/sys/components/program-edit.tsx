import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import toast from "react-hot-toast";
import type { LucideIcon } from "lucide-react";
import { formatFullName } from "@/lib/nameFormatter";
import { cn } from "@/lib/utils";
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
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormTextField } from "./form-text-field";
import { ExistingChairSearch } from "./existing-program-search";
import { useChairSelection, useUpdateProgram } from "@/features/sys/program.service";
import {
  UpdateProgram,
  type ProgramWithChairType,
  type UpdateProgramType,
  type ChairCandidateType,
} from "backend/types/program.type"; // Adjust import paths

interface ProgramEditDialogProps {
  icon: LucideIcon;
  triggerText: string;
  defaultData: ProgramWithChairType;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
}

type ChairTabValue = "no-chair" | "existing" | "new";

export const ProgramEditDialog = ({
  icon: Icon,
  triggerText,
  defaultData,
  variant = "ghost",
  className,
}: ProgramEditDialogProps) => {
  const [open, setOpen] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const [pendingValue, setPendingValue] = useState<UpdateProgramType | null>(null);

  const { mutateAsync, isPending } = useUpdateProgram();

  const defaultSelectedChair: ChairCandidateType | null = defaultData.account_id
    ? {
        account_id: defaultData.account_id,
        first_name: defaultData.first_name,
        last_name: defaultData.last_name,
        middle_name: defaultData.middle_name,
        suffix: defaultData.suffix,
        institutional_id: defaultData.institutional_id,
      }
    : null;

  const chair = useChairSelection(defaultSelectedChair);

  const defaultFormData: UpdateProgramType = {
    program_id: defaultData.id,
    program: {
      college_id: defaultData.college_id,
      name: defaultData.name,
      initialism: defaultData.initialism,
    },
    chair: defaultData.account_id ? { type: "existing", id: defaultData.account_id } : undefined,
  };

  const form = useForm({
    defaultValues: defaultFormData,
    validators: { onSubmit: UpdateProgram },
    onSubmit: async ({ value }) => {
      setPendingValue(value);
      setConfirmSaveOpen(true);
    },
  });

  const resetEverything = () => {
    form.reset();
    chair.reset(defaultSelectedChair);
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
    const toastId = toast.loading("Saving program changes...");
    try {
      await mutateAsync(pendingValue);
      toast.success("Program updated successfully.", { id: toastId });
      setConfirmSaveOpen(false);
      setOpen(false);
      resetEverything();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update program. Please try again.",
        { id: toastId },
      );
      setConfirmSaveOpen(false);
    }
  };

  const chairChangeSummary = (() => {
    if (!pendingValue?.chair) {
      return "This program will be left without an assigned program chair.";
    }
    if (pendingValue.chair.type === "existing") {
      return chair.selected
        ? `${formatFullName({
            first_name: chair.selected.first_name,
            middle_name: chair.selected.middle_name,
            last_name: chair.selected.last_name,
            suffix: chair.selected.suffix,
          })} will be assigned as program chair.`
        : "The selected faculty member will be assigned as program chair.";
    }
    const { first_name, last_name } = pendingValue.chair.details.personalDetails;
    return `A new faculty record for ${first_name} ${last_name} will be created and assigned as program chair.`;
  })();

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant={variant}
            size="sm"
            className={cn(
              "w-full h-full min-h-8 justify-start px-2 py-1.5 text-xs font-normal cursor-pointer rounded-sm text-primary hover:bg-primary/10 hover:text-primary focus-visible:outline-none",
              className,
            )}
          >
            <Icon className="mr-2 size-3.5" />
            {triggerText}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Program</DialogTitle>
            <DialogDescription>
              Update program information or reassign the program chair.
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
                  placeholder="e.g. Bachelor of Science in Information Technology"
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
                  placeholder="e.g. BSIT"
                />
              )}
            />

            {/* Read-only Current Chair Display */}
            <Field>
              <Label htmlFor="current-program-chair">Program Chair</Label>
              <Input
                type="text"
                id="current-program-chair"
                value={
                  formatFullName({
                    first_name: defaultData.first_name,
                    middle_name: defaultData.middle_name,
                    last_name: defaultData.last_name,
                    suffix: defaultData.suffix,
                  }) ?? "-"
                }
                disabled
              />
            </Field>

            <form.Subscribe
              selector={(state): ChairTabValue => state.values.chair?.type ?? "no-chair"}
              children={(activeTab) => (
                <Tabs
                  value={activeTab}
                  onValueChange={(v) => {
                    if (v !== "no-chair" && v !== "existing" && v !== "new") return;

                    if (v === "no-chair") {
                      form.setFieldValue("chair", undefined);
                    } else if (v === "existing") {
                      form.setFieldValue("chair", {
                        type: "existing",
                        id: 0,
                      });
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
                    }
                    chair.reset(v === "existing" ? chair.selected : null);
                  }}
                  className="w-full mt-2"
                >
                  <Label>Assign Program Chair</Label>
                  <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="no-chair">Keep Record</TabsTrigger>
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
                        form.setFieldValue("chair", {
                          type: "existing",
                          id: candidate.account_id,
                        });
                        chair.setSelected(candidate);
                      }}
                      onClear={() => {
                        chair.setSelected(null);
                        form.setFieldValue("chair", {
                          type: "existing",
                          id: 0,
                        });
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
              Discard changes
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting] as const}
              children={([canSubmit]) => (
                <Button
                  type="button"
                  disabled={!canSubmit || isPending}
                  onClick={() => form.handleSubmit()}
                >
                  {isPending ? "Saving..." : "Save changes"}
                </Button>
              )}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <AlertDialog open={confirmSaveOpen} onOpenChange={setConfirmSaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm program changes?</AlertDialogTitle>
            <AlertDialogDescription>{chairChangeSummary}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Go back</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave} disabled={isPending}>
              {isPending ? "Saving..." : "Yes, save changes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Discard Confirmation Modal */}
      <AlertDialog open={confirmDiscardOpen} onOpenChange={setConfirmDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved edits to this program record. Closing now will lose them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDiscard}>Discard changes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
