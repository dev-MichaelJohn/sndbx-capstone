import { icons } from "lucide-react";
import { type LucideProps } from "lucide-react";

interface IconProps extends LucideProps {
  name: keyof typeof icons;
}

export const GenericIcon = ({ name, ...props }: IconProps) => {
  const Icon = icons[name];
  return Icon ? <Icon {...props} /> : null;
};
