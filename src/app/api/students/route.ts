import { NextResponse } from "next/server";
import { requireRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { createStudentSchema } from "@/lib/validation-student";

// GET /api/students
export async function GET() {
  const auth = await requireRole(["ADMIN", "ENSEIGNANT", "ETUDIANT"]);
  if ("error" in auth) return auth.error;

  const { user } = auth;

  // ADMIN et ENSEIGNANT : tous les étudiants
  if (user.role === "ADMIN" || user.role === "ENSEIGNANT") {
    const students = await prisma.student.findMany({
      orderBy: { lastName: "asc" },
    });
    return NextResponse.json(students);
  }

  // ETUDIANT : seulement son propre profil
  const own = await prisma.student.findUnique({
    where: { userId: user.id },
  });
  return NextResponse.json(own ? [own] : []);
}

// POST /api/students — réservé ADMIN
export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if ("error" in auth) return auth.error;

  const body = await req.json().catch(() => null);
  const parsed = createStudentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  try {
    const student = await prisma.student.create({ data: parsed.data });
    return NextResponse.json(student, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json(
        { error: "Cet email étudiant existe déjà" },
        { status: 409 }
      );
    }
    throw e;
  }
}