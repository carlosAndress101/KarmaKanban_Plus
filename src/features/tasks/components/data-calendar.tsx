import { useMemo, useState } from "react";
import { enUS } from "date-fns/locale";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";

import {
  Calendar as CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";

import {
  format,
  getDay,
  parse,
  startOfWeek,
  addMonths,
  subMonths,
} from "date-fns";

import { Task } from "../types";
import { EventCard } from "./event-card";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/app/globals.css";
import { Button } from "@/components/ui/button";
import { Project } from "@/features/projects/schemas";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface DataCalendarProps {
  data: Task[];
  projects: Project[] | undefined; 
}

interface CustomToolbarProps {
  date: Date;
  onNavigate: (action: "PREV" | "TODAY" | "NEXT") => void;
}

const CustomToolbar = ({ date, onNavigate }: CustomToolbarProps) => (
  <div className="flex mb-4 gap-x-2 items-center w-full lg:w-auto justify-center lg:justify-start">
    <Button
      onClick={() => onNavigate("PREV")}
      variant="secondary"
      size="icon"
      className="flex items-center"
    >
      <ChevronLeftIcon className="size-4" />
    </Button>
    <div className="flex items-center border border-input rounded-md px-3 py-2 h-8 justify-center w-full lg:w-auto">
      <CalendarIcon className="size-4 mr-2" />
      <p className="text-sm">{format(date, "MMMM yyyy")}</p>
    </div>
    <Button
      onClick={() => onNavigate("NEXT")}
      variant="secondary"
      size="icon"
      className="flex items-center"
    >
      <ChevronRightIcon className="size-4" />
    </Button>
  </div>
);

export const DataCalendar = ({ data, projects }: DataCalendarProps) => {
  const [value, setValue] = useState(
    data.length > 0 && data[0].dueDate ? new Date(data[0].dueDate) : new Date()
  );

  const events = useMemo(() => {
    if (!projects) return [];

    // Filtrar tareas duplicadas usando Set
    const uniqueTasks = Array.from(
      new Map(data.map(task => [task.id, task])).values()
    );

    return uniqueTasks
      .filter((task) => task.dueDate && task.name && task.id)
      .map((task) => {
        const projectObj = projects.find(
          (p) => p.name === task.project.name || p.id === task.project.id
        );
        if (!projectObj) return null;

        return {
          start: new Date(task.dueDate),
          end: new Date(task.dueDate),
          title: task.name,
          project: projectObj,
          assignee: task.assignee,
          status: task.status,
          id: task.id,
        };
      })
      .filter((e): e is NonNullable<typeof e> => e !== null);
  }, [data, projects]);

  const handleNavigate = (action: "PREV" | "NEXT" | "TODAY") => {
    if (action === "PREV") setValue(subMonths(value, 1));
    else if (action === "NEXT") setValue(addMonths(value, 1));
    else setValue(new Date());
  };

  return (
    <Calendar
      localizer={localizer}
      date={value}
      events={events}
      views={["month"]}
      defaultView="month"
      toolbar
      showAllEvents
      className="h-full"
      max={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
      formats={{
        weekdayFormat: (date, culture, localizer) =>
          localizer?.format(date, "EEE", culture) ?? "",
      }}
      components={{
        eventWrapper: ({ event }) => {
          if (!event || !event.id || !event.title) return null;
          return (
            <EventCard
              id={event.id}
              title={event.title}
              assignee={event.assignee}
              project={event.project}
              status={event.status}
            />
          );
        },
        toolbar: () => (
          <CustomToolbar date={value} onNavigate={handleNavigate} />
        ),
      }}
    />
  );
};
