import { NextResponse } from "next/server";
import { requireRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import {
  updateStudentSchema,
  enseignantUpdateSchema,
} from "@/lib/validation-student";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const studentId = Number(id);
  if (Number.isNaN(studentId)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  const auth = await requireRole(["ADMIN", "ENSEIGNANT"]);
  if ("error" in auth) return auth.error;

  const body = await req.json().catch(() => null);

  if (auth.user.role === "ADMIN") {
    const parsed = updateStudentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    try {
      const updated = await prisma.student.update({
        where: { id: studentId },
        data: parsed.data,
      });
      return NextResponse.json(updated);
    } catch (e: any) {
      if (e?.code === "P2025") {
        return NextResponse.json({ error: "Introuvable" }, { status: 404 });
      }
      throw e;
    }
  }

  const parsed = enseignantUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Champs non autorisés" },
      { status: 403 }
    );
  }

  const champsInterdits = ["firstName", "lastName", "email"];
  const bodyKeys = Object.keys(body ?? {});
  if (bodyKeys.some((k) => champsInterdits.includes(k))) {
    return NextResponse.json(
      { error: "Modification non autorisée pour ce rôle" },
      { status: 403 }
    );
  }

  try {
    const updated = await prisma.student.update({
      where: { id: studentId },
      data: parsed.data,
    });
    return NextResponse.json(updated);
  } catch (e: any) {
    if (e?.code === "P2025") {
      return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    }
    throw e;
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const studentId = Number(id);
  if (Number.isNaN(studentId)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  const auth = await requireRole(["ADMIN"]);
  if ("error" in auth) return auth.error;

  try {
    await prisma.student.delete({ where: { id: studentId } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === "P2025") {
      return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    }
    throw e;
  }
}