import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users } from "lucide-react";
import { CourseOfferingsTab } from "./tab-course-offering";
import { ClassStudentsTab } from "./tab-class-student.tsx";

interface ClassTabsProps {
  classId: number;
}

export const ClassTabs = ({ classId }: ClassTabsProps) => {
  const [activeTab, setActiveTab] = useState("offerings");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="inline-flex h-9 items-center justify-center rounded-xl bg-muted/60 p-1 text-muted-foreground">
        <TabsTrigger
          value="offerings"
          className="flex items-center gap-2 text-xs font-medium rounded-xl"
        >
          <BookOpen className="size-3.5" />
          Course Offerings
        </TabsTrigger>
        <TabsTrigger
          value="students"
          className="flex items-center gap-2 text-xs font-medium rounded-xl"
        >
          <Users className="size-3.5" />
          Class List
        </TabsTrigger>
      </TabsList>

      <TabsContent value="offerings" className="mt-0">
        <CourseOfferingsTab classId={classId} />
      </TabsContent>

      <TabsContent value="students" className="mt-0">
        <ClassStudentsTab classId={classId} />
      </TabsContent>
    </Tabs>
  );
};
