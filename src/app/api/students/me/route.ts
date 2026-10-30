import { NextResponse } from "next/server";
import { requireRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireRole(["ADMIN", "ENSEIGNANT", "ETUDIANT"]);
  if ("error" in auth) return auth.error;

  const student = await prisma.student.findUnique({
    where: { userId: auth.user.id },
  });

  if (!student) {
    return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
  }
  return NextResponse.json(student);
}