import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getDashboardStats, getLatestStudents } from "@/lib/dashboard";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { student: true },
  });
  if (!user) redirect("/login");

  // ---- VUE ÉTUDIANT ----
  if (user.role === "ETUDIANT") {
    if (!user.student) {
      return (
        <main className="p-8">
          <h1 className="text-2xl font-bold">Bienvenue {user.name}</h1>
          <p>Aucun dossier étudiant lié à votre compte.</p>
          <LogoutButton />
        </main>
      );
    }
    return (
      <main className="p-8 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Mon Espace Étudiant</h1>
          <LogoutButton />
        </div>
        <div className="border p-4 rounded bg-gray-50 space-y-2">
          <p><strong>Nom :</strong> {user.student.firstName} {user.student.lastName}</p>
          <p><strong>Email :</strong> {user.student.email}</p>
          <p><strong>Filière :</strong> {user.student.filiere}</p>
          <p><strong>Niveau :</strong> {user.student.niveau}</p>
          <p><strong>Notes :</strong> {user.student.notes ?? "Non renseignées"}</p>
        </div>
      </main>
    );
  }

  // ---- VUE ADMIN / ENSEIGNANT ----
  const stats = await getDashboardStats();
  const latestStudents = await getLatestStudents();

  return (
    <main className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Dashboard {user.role === "ADMIN" ? "Administrateur" : "Enseignant"}
        </h1>
        <LogoutButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total Étudiants" value={stats.total} />
        <Card title="Nouveaux (30j)" value={stats.recent} />
        <div className="border p-4 rounded shadow-sm">
          <h2 className="text-sm text-gray-500 font-medium">Répartition par niveau</h2>
          <ul className="mt-2">
            {stats.byNiveau.map((n) => (
              <li key={n.niveau}>{n.niveau} : <strong>{n.count}</strong></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border rounded shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">Nom</th>
              <th className="p-2">Email</th>
              <th className="p-2">Niveau</th>
              <th className="p-2">Ajouté le</th>
            </tr>
          </thead>
          <tbody>
            {latestStudents.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-2">{s.firstName} {s.lastName}</td>
                <td className="p-2">{s.email}</td>
                <td className="p-2">{s.niveau}</td>
                <td className="p-2">{s.createdAt.toLocaleDateString("fr-FR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="border p-4 rounded shadow-sm bg-white">
      <h2 className="text-sm text-gray-500 font-medium">{title}</h2>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}