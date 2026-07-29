import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ProgramCoursesTab } from "./tab-courses";

interface ProgramTabsProps {
  programId: number;
}

export const ProgramTabs = ({ programId }: ProgramTabsProps) => {
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
          <TabsTrigger value="faculty" className="rounded-xl text-xs">
            Faculty
          </TabsTrigger>
          <TabsTrigger value="students" className="rounded-xl text-xs">
            Students
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="courses" className="m-0">
        <ProgramCoursesTab programId={programId} />
      </TabsContent>

      <TabsContent value="curriculum" className="m-0">
        <Card className="overflow-hidden rounded-xl p-6 text-xs text-muted-foreground shadow-xs">
          Curriculum tab component goes here.
        </Card>
      </TabsContent>

      <TabsContent value="classes" className="m-0">
        <Card className="overflow-hidden rounded-xl p-6 text-xs text-muted-foreground shadow-xs">
          Classes tab component goes here.
        </Card>
      </TabsContent>

      <TabsContent value="faculty" className="m-0">
        <Card className="overflow-hidden rounded-xl p-6 text-xs text-muted-foreground shadow-xs">
          Faculty tab component goes here.
        </Card>
      </TabsContent>

      <TabsContent value="students" className="m-0">
        <Card className="overflow-hidden rounded-xl p-6 text-xs text-muted-foreground shadow-xs">
          Students tab component goes here.
        </Card>
      </TabsContent>
    </Tabs>
  );
};
