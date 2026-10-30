import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import StudentForm from "@/components/StudentForm";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });
  
  if (!user || !["ADMIN", "ENSEIGNANT"].includes(user.role)) {
    redirect("/students");
  }

  const student = await prisma.student.findUnique({
    where: { id: Number(id) },
  });
  if (!student) redirect("/students");

  return (
    <main className="mx-auto max-w-md p-8">
      {/* Bouton Retour (déjà bloqué pour étudiant par le if au-dessus, mais on garde la condition) */}
      {(user.role === "ADMIN" || user.role === "ENSEIGNANT") && (
        <Link 
          href="/students" 
          className="mb-6 inline-block rounded bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300"
        >
          ← Retour à la liste
        </Link>
      )}

      <h1 className="mb-4 text-2xl font-bold">Modifier l'étudiant</h1>
      <StudentForm mode="edit" initial={student} role={user.role} />
    </main>
  );
}