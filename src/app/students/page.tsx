import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/LogoutButton";
import DeleteStudentButton from "@/components/DeleteStudentButton";

export default async function StudentsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, role: true },
  });
  if (!user) redirect("/login");

  let students;
  if (user.role === "ETUDIANT") {
    const own = await prisma.student.findUnique({
      where: { userId: user.id },
    });
    students = own ? [own] : [];
  } else {
    students = await prisma.student.findMany({
      orderBy: { lastName: "asc" },
    });
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          {/* Bouton Retour visible uniquement pour ADMIN et ENSEIGNANT */}
          {(user.role === "ADMIN" || user.role === "ENSEIGNANT") && (
            <Link href="/dashboard" className="text-sm text-teal-700 hover:underline mb-2 inline-block">
              ← Retour au Dashboard
            </Link>
          )}
          <h1 className="text-2xl font-bold">
            Étudiants — rôle : {user.role}
          </h1>
        </div>
        <LogoutButton />
      </div>

      {user.role === "ADMIN" && (
        <Link
          href="/students/new"
          className="inline-block rounded bg-teal-700 px-3 py-2 text-white"
        >
          + Créer un étudiant
        </Link>
      )}

      {user.role === "ETUDIANT" && (
        <p className="text-sm text-gray-600">
          Vous consultez uniquement votre propre profil.
        </p>
      )}

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-gray-100 text-left">
            <th className="p-2">Nom</th>
            <th className="p-2">Email</th>
            <th className="p-2">Filière</th>
            <th className="p-2">Niveau</th>
            <th className="p-2">Notes</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id} className="border-b">
              <td className="p-2">{s.firstName} {s.lastName}</td>
              <td className="p-2">{s.email}</td>
              <td className="p-2">{s.filiere}</td>
              <td className="p-2">{s.niveau}</td>
              <td className="p-2">{s.notes ?? "—"}</td>
              <td className="p-2 space-x-2">
                {(user.role === "ADMIN" || user.role === "ENSEIGNANT") && (
                  <Link className="underline" href={`/students/${s.id}`}>
                    Modifier
                  </Link>
                )}
                {user.role === "ADMIN" && <DeleteStudentButton id={s.id} />}
              </td>
            </tr>
          ))}
          {students.length === 0 && (
            <tr>
              <td colSpan={6} className="p-4 text-center text-gray-500">
                Aucun étudiant.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}