import { z } from "zod";

export const createStudentSchema = z.object({
  firstName: z.string().trim().min(2, "Prénom : 2 caractères minimum"),
  lastName: z.string().trim().min(2, "Nom : 2 caractères minimum"),
  email: z.string().trim().toLowerCase().email("Email invalide"),
  filiere: z.string().trim().min(2, "Filière requise"),
  niveau: z.string().trim().min(1, "Niveau requis"),
  notes: z.string().trim().optional(),
});

export const updateStudentSchema = createStudentSchema.partial();

export const enseignantUpdateSchema = z.object({
  filiere: z.string().trim().min(2).optional(),
  niveau: z.string().trim().min(1).optional(),
  notes: z.string().trim().optional(),
});