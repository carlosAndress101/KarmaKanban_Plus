"use client"
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SingInLayoutProps {
  children: React.ReactNode;
};

const AuthLayout = ({ children }: SingInLayoutProps) => {

  const pathname = usePathname();
  const isSignIn = pathname === "/sign-in";
  return (
    <main className="bg-neutral-100 min-h-screen">
      <div className="mx-auto max-w-screen-2xl p-4">
        <nav className="flex justify-between items-center">
          <Image src="/logo.svg" alt="Logo" width={152} height={56} className="p-3" />
          <Button asChild>
            <Link href={isSignIn ? "/sign-up" : "/sign-in"}>
              {isSignIn ? "Sign up" : "Login"}
            </Link>
          </Button>
        </nav>
        <div className="flex flex-col bg-neutral-100 items-center justify-center pt-4 md:pt-14">
          {children}
        </div>
      </div>
    </main>
  )
}

export default AuthLayout;