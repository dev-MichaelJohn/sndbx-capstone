import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
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
import { ExistingDeanSearch } from "./ExistingDeanSearch";
import { FormTextField } from "@/components/form-text-field";
import { useDeanSelection, useUpdateCollege } from "@/features/college/api/college.service";
import type { DeanCandidate } from "backend/types/college.types";
import { cn } from "@/lib/utils";
import { useEntityDialog } from "@/hooks/use-entity-dialog";

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
    validators: {
      onSubmit: UpdateCollegeRecord,
    },
    onSubmit: ({ value }) => handleFormSubmit({ value }),
  });

  const {
    open,
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
  } = useEntityDialog({
    form,
    mutationFn: mutateAsync,
    loadingText: "Saving college changes...",
    successText: "Changes saved successfully.",
    onReset: () => dean.reset(defaultSelectedDean),
  });

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

            <form.Subscribe
              selector={(state): DeanTabValue => state.values.dean?.type ?? "no-dean"}
              children={(activeTab) => (
                <Tabs
                  value={activeTab}
                  onValueChange={(v) => {
                    if (v !== "no-dean" && v !== "existing" && v !== "new") return;

                    if (v === "no-dean") {
                      form.setFieldValue("dean", undefined);
                      dean.setSelected(null);
                    } else if (v === "existing") {
                      const existingId = dean.selected?.account_id ?? defaultData.account_id;
                      if (existingId) {
                        form.setFieldValue("dean", { type: "existing", id: Number(existingId) });
                        if (!dean.selected && defaultSelectedDean) {
                          dean.setSelected(defaultSelectedDean);
                        }
                      } else {
                        form.setFieldValue("dean", { type: "existing", id: 0 });
                      }
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
                      dean.setSelected(null);
                    }
                  }}
                  className="w-full"
                >
                  <Label>Assign College Dean</Label>
                  <TabsList className="w-full">
                    <TabsTrigger value="no-dean">Keep Record</TabsTrigger>
                    <TabsTrigger value="existing">Existing Faculty</TabsTrigger>
                    <TabsTrigger value="new">New Faculty</TabsTrigger>
                  </TabsList>

                  <TabsContent value="existing" className="space-y-2">
                    <form.Field
                      name="dean"
                      validators={{
                        onChange: ({ value }) => {
                          if (value?.type === "existing" && (!value.id || value.id <= 0)) {
                            return "Please select a faculty member.";
                          }
                          return undefined;
                        },
                      }}
                      children={(field) => (
                        <div>
                          <ExistingDeanSearch
                            search={dean.search}
                            onSearchChange={dean.setSearch}
                            candidates={dean.candidates}
                            isSearching={dean.isSearching}
                            selected={dean.selected}
                            onSelect={(candidate) => {
                              const rawId = candidate.account_id ?? (candidate as any).id;
                              const parsedId = Number(rawId);

                              if (!parsedId || parsedId <= 0) return;

                              dean.setSelected(candidate);
                              form.setFieldValue("dean", {
                                type: "existing",
                                id: parsedId,
                              });
                            }}
                            onClear={() => {
                              dean.setSelected(null);
                              form.setFieldValue("dean", { type: "existing", id: 0 });
                            }}
                          />
                          {field.state.meta.errors.length > 0 && (
                            <p className="mt-1 text-xs text-destructive">
                              {field.state.meta.errors.join(", ")}
                            </p>
                          )}
                        </div>
                      )}
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
