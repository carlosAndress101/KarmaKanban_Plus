import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/actions";
import { TaskViewSwticher } from "@/features/tasks/components/task-view-swticher";

const TasksPage = async () => {
  const user = await getCurrent();

  if (!user) redirect("/sign-in");

  return (
    <div className="h-full flex flex-col">
      <TaskViewSwticher hideProjectFilter/>
    </div>
  );
};

export default TasksPage;