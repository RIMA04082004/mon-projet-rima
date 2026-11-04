import { prisma } from "@/lib/prisma";

export async function getTotalStudents() {
  return prisma.student.count();
}

export async function getRecentStudentsCount() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return prisma.student.count({
    where: { createdAt: { gte: thirtyDaysAgo } },
  });
}

export async function getStudentsByNiveau() {
  const groups = await prisma.student.groupBy({
    by: ["niveau"],
    _count: { _all: true },
  });
  return groups.map((g) => ({ niveau: g.niveau, count: g._count._all }));
}

export async function getLatestStudents() {
  return prisma.student.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      niveau: true,
      filiere: true,
      createdAt: true,
    },
  });
}

export async function getDashboardStats() {
  const [total, recent, byNiveau] = await Promise.all([
    getTotalStudents(),
    getRecentStudentsCount(),
    getStudentsByNiveau(),
  ]);
  return { total, recent, byNiveau };
}