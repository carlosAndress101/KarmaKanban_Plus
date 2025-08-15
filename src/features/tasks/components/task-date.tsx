import { differenceInDays, format, isValid, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface TaskDateProps {
  value: string;
  className?: string;
}

export const TaskDate = ({ value, className }: TaskDateProps) => {
  // Try to parse the value as ISO, fallback to Date constructor
  let endDate: Date | null = null;
  if (value) {
    endDate = isValid(parseISO(value)) ? parseISO(value) : new Date(value);
    if (!isValid(endDate)) endDate = null;
  }

  if (!endDate) {
    return (
      <div className="text-muted-foreground">
        <span className={cn("truncate", className)}>Sin fecha</span>
      </div>
    );
  }

  const today = new Date();
  const diffInDays = differenceInDays(endDate, today);

  let textColor = "text-muted-foreground";
  if (diffInDays <= 3) {
    textColor = "text-red-500";
  } else if (diffInDays <= 7) {
    textColor = "text-orange-500";
  } else if (diffInDays <= 14) {
    textColor = "text-yellow-500";
  }

  return (
    <div className={textColor}>
      <span className={cn("truncate", className)}>
        {format(endDate, "PPP")}
      </span>
    </div>
  );
};
