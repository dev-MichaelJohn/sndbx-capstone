import { useNavigate } from "react-router";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Eye } from "lucide-react";

interface ClassManageItemProps {
  classId: number;
}

export const ClassManageItem = ({ classId }: ClassManageItemProps) => {
  const navigate = useNavigate();

  const handleManage = () => {
    navigate(`classes/${classId}`);
  };

  return (
    <DropdownMenuItem className="cursor-pointer" onSelect={handleManage}>
      <Eye className="mr-2 size-3.5 text-muted-foreground" />
      <span>Manage</span>
    </DropdownMenuItem>
  );
};
