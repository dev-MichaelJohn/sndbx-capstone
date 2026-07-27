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
import { formatFullName } from "@/lib/nameFormatter";
import { useForm } from "@tanstack/react-form";
import {
  UpdateCollegeRecord,
  type CollegeWithDean,
  type UpdateCollegeRecordType,
} from "backend/types/college.types";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { ExistingDeanSearch } from "./existing-dean-search";
import { FormTextField } from "./form-text-field";
import { useDeanSelection } from "@/features/sys/college.service";
import { useUpdateCollege } from "@/features/sys/college.service";
import type { DeanCandidate } from "backend/types/college.types";
import { cn } from "@/lib/utils";

interface CollegeEditDialogProps {
  icon: LucideIcon;
  triggerText: string;
  defaultData: CollegeWithDean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
}

type DeanTabValue = "no-dean" | "existing" | "new";

export const CollegeEditDialog = ({
  icon: Icon,
  triggerText,
  defaultData,
  variant = "ghost",
  className,
}: CollegeEditDialogProps) => {
  const [open, setOpen] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const [pendingValue, setPendingValue] = useState<UpdateCollegeRecordType | null>(null);
  const { mutateAsync, isPending } = useUpdateCollege();

  const defaultSelectedDean: DeanCandidate | null = defaultData.account_id
    ? {
        account_id: defaultData.account_id,
        first_name: defaultData.first_name,
        last_name: defaultData.last_name,
        middle_name: defaultData.middle_name,
        suffix: defaultData.suffix,
        institutional_id: defaultData.institutional_id,
        is_college_dean: true,
      }
    : null;

  const dean = useDeanSelection(defaultSelectedDean);

  const defaultFormData: UpdateCollegeRecordType = {
    collegeId: defaultData.id,
    college: {
      name: defaultData.name,
      initialism: defaultData.initialism,
    },
    dean: defaultData.account_id ? { type: "existing", id: defaultData.account_id } : undefined,
  };

  const form = useForm({
    defaultValues: defaultFormData,
    validators: { onSubmit: UpdateCollegeRecord },
    onSubmit: async ({ value }) => {
      // Validation already passed at this point — hold here and let the
      // AlertDialog confirm before anything actually reaches the server.
      setPendingValue(value);
      setConfirmSaveOpen(true);
    },
  });

  const resetEverything = () => {
    form.reset();
    dean.reset();
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
    // Closing via Esc / overlay click / X button goes through the same
    // dirty-check as the Cancel button, so an accidental click can't
    // silently drop changes.
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
    const toastId = toast.loading("Saving college changes...");
    try {
      await mutateAsync(pendingValue);
      toast.success("Changes saved successfully.", { id: toastId });
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

  // Human-readable summary of the dean-assignment consequence, shown in the
  // confirmation dialog so reassigning a dean isn't a one-click surprise.
  const deanChangeSummary = (() => {
    if (!pendingValue?.dean) {
      return "This college will be left without an assigned dean.";
    }
    if (pendingValue.dean.type === "existing") {
      return dean.selected
        ? `${formatFullName({
            first_name: dean.selected.first_name,
            middle_name: dean.selected.middle_name,
            last_name: dean.selected.last_name,
            suffix: dean.selected.suffix,
          })} will be assigned as dean of this college.`
        : "The selected faculty member will be assigned as dean of this college.";
    }
    const { first_name, last_name } = pendingValue.dean.details.personalDetails;
    return `A new faculty record for ${first_name} ${last_name} will be created and assigned as dean.`;
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
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit College</DialogTitle>
            <DialogDescription>
              Update college information or reassign the college dean.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <form.Field
              name="college.name"
              children={(field) => (
                <FormTextField
                  field={field}
                  label="Name"
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
            <Field>
              <Label htmlFor="college-dean">College Dean</Label>
              <Input
                type="text"
                id="college-dean"
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

            <Label>Assign Dean</Label>
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
                  className="w-full"
                >
                  <TabsList className="w-full">
                    <TabsTrigger value="no-dean">Keep Record</TabsTrigger>
                    <TabsTrigger value="existing">Existing Faculty</TabsTrigger>
                    <TabsTrigger value="new">New Faculty</TabsTrigger>
                  </TabsList>

                  <TabsContent value="existing" className="space-y-2">
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

                  <TabsContent value="new" className="space-y-4">
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
              Discard changes
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting, state.errors] as const}
              children={([canSubmit, errors]) => {
                console.log("canSubmit:", canSubmit, "errors:", errors);
                return (
                  <Button
                    type="button"
                    disabled={!canSubmit || isPending}
                    onClick={() => {
                      console.log("Save clicked");
                      form.handleSubmit();
                    }}
                  >
                    {isPending ? "Saving..." : "Save changes"}
                  </Button>
                );
              }}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save confirmation — the deliberate friction point before mutation */}
      <AlertDialog open={confirmSaveOpen} onOpenChange={setConfirmSaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm college changes?</AlertDialogTitle>
            <AlertDialogDescription>{deanChangeSummary}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Go back</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave} disabled={isPending}>
              {isPending ? "Saving..." : "Yes, save changes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Discard confirmation — only triggered when the form is actually dirty */}
      <AlertDialog open={confirmDiscardOpen} onOpenChange={setConfirmDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved edits to this college record. Closing now will lose them.
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
