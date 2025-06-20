import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";

interface AnalyticsCardProps {
  title: string;
  value: number;
  variant: "up" | "down" | "neutral";
  increaseValue: number;
}

export const AnalyticsCard = ({
  increaseValue,
  title,
  value,
  variant,
}: AnalyticsCardProps) => {
  const iconColor = variant === "up"
    ? "text-emerald-500"
    : variant === "down"
    ? "text-red-500"
    : "text-gray-400";

  const increaseValueColor = iconColor;

  const Icon =
    variant === "up"
      ? FaCaretUp
      : variant === "down"
      ? FaCaretDown
      : null; 

  return (
    <Card className="shadow-none border-none w-full">
      <CardHeader>
        <div className="flex items-center gap-x-2.5">
          <CardDescription className="flex items-center gap-x-2 font-medium overflow-hidden">
            <span className="truncate text-base">{title}</span>
          </CardDescription>

          <div className="flex items-center gap-x-1">
            {Icon && <Icon className={cn(iconColor, "size-4")} />}
            <span
              className={cn(
                increaseValueColor,
                "truncate text-base font-medium"
              )}
            >
              {increaseValue}
            </span>
          </div>
        </div>
        <CardTitle className="text-3xl font-semibold">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
};
