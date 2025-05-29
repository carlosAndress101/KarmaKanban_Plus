import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/actions";
import SingIn from "@/features/auth/components/singInCard";

const SingInPage = async () => {

  const user = await getCurrent()
  if (user) return redirect("/")

  return (
    <>
      <SingIn />
    </>
  )
}

export default SingInPage;