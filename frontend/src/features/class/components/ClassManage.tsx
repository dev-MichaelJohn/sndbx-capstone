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
    <DropdownMenuItem
      className="w-full cursor-pointer text-xs transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground active:bg-accent/80"
      onSelect={handleManage}
    >
      <Eye className="mr-2 size-3.5 text-muted-foreground" />
      <span>Manage</span>
    </DropdownMenuItem>
  );
};
