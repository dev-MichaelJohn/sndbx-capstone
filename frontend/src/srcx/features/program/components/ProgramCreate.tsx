import { useForm } from "@tanstack/react-form";
import type { LucideIcon } from "lucide-react";
import { formatFullName } from "@/srcx/lib/nameFormatter";
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
import { Label } from "@/components/ui/label";
import { FormTextField } from "@/components/form-text-field";
import { ExistingChairSearch } from "./ExistingChairSearch";
import { useChairSelection, useCreateProgram } from "@/srcx/features/program/api/program.service";
import { CreateProgram, type CreateProgramType } from "backend/types/program.type";
import { useEntityDialog } from "@/hooks/use-entity-dialog";

interface ProgramCreateDialogProps {
  collegeId: number;
  icon: LucideIcon;
  triggerText: string;
}

const emptyChairDetails = {
  credentials: { email: "" },
  personalDetails: {
    institutional_id: "",
    first_name: "",
    last_name: "",
    middle_name: "",
    suffix: "",
  },
};

export const ProgramCreateDialog = ({
  collegeId,
  icon: Icon,
  triggerText,
}: ProgramCreateDialogProps) => {
  const { mutateAsync, isPending } = useCreateProgram();
  const chair = useChairSelection(null);

  const initialFormData: CreateProgramType = {
    program: { college_id: collegeId, name: "", initialism: "" },
    chair: undefined,
  };

  const form = useForm({
    defaultValues: initialFormData,
    validators: { onSubmit: CreateProgram },
    onSubmit: (values) => dialog.handleFormSubmit(values),
  });

  const dialog = useEntityDialog<CreateProgramType>({
    form,
    mutationFn: mutateAsync,
    loadingText: "Creating program record...",
    successText: "Program created successfully.",
    onReset: () => chair.reset(null),
  });

  const handleTabChange = (v: string) => {
    if (v === "no-chair") {
      form.setFieldValue("chair", undefined);
      chair.reset(null);
    } else if (v === "existing") {
      form.setFieldValue("chair", { type: "existing", id: chair.selected?.account_id ?? 0 });
    } else if (v === "new") {
      form.setFieldValue("chair", { type: "new", details: emptyChairDetails });
      chair.reset(null);
    }
  };

  const chairChangeSummary = (() => {
    if (!dialog.pendingValue?.chair)
      return "This program will be created without an assigned program chair.";
    if (dialog.pendingValue.chair.type === "existing") {
      return chair.selected
        ? `${formatFullName(chair.selected)} will be assigned as the program chair.`
        : "The selected faculty member will be assigned as the program chair.";
    }
    const { first_name, last_name } = dialog.pendingValue.chair.details.personalDetails;
    return `A new faculty record for ${first_name} ${last_name} will be created and assigned as program chair.`;
  })();

  return (
    <>
      <Dialog open={dialog.open} onOpenChange={dialog.handleOpenChange}>
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

            <form.Field
              name="chair.type"
              children={() => (
                <Tabs
                  value={form.state.values.chair?.type ?? "no-chair"}
                  className="w-full mt-2"
                  onValueChange={handleTabChange}
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
                        form.setFieldValue("chair", {
                          type: "existing",
                          id: Number(candidate.account_id),
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
                      children={(field) => (
                        <FormTextField
                          field={field}
                          label="Email"
                          type="email"
                          disabled={isPending}
                          placeholder="chair@school.edu"
                        />
                      )}
                    />
                    <form.Field
                      name="chair.details.personalDetails.institutional_id"
                      children={(field) => (
                        <FormTextField
                          field={field}
                          label="Institutional ID"
                          disabled={isPending}
                          placeholder="e.g. 2021-00456"
                        />
                      )}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <form.Field
                        name="chair.details.personalDetails.first_name"
                        children={(field) => (
                          <FormTextField field={field} label="First Name" disabled={isPending} />
                        )}
                      />
                      <form.Field
                        name="chair.details.personalDetails.last_name"
                        children={(field) => (
                          <FormTextField field={field} label="Last Name" disabled={isPending} />
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <form.Field
                        name="chair.details.personalDetails.middle_name"
                        children={(field) => (
                          <FormTextField field={field} label="Middle Name" disabled={isPending} />
                        )}
                      />
                      <form.Field
                        name="chair.details.personalDetails.suffix"
                        children={(field) => (
                          <FormTextField
                            field={field}
                            label="Suffix"
                            disabled={isPending}
                            placeholder="Jr., Sr., III"
                          />
                        )}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={dialog.attemptClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit] as const}
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

      <AlertDialog open={dialog.confirmSaveOpen} onOpenChange={dialog.setConfirmSaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create new program?</AlertDialogTitle>
            <AlertDialogDescription>{chairChangeSummary}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Go back</AlertDialogCancel>
            <AlertDialogAction onClick={dialog.confirmSave} disabled={isPending}>
              {isPending ? "Creating..." : "Yes, create program"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={dialog.confirmDiscardOpen} onOpenChange={dialog.setConfirmDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved input in this form. Closing now will discard your entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={dialog.confirmDiscard}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
