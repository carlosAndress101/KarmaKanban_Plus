import { getCurrent } from "@/feature/auth/actions";
import RegisterForm from "@/feature/auth/components/singUpCard";
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