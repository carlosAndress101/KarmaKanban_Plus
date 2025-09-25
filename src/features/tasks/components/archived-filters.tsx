"use client";

import { useState, useEffect } from "react";
import { Search, X, Filter, Calendar, User, Building2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

import { Task } from "../types";

interface ArchivedFiltersProps {
  data: Task[];
  onFilteredData: (filteredData: Task[]) => void;
  className?: string;
}

interface FilterState {
  searchText: string;
  projectId: string;
  assigneeId: string;
  difficulty: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

// Constants for filter values
const ALL_PROJECTS = "all-projects";
const ALL_ASSIGNEES = "all-assignees";
const ALL_DIFFICULTIES = "all-difficulties";
const UNASSIGNED = "unassigned";

export const ArchivedFilters = ({
  data,
  onFilteredData,
  className,
}: ArchivedFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    searchText: "",
    projectId: ALL_PROJECTS,
    assigneeId: ALL_ASSIGNEES,
    difficulty: ALL_DIFFICULTIES,
    dateRange: {
      from: undefined,
      to: undefined,
    },
  });

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Extract unique values for filter options
  const uniqueProjects = Array.from(
    new Set(data.map((task) => task.project.id))
  )
    .map((id) => {
      const project = data.find((task) => task.project.id === id)?.project;
      return project ? { id: project.id, name: project.name } : null;
    })
    .filter(Boolean) as { id: string; name: string }[];

  const uniqueAssignees = Array.from(
    new Set(data.map((task) => task.assignee?.id).filter(Boolean))
  )
    .map((id) => {
      const assignee = data.find((task) => task.assignee?.id === id)?.assignee;
      return assignee
        ? {
            id: assignee.id!,
            name: `${assignee.name} ${assignee.lastName}`,
          }
        : null;
    })
    .filter(Boolean) as { id: string; name: string }[];

  const difficulties = ["Easy", "Medium", "Hard"];

  // Filter data based on current filters
  useEffect(() => {
    let filteredData = data;

    // Text search filter
    if (filters.searchText.trim()) {
      const searchLower = filters.searchText.toLowerCase();
      filteredData = filteredData.filter(
        (task) =>
          task.name.toLowerCase().includes(searchLower) ||
          (task.description &&
            task.description.toLowerCase().includes(searchLower)) ||
          task.project.name.toLowerCase().includes(searchLower)
      );
    }

    // Project filter
    if (filters.projectId && filters.projectId !== ALL_PROJECTS) {
      filteredData = filteredData.filter(
        (task) => task.project.id === filters.projectId
      );
    }

    // Assignee filter
    if (filters.assigneeId && filters.assigneeId !== ALL_ASSIGNEES) {
      if (filters.assigneeId === UNASSIGNED) {
        filteredData = filteredData.filter((task) => !task.assignee?.id);
      } else {
        filteredData = filteredData.filter(
          (task) => task.assignee?.id === filters.assigneeId
        );
      }
    }

    // Difficulty filter
    if (filters.difficulty && filters.difficulty !== ALL_DIFFICULTIES) {
      filteredData = filteredData.filter(
        (task) => task.difficulty === filters.difficulty
      );
    }

    // Date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      filteredData = filteredData.filter((task) => {
        if (!task.dueDate) return false;

        const taskDate = new Date(task.dueDate);
        const from = filters.dateRange.from;
        const to = filters.dateRange.to;

        if (from && to) {
          return taskDate >= from && taskDate <= to;
        } else if (from) {
          return taskDate >= from;
        } else if (to) {
          return taskDate <= to;
        }

        return true;
      });
    }

    onFilteredData(filteredData);
  }, [filters, data, onFilteredData]);

  const clearAllFilters = () => {
    setFilters({
      searchText: "",
      projectId: ALL_PROJECTS,
      assigneeId: ALL_ASSIGNEES,
      difficulty: ALL_DIFFICULTIES,
      dateRange: {
        from: undefined,
        to: undefined,
      },
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchText) count++;
    if (filters.projectId && filters.projectId !== ALL_PROJECTS) count++;
    if (filters.assigneeId && filters.assigneeId !== ALL_ASSIGNEES) count++;
    if (filters.difficulty && filters.difficulty !== ALL_DIFFICULTIES) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search archived tasks by name, description, or project..."
          value={filters.searchText}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, searchText: e.target.value }))
          }
          className="pl-10 pr-10"
        />
        {filters.searchText && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => setFilters((prev) => ({ ...prev, searchText: "" }))}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3">
        {/* Project Filter */}
        <Select
          value={filters.projectId}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, projectId: value }))
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="All Projects" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_PROJECTS}>All Projects</SelectItem>
            {uniqueProjects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Assignee Filter */}
        <Select
          value={filters.assigneeId}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, assigneeId: value }))
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="All Assignees" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_ASSIGNEES}>All Assignees</SelectItem>
            <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
            {uniqueAssignees.map((assignee) => (
              <SelectItem key={assignee.id} value={assignee.id}>
                {assignee.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Difficulty Filter */}
        <Select
          value={filters.difficulty}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, difficulty: value }))
          }
        >
          <SelectTrigger className="w-full sm:w-[140px]">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Difficulty" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_DIFFICULTIES}>All Difficulties</SelectItem>
            {difficulties.map((difficulty) => (
              <SelectItem key={difficulty} value={difficulty}>
                {difficulty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range Filter */}
        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-[240px] justify-start text-left font-normal",
                !filters.dateRange.from &&
                  !filters.dateRange.to &&
                  "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {filters.dateRange.from ? (
                filters.dateRange.to ? (
                  <>
                    {format(filters.dateRange.from, "LLL dd")} -{" "}
                    {format(filters.dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(filters.dateRange.from, "LLL dd, y")
                )
              ) : (
                "Due date range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              initialFocus
              mode="range"
              defaultMonth={filters.dateRange.from}
              selected={{
                from: filters.dateRange.from,
                to: filters.dateRange.to,
              }}
              onSelect={(range) => {
                setFilters((prev) => ({
                  ...prev,
                  dateRange: {
                    from: range?.from,
                    to: range?.to,
                  },
                }));
                if (range?.from && range?.to) {
                  setIsDatePickerOpen(false);
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="w-full sm:w-auto text-muted-foreground hover:text-foreground"
          >
            <X className="mr-2 h-3 w-3" />
            Clear all ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.searchText && (
            <Badge variant="secondary" className="text-xs">
              Search: {filters.searchText}
              <X
                className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, searchText: "" }))
                }
              />
            </Badge>
          )}

          {filters.projectId && filters.projectId !== ALL_PROJECTS && (
            <Badge variant="secondary" className="text-xs">
              Project:{" "}
              {uniqueProjects.find((p) => p.id === filters.projectId)?.name}
              <X
                className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, projectId: ALL_PROJECTS }))
                }
              />
            </Badge>
          )}

          {filters.assigneeId && filters.assigneeId !== ALL_ASSIGNEES && (
            <Badge variant="secondary" className="text-xs">
              Assignee:{" "}
              {filters.assigneeId === UNASSIGNED
                ? "Unassigned"
                : uniqueAssignees.find((a) => a.id === filters.assigneeId)
                    ?.name}
              <X
                className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, assigneeId: ALL_ASSIGNEES }))
                }
              />
            </Badge>
          )}

          {filters.difficulty && filters.difficulty !== ALL_DIFFICULTIES && (
            <Badge variant="secondary" className="text-xs">
              Difficulty: {filters.difficulty}
              <X
                className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    difficulty: ALL_DIFFICULTIES,
                  }))
                }
              />
            </Badge>
          )}

          {(filters.dateRange.from || filters.dateRange.to) && (
            <Badge variant="secondary" className="text-xs">
              Date:{" "}
              {filters.dateRange.from
                ? format(filters.dateRange.from, "MMM dd")
                : "Start"}{" "}
              -{" "}
              {filters.dateRange.to
                ? format(filters.dateRange.to, "MMM dd")
                : "End"}
              <X
                className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: { from: undefined, to: undefined },
                  }))
                }
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
