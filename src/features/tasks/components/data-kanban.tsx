import React, { useCallback, useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

import { Task, TaskStatus } from "../types";
import { KanbanCard } from "./kanban-card";
import { KanbanColumnHeader } from "./kanban-column-header";
import { useBulkUpdateTask } from "../api/useBulkUpdateTask"; // Importa tu hook aquí

const boards: TaskStatus[] = [
  TaskStatus.BACKLOG,
  TaskStatus.TO_DO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
];

export type TasksState = {
  [key in TaskStatus]: Task[];
};

interface DataKanbanProps {
  data: Task[];
  onChange: (
    tasks: { id: string; status: TaskStatus; position: number }[]
  ) => void;
}

// Helper para eliminar duplicados por id
const removeDuplicateTasks = (tasks: Task[]) => {
  const uniqueTasks: Record<string, Task> = {};
  for (const task of tasks) {
    uniqueTasks[task.id] = task;
  }
  return Object.values(uniqueTasks);
};

export const DataKanban = ({ data }: DataKanbanProps) => {
  const { mutate } = useBulkUpdateTask();

  const buildTaskState = (taskList: Task[]): TasksState => {
    const cleanData = removeDuplicateTasks(taskList);
    const initial: TasksState = {
      [TaskStatus.BACKLOG]: [],
      [TaskStatus.TO_DO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.IN_REVIEW]: [],
      [TaskStatus.DONE]: [],
    };
    for (const task of cleanData) {
      if (task.status && boards.includes(task.status)) {
        initial[task.status].push(task);
      }
      // Si el status no es válido, puedes agregar un manejo aquí (ej. log, ignorar, etc.)
    }
    for (const status of boards) {
      initial[status].sort((a, b) => a.position - b.position);
    }
    return initial;
  };

  const [tasks, setTasks] = useState<TasksState>(() => buildTaskState(data));

  useEffect(() => {
    setTasks(buildTaskState(data));
  }, [data]);

  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      const { source, destination } = result;
      const sourceStatus = source.droppableId as TaskStatus;
      const destStatus = destination.droppableId as TaskStatus;

      const updatesPayload: {
        id: string;
        status: TaskStatus;
        position: number;
      }[] = [];

      setTasks((prevTasks) => {
        const newTasks = { ...prevTasks };
        const sourceColumn = [...newTasks[sourceStatus]];
        const [movedTask] = sourceColumn.splice(source.index, 1);

        if (!movedTask) {
          console.error("No task found at the source index");
          return prevTasks;
        }

        const updatedTask =
          sourceStatus !== destStatus
            ? { ...movedTask, status: destStatus }
            : movedTask;

        newTasks[sourceStatus] = sourceColumn;
        const destColumn = [...newTasks[destStatus]];
        destColumn.splice(destination.index, 0, updatedTask);
        newTasks[destStatus] = destColumn;

        updatesPayload.push({
          id: updatedTask.id,
          status: destStatus,
          position: Math.min((destination.index + 1) * 1000, 1_000_000),
        });

        // Recalcular posiciones en ambas columnas
        [sourceStatus, destStatus].forEach((status) => {
          newTasks[status].forEach((task, index) => {
            const newPosition = Math.min((index + 1) * 1000, 1_000_000);
            if (task.position !== newPosition) {
              updatesPayload.push({
                id: task.id,
                status,
                position: newPosition,
              });
            }
          });
        });

        return newTasks;
      });

      // Enviar cambios directamente usando mutate
      mutate({ json: { tasks: updatesPayload } });
    },
    [mutate]
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex overflow-x-auto">
        {boards.map((board) => (
          <div
            key={board}
            className="flex-1 mx-2 bg-muted p-1.5 rounded-md min-w-[200px]"
          >
            <KanbanColumnHeader board={board} taskCount={tasks[board].length} />
            <Droppable droppableId={board}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="min-h-[200px] py-1.5"
                >
                  {tasks[board].map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <KanbanCard task={task} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};
