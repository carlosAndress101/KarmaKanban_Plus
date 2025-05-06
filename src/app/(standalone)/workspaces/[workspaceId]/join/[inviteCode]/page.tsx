import { redirect } from "next/navigation";

import { getCurrent } from "@/feature/auth/actions";
import { getWorkspaceinfo } from "@/feature/workspaces/query";
import { JoinWorkspaceForm} from "@/feature/workspaces/components/joinWorkspaceForm"
//import { WorkspaceIdJoinClient } from "./client";

interface Props {
    params: {
        workspaceId: string;
        inviteCode: string;
    };
};

const WorkspaceIdJoinPage = async ({ params }: Props) => {
    const user = await getCurrent();
    if (!user) redirect("/sign-in");

    const initalValues = await getWorkspaceinfo({
        workspaceId: params.workspaceId,
    })

    if (!initalValues) redirect("/");


    return <JoinWorkspaceForm  initalValues={initalValues} />;
};

export default WorkspaceIdJoinPage;