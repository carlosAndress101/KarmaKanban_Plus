import UserButton from "@/features/auth/components/userButton";
import MobileSidebar from "./mobile-sidebar";
import { usePathname } from "next/navigation";

const pathnameMap = {
	tasks: {
	  title: "Mis tareas",
	  description: "Ver todas tus tareas aquí",
	},
	projects: {
	  title: "Mis proyectos",
	  description: "Ver todos tus proyectos aquí",
		},
  };

const defaultMap = {
	title: "Karma Kanban",
	description: "Organiza tus proyectos y tareas aquí",
};

const Navbar = () => {
	const pathname = usePathname();
	const pathnameParts = pathname.split("/");
	const pathnameKey = pathnameParts[3] as keyof typeof pathnameMap;

	const { title, description } = pathnameMap[pathnameKey] || defaultMap;
	return (
		<nav className="pt-4 px-6 flex items-center justify-between">
			<div className="flex-col hidden lg:flex">
				<h1 className="text-2xl font-semibold">{title}</h1>
				<p className="text-muted-foreground">{description}</p>
			</div>
			<MobileSidebar />
			<UserButton />
		</nav>
	);
};

export default Navbar;