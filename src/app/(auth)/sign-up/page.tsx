import { getCurrent } from "@/features/auth/actions";
import RegisterForm from "@/features/auth/components/singUpCard";
import { redirect } from "next/navigation";

const SingUpPage = async () => {

  const user = await getCurrent()
  if (user) return redirect("/")

  return (
    <div>
      <RegisterForm />
    </div>
  )
}

export default SingUpPage;