import { Button } from "./ui/button"
import { signOut } from "@/lib/actions/auth.actions"


const SignOutButton = () => {
  return (
    <form action={signOut}>
      <Button type="submit" className="btn-primary">Sign Out</Button>
    </form>
  )
}

export default SignOutButton;
