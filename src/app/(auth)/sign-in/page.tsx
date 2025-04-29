import { redirect } from "next/navigation";
import { getCurrent } from "@/feature/auth/actions";
import SingIn from "@/feature/auth/components/singInCard";

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