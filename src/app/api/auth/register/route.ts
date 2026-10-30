import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";
import { createSession } from "@/lib/session";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Cet email est déjà utilisé" },
      { status: 409 }
    );
  }

  const hash = await bcrypt.hash(password, 10);
  

  const user = await prisma.user.create({
    data: { 
      name, 
      email, 
      password: hash,
      role: "ETUDIANT" 
    },
  });

  
  const nameParts = name.split(" ");
  const firstName = nameParts[0] || "Prénom";
  const lastName = nameParts.slice(1).join(" ") || "Nom";

  await prisma.student.create({
    data: {
      firstName: firstName,
      lastName: lastName,
      email: email,
      filiere: "Non définie", 
      niveau: "Non défini",   
      userId: user.id,        
    }
  });

  // 3. Ouverture de la session
  await createSession(user.id);

  return NextResponse.json(
    { id: user.id, name: user.name, email: user.email },
    { status: 201 }
  );
}