import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, Users, Calendar } from "lucide-react";
import { CourseOfferingsTab } from "@/features/offerings/components/OfferingsTab";
import { ClassStudentsTab } from "@/features/class-student/components/ClassStudentTab";
import { useSemesters } from "@/features/semester/api/semester.service";

interface ClassTabsProps {
  classId: number;
}

export const ClassDetailsTabs = ({ classId }: ClassTabsProps) => {
  const [activeTab, setActiveTab] = useState("offerings");
  const { data: semesterData } = useSemesters({
    search: undefined,
    page: 1,
    orderBy: "id",
    orderDir: "desc",
  });

  const semesters = semesterData?.data ?? [];
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | undefined>(undefined);

  const activeSemesterId = selectedSemesterId ?? semesters[0]?.id;

  return (
    <div className="space-y-4">
      {/* Semester Context Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-muted/60 p-1 text-muted-foreground">
            <TabsTrigger
              value="offerings"
              className="flex items-center gap-2 rounded-md px-3 text-xs font-medium"
            >
              <BookOpen className="size-3.5" />
              Course Offerings
            </TabsTrigger>
            <TabsTrigger
              value="students"
              className="flex items-center gap-2 rounded-md px-3 text-xs font-medium"
            >
              <Users className="size-3.5" />
              Class Roster
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 shrink-0">
          <Calendar className="size-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Academic Term:</span>
          <Select
            value={activeSemesterId ? String(activeSemesterId) : ""}
            onValueChange={(val) => setSelectedSemesterId(Number(val))}
          >
            <SelectTrigger className="h-8 w-52 text-xs">
              <SelectValue placeholder="Select Semester" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map((s) => (
                <SelectItem key={s.id} value={String(s.id)} className="text-xs">
                  AY {s.school_year_start}–{s.school_year_end} ({s.semester_term} Term)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="offerings" className="mt-0">
          <CourseOfferingsTab classId={classId} semesterId={activeSemesterId} />
        </TabsContent>

        <TabsContent value="students" className="mt-0">
          <ClassStudentsTab classId={classId} semesterId={activeSemesterId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
