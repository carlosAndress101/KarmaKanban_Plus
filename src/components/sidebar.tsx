import Link from "next/link";
import Image from "next/image";
import { Separator } from "./ui/separator";
import { Navigation } from "./navigation";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { Projects } from "./projects";

export const Sidebar = () => {
  return (
    <aside className="h-full bg-neutral-100 p-4 w-full">
      <Link href="/">
        <Image
          src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo.svg`}
          alt="KarmaKanban Logo"
          width={300}
          height={300}
        />
      </Link>
      <Separator className="my-4" />
      <WorkspaceSwitcher />
      <Separator className="my-4" />
      <Navigation />
      <Separator className="my-4" />
      <Projects />
    </aside>
  );
};

export default Sidebar;
