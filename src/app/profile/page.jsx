import { redirect } from "next/navigation";
import { currentUser } from "@/lib/serverAuth";

// Keep /profile as the public account URL while reusing the dashboard screen.
export default async function ProfilePage() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/profile");
  redirect("/dashboard");
}
