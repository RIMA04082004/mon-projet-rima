import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true, role: true, createdAt: true },
  });
  if (!user) redirect("/login");

  return (
    <main className="mx-auto max-w-md space-y-3 pt-24">
      <h1 className="text-2xl font-bold">Bonjour {user.name} !</h1>
      <p>Email : {user.email}</p>
      <p>Rôle : <strong>{user.role}</strong></p>
      <p>Membre depuis le {user.createdAt.toLocaleDateString("fr-FR")}</p>
      
      {/* Le bouton apparaît seulement si le rôle est ADMIN ou ENSEIGNANT */}
      {(user.role === "ADMIN" || user.role === "ENSEIGNANT") && (
        <Link 
          href="/students" 
          className="inline-block rounded bg-teal-700 px-3 py-2 text-white"
        >
          Gérer les étudiants
        </Link>
      )}

      <LogoutButton />
    </main>
  );
}