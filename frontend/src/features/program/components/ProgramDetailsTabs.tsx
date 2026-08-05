import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgramCoursesTab } from "@/features/course/components/CoursesTab";
import { CurriculumTab } from "@/features/curriculum/components/CurriculumTab";
import { ClassesTab } from "@/features/class/components/ClassTab";

interface ProgramTabsProps {
  programId: number;
}

export const ProgramDetailsTabs = ({ programId }: ProgramTabsProps) => {
  return (
    <Tabs defaultValue="courses" className="flex flex-1 flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <TabsList className="h-9 rounded-2xl p-1">
          <TabsTrigger value="courses" className="rounded-xl text-xs">
            Courses
          </TabsTrigger>
          <TabsTrigger value="curriculum" className="rounded-xl text-xs">
            Curriculum
          </TabsTrigger>
          <TabsTrigger value="classes" className="rounded-xl text-xs">
            Classes
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="courses" className="m-0">
        <ProgramCoursesTab programId={programId} />
      </TabsContent>

      <TabsContent value="curriculum" className="m-0">
        <CurriculumTab programId={programId} />
      </TabsContent>

      <TabsContent value="classes" className="m-0">
        <ClassesTab programId={programId} />
      </TabsContent>
    </Tabs>
  );
};
