import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users } from "lucide-react";
import { CourseOfferingsTab } from "@/features/offerings/components/OfferingsTab";
import { ClassStudentsTab } from "@/features/class-student/components/ClassStudentTab";

interface ClassTabsProps {
  classId: number;
}

export const ClassDetailsTabs = ({ classId }: ClassTabsProps) => {
  const [activeTab, setActiveTab] = useState("offerings");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-muted/60 p-1 text-muted-foreground">
        <TabsTrigger
          value="offerings"
          className="flex items-center gap-2 rounded-md px-3 text-xs font-medium transition-all"
        >
          <BookOpen className="size-3.5" />
          Course Offerings
        </TabsTrigger>
        <TabsTrigger
          value="students"
          className="flex items-center gap-2 rounded-md px-3 text-xs font-medium transition-all"
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
