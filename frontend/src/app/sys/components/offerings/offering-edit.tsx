import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { formatFullName } from "@/lib/nameFormatter";
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
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { FormTextField } from "@/components/form-text-field";
import { ExistingFacultySearch, type FacultyUser } from "./existing-faculty-search";
import { useSemesters } from "@/features/sys/semester.service";
import { useCurriculums } from "@/features/sys/curriculum.service";
import { useFacultyList } from "@/features/sys/user.service";
import { useUpdateCourseOffering } from "@/features/sys/offerings.service";
import type { UpdateCourseOfferingParams } from "backend/types/offerings.type";
import { useEntityDialog } from "@/hooks/use-entity-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface CourseOfferingItem {
  id: number;
  course_curriculum_id: number;
  class_id: number;
  semester_id: number;
  faculty_id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  course_name: string;
  course_initialism: string;
  year_level: string;
  semester_term: string;
}

interface OfferingEditDialogProps {
  offering: CourseOfferingItem | null;
  programId?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyFacultyDetails = {
  credentials: { email: "" },
  personalDetails: {
    institutional_id: "",
    first_name: "",
    last_name: "",
    middle_name: "",
    suffix: "",
  },
};

export const OfferingEditDialog = ({
  offering,
  programId,
  open,
  onOpenChange,
}: OfferingEditDialogProps) => {
  const [facultySearch, setFacultySearch] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyUser | null>(null);

  const { mutateAsync, isPending } = useUpdateCourseOffering();

  const { data: semestersData, isLoading: isSemestersLoading } = useSemesters({
    page: 1,
    search: undefined,
    orderBy: "id",
    orderDir: "desc",
  });

  const { data: curriculumData, isLoading: isCurriculumLoading } = useCurriculums({
    program_id: programId,
    page: 1,
  });

  const { data: facultyData, isLoading: isFacultyLoading } = useFacultyList({
    search: facultySearch.trim().length >= 2 ? facultySearch : undefined,
  });

  const semesters = semestersData?.data ?? [];
  const curriculumCourses = curriculumData?.data ?? [];
  const facultyList = (facultyData?.data ?? []) as FacultyUser[];

  const initialFormData: UpdateCourseOfferingParams = {
    course_offering_id: offering?.id ?? 0,
    offering: {
      course_curriculum_id: offering?.course_curriculum_id ?? 0,
      semester_id: offering?.semester_id ?? 0,
    },
    faculty: offering?.faculty_id
      ? { type: "existing", id: offering.faculty_id }
      : { type: "existing", id: 0 },
  };

  const form = useForm({
    defaultValues: initialFormData,
    onSubmit: (values) => dialog.handleFormSubmit(values),
  });

  const resetFacultyState = () => {
    setFacultySearch("");
    if (offering?.faculty_id && facultyList.length) {
      const existing = facultyList.find((u) => u.id === offering.faculty_id) ?? null;
      setSelectedFaculty(existing);
    } else {
      setSelectedFaculty(null);
    }
  };

  const dialog = useEntityDialog<UpdateCourseOfferingParams>({
    form,
    mutationFn: mutateAsync,
    loadingText: "Updating course offering...",
    successText: "Course offering updated successfully.",
    onReset: resetFacultyState,
  });

  // Prefill form values when offering prop or open state changes
  useEffect(() => {
    if (offering && open) {
      setFacultySearch("");
      form.reset({
        course_offering_id: offering.id,
        offering: {
          course_curriculum_id: offering.course_curriculum_id,
          semester_id: offering.semester_id,
        },
        faculty: offering.faculty_id
          ? { type: "existing", id: offering.faculty_id }
          : { type: "existing", id: 0 },
      });
    }
  }, [offering, open]);

  // Resolve faculty record details from user list if faculty_id is present
  useEffect(() => {
    if (offering?.faculty_id && open && facultyList.length) {
      const match = facultyList.find((user) => user.id === offering.faculty_id);
      if (match) setSelectedFaculty(match);
    }
  }, [offering?.faculty_id, open, facultyList]);

  // Sync internal dialog state to external parent state when dialog closes
  useEffect(() => {
    if (onOpenChange && open !== dialog.open) {
      onOpenChange(dialog.open);
    }
  }, [dialog.open, open, onOpenChange]);

  // Sync external parent state to internal dialog state when opened
  useEffect(() => {
    if (open && !dialog.open) {
      dialog.handleOpenChange(true);
    }
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    dialog.handleOpenChange(newOpen);
  };

  const handleTabChange = (v: string) => {
    if (v === "existing") {
      form.setFieldValue("faculty", { type: "existing", id: selectedFaculty?.id ?? 0 });
    } else if (v === "new") {
      form.setFieldValue("faculty", { type: "new", details: emptyFacultyDetails });
      setFacultySearch("");
      setSelectedFaculty(null);
    }
  };

  const handleConfirmDiscard = () => {
    dialog.confirmDiscard();
    onOpenChange(false);
  };

  const facultyChangeSummary = (() => {
    if (!dialog.pendingValue?.faculty) return "";
    if (dialog.pendingValue.faculty.type === "existing") {
      return selectedFaculty
        ? `${formatFullName({
            first_name: selectedFaculty.first_name,
            middle_name: selectedFaculty.middle_name ?? "",
            last_name: selectedFaculty.last_name,
            suffix: selectedFaculty.suffix ?? "",
          })} will be assigned as the instructor.`
        : "The selected faculty member will be assigned as the instructor.";
    }
    const { first_name, last_name } = dialog.pendingValue.faculty.details.personalDetails;
    return `A new faculty record for ${first_name} ${last_name} will be created and assigned as the instructor.`;
  })();

  return (
    <>
      <Dialog open={dialog.open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Course Offering</DialogTitle>
            <DialogDescription>
              Update curriculum course, academic semester, or reassign an instructor.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            {/* Course Curriculum Select */}
            <form.Field
              name="offering.course_curriculum_id"
              children={(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Course Curriculum</Label>
                  <Select
                    value={field.state.value ? String(field.state.value) : ""}
                    onValueChange={(val) => field.handleChange(Number(val))}
                    disabled={isCurriculumLoading || isPending}
                  >
                    <SelectTrigger id={field.name} className="w-full text-xs">
                      <SelectValue
                        placeholder={
                          isCurriculumLoading ? "Loading courses..." : "Select curriculum course"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {curriculumCourses.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)} className="text-xs">
                          {item.initialism} — {item.name} (Yr {item.year_level},{" "}
                          {item.semester_term})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />

            {/* Academic Semester Select */}
            <form.Field
              name="offering.semester_id"
              children={(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Academic Semester</Label>
                  <Select
                    value={field.state.value ? String(field.state.value) : ""}
                    onValueChange={(val) => field.handleChange(Number(val))}
                    disabled={isSemestersLoading || isPending}
                  >
                    <SelectTrigger id={field.name} className="w-full text-xs">
                      <SelectValue
                        placeholder={
                          isSemestersLoading ? "Loading semesters..." : "Select active semester"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((sem) => (
                        <SelectItem key={sem.id} value={String(sem.id)} className="text-xs">
                          A.Y. {sem.school_year_start}–{sem.school_year_end} ({sem.semester_term}{" "}
                          Term)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />

            {/* Faculty Selection Tabs */}
            <form.Field
              name="faculty.type"
              children={() => (
                <Tabs
                  value={form.state.values.faculty?.type ?? "existing"}
                  className="w-full mt-2"
                  onValueChange={handleTabChange}
                >
                  <Label>Assign Instructor</Label>
                  <TabsList className="w-full grid grid-cols-2 mt-1.5">
                    <TabsTrigger value="existing">Existing Faculty</TabsTrigger>
                    <TabsTrigger value="new">New Faculty</TabsTrigger>
                  </TabsList>

                  <TabsContent value="existing" className="space-y-2 mt-3">
                    <ExistingFacultySearch
                      search={facultySearch}
                      onSearchChange={setFacultySearch}
                      users={facultyList}
                      isSearching={isFacultyLoading}
                      selected={selectedFaculty}
                      onSelect={(user) => {
                        form.setFieldValue("faculty", {
                          type: "existing",
                          id: user.id,
                        });
                        setSelectedFaculty(user);
                      }}
                      onClear={() => {
                        setSelectedFaculty(null);
                        form.setFieldValue("faculty", { type: "existing", id: 0 });
                      }}
                    />
                  </TabsContent>

                  <TabsContent value="new" className="space-y-3 mt-3">
                    <form.Field
                      name="faculty.details.credentials.email"
                      children={(field) => (
                        <FormTextField
                          field={field}
                          label="Email"
                          type="email"
                          disabled={isPending}
                          placeholder="faculty@school.edu"
                        />
                      )}
                    />
                    <form.Field
                      name="faculty.details.personalDetails.institutional_id"
                      children={(field) => (
                        <FormTextField
                          field={field}
                          label="Institutional ID"
                          disabled={isPending}
                          placeholder="e.g. 2024-00123"
                        />
                      )}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <form.Field
                        name="faculty.details.personalDetails.first_name"
                        children={(field) => (
                          <FormTextField field={field} label="First Name" disabled={isPending} />
                        )}
                      />
                      <form.Field
                        name="faculty.details.personalDetails.last_name"
                        children={(field) => (
                          <FormTextField field={field} label="Last Name" disabled={isPending} />
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <form.Field
                        name="faculty.details.personalDetails.middle_name"
                        children={(field) => (
                          <FormTextField field={field} label="Middle Name" disabled={isPending} />
                        )}
                      />
                      <form.Field
                        name="faculty.details.personalDetails.suffix"
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
                  {isPending ? "Saving..." : "Save Changes"}
                </Button>
              )}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialogs */}
      <AlertDialog open={dialog.confirmSaveOpen} onOpenChange={dialog.setConfirmSaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save changes to course offering?</AlertDialogTitle>
            <AlertDialogDescription>{facultyChangeSummary}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Go back</AlertDialogCancel>
            <AlertDialogAction onClick={dialog.confirmSave} disabled={isPending}>
              {isPending ? "Saving..." : "Yes, save changes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={dialog.confirmDiscardOpen} onOpenChange={dialog.setConfirmDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved edits in this form. Closing now will discard your changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDiscard}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
