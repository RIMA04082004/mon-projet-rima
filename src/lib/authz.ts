import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export type Role = "ADMIN" | "ENSEIGNANT" | "ETUDIANT";

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: Role;
};

export async function requireRole(
  rolesAutorises: Role[]
): Promise<{ user: AuthUser } | { error: NextResponse }> {
  const session = await getSession();
  if (!session) {
    return {
      error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!user) {
    return {
      error: NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 401 }
      ),
    };
  }

  if (!rolesAutorises.includes(user.role as Role)) {
    return {
      error: NextResponse.json({ error: "Accès refusé" }, { status: 403 }),
    };
  }

  return { user: { ...user, role: user.role as Role } };
}