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
import { CreateCollegeRecord, type CreateCollegeRecordType } from "backend/types/college.types";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { ExistingDeanSearch } from "./existing-dean-search";
import { FormTextField } from "@/components/form-text-field";
import { useCreateCollege, useDeanSelection } from "@/features/sys/college.service";
import { Label } from "@/components/ui/label";

interface CollegeCreateDialogProps {
  icon: LucideIcon;
  triggerText: string;
}

type DeanTabValue = "no-dean" | "existing" | "new";

const initialFormData: CreateCollegeRecordType = {
  college: {
    name: "",
    initialism: "",
  },
  dean: undefined,
};

export const CollegeCreateDialog = ({ icon: Icon, triggerText }: CollegeCreateDialogProps) => {
  const [open, setOpen] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const [pendingValue, setPendingValue] = useState<CreateCollegeRecordType | null>(null);

  const { mutateAsync, isPending } = useCreateCollege();
  const dean = useDeanSelection(null);

  const form = useForm({
    defaultValues: initialFormData,
    validators: { onSubmit: CreateCollegeRecord },
    onSubmit: async ({ value }) => {
      setPendingValue(value);
      setConfirmSaveOpen(true);
    },
  });

  const resetEverything = () => {
    form.reset();
    dean.reset(null);
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
    const toastId = toast.loading("Creating college record...");
    try {
      await mutateAsync(pendingValue);
      toast.success("College created successfully.", { id: toastId });
      setConfirmSaveOpen(false);
      setOpen(false);
      resetEverything();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create college. Please try again.",
        { id: toastId },
      );
      setConfirmSaveOpen(false);
    }
  };

  const deanChangeSummary = (() => {
    if (!pendingValue?.dean) {
      return "This college will be created without an assigned dean.";
    }
    if (pendingValue.dean.type === "existing") {
      return dean.selected
        ? `${formatFullName({
            first_name: dean.selected.first_name,
            middle_name: dean.selected.middle_name,
            last_name: dean.selected.last_name,
            suffix: dean.selected.suffix,
          })} will be assigned as the dean.`
        : "The selected faculty member will be assigned as the dean.";
    }
    const { first_name, last_name } = pendingValue.dean.details.personalDetails;
    return `A new faculty record for ${first_name} ${last_name} will be created and assigned as dean.`;
  })();

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button size="sm" className="h-8 rounded-lg text-xs font-medium">
            <Icon className="mr-1.5 size-3.5" />
            <span className="leading-none text-sm">{triggerText}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create College</DialogTitle>
            <DialogDescription>
              Add a new college record and optionally assign a dean.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <form.Field
              name="college.name"
              children={(field) => (
                <FormTextField
                  field={field}
                  label="College Name"
                  disabled={isPending}
                  placeholder="e.g. College of Technology and Engineering"
                />
              )}
            />
            <form.Field
              name="college.initialism"
              children={(field) => (
                <FormTextField
                  field={field}
                  label="Initialism"
                  disabled={isPending}
                  placeholder="e.g. COTE"
                />
              )}
            />

            <form.Subscribe
              selector={(state): DeanTabValue => state.values.dean?.type ?? "no-dean"}
              children={(activeTab) => (
                <Tabs
                  value={activeTab}
                  onValueChange={(v) => {
                    if (v !== "no-dean" && v !== "existing" && v !== "new") return;

                    if (v === "no-dean") {
                      form.setFieldValue("dean", undefined);
                    } else if (v === "existing") {
                      form.setFieldValue("dean", { type: "existing", id: 0 });
                    } else {
                      form.setFieldValue("dean", {
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
                    dean.reset(v === "existing" ? dean.selected : null);
                  }}
                  className="w-full mt-2"
                >
                  <Label>Assign College Dean</Label>
                  <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="no-dean">No Dean</TabsTrigger>
                    <TabsTrigger value="existing">Existing Faculty</TabsTrigger>
                    <TabsTrigger value="new">New Faculty</TabsTrigger>
                  </TabsList>

                  <TabsContent value="existing" className="space-y-2 mt-3">
                    <ExistingDeanSearch
                      search={dean.search}
                      onSearchChange={dean.setSearch}
                      candidates={dean.candidates}
                      isSearching={dean.isSearching}
                      selected={dean.selected}
                      onSelect={(candidate) => {
                        form.setFieldValue("dean", {
                          type: "existing",
                          id: candidate.account_id,
                        });
                        dean.setSelected(candidate);
                      }}
                      onClear={() => {
                        dean.setSelected(null);
                        form.setFieldValue("dean", { type: "existing", id: 0 });
                      }}
                    />
                  </TabsContent>

                  <TabsContent value="new" className="space-y-3 mt-3">
                    <form.Field
                      name="dean.details.credentials.email"
                      children={(field) =>
                        field.state.value === undefined ? null : (
                          <FormTextField
                            field={field}
                            label="Email"
                            type="email"
                            disabled={isPending}
                            placeholder="dean@school.edu"
                          />
                        )
                      }
                    />
                    <form.Field
                      name="dean.details.personalDetails.institutional_id"
                      children={(field) =>
                        field.state.value === undefined ? null : (
                          <FormTextField
                            field={field}
                            label="Institutional ID"
                            disabled={isPending}
                            placeholder="e.g. 2021-00123"
                          />
                        )
                      }
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <form.Field
                        name="dean.details.personalDetails.first_name"
                        children={(field) =>
                          field.state.value === undefined ? null : (
                            <FormTextField field={field} label="First Name" disabled={isPending} />
                          )
                        }
                      />
                      <form.Field
                        name="dean.details.personalDetails.last_name"
                        children={(field) =>
                          field.state.value === undefined ? null : (
                            <FormTextField field={field} label="Last Name" disabled={isPending} />
                          )
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <form.Field
                        name="dean.details.personalDetails.middle_name"
                        children={(field) =>
                          field.state.value === undefined ? null : (
                            <FormTextField field={field} label="Middle Name" disabled={isPending} />
                          )
                        }
                      />
                      <form.Field
                        name="dean.details.personalDetails.suffix"
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
                  {isPending ? "Creating..." : "Create College"}
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
            <AlertDialogTitle>Create new college?</AlertDialogTitle>
            <AlertDialogDescription>{deanChangeSummary}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Go back</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave} disabled={isPending}>
              {isPending ? "Creating..." : "Yes, create college"}
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
