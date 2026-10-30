"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Student = {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  filiere: string;
  niveau: string;
  notes?: string | null;
};

export default function StudentForm({
  mode,
  initial,
  role,
}: {
  mode: "create" | "edit";
  initial?: Student;
  role?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<Student>(
    initial ?? {
      firstName: "",
      lastName: "",
      email: "",
      filiere: "",
      niveau: "",
      notes: "",
    }
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const url =
        mode === "create"
          ? "/api/students"
          : `/api/students/${initial?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const isEnseignant = role === "ENSEIGNANT";
      
      // On n'envoie pas les champs bloqués à l'API pour éviter l'erreur 403
      const bodyToSend = isEnseignant 
        ? { filiere: form.filiere, niveau: form.niveau, notes: form.notes }
        : form;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyToSend),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur");
        return;
      }
      router.push("/students");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  function update<K extends keyof Student>(key: K, v: Student[K]) {
    setForm((f) => ({ ...f, [key]: v }));
  }

  // On vérifie si l'utilisateur est un enseignant
  const isEnseignant = role === "ENSEIGNANT";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <input
        className="rounded border p-2 disabled:bg-gray-200 disabled:text-gray-500"
        placeholder="Prénom"
        value={form.firstName}
        onChange={(e) => update("firstName", e.target.value)}
        disabled={isEnseignant} // <-- Désactive le champ
      />
      <input
        className="rounded border p-2 disabled:bg-gray-200 disabled:text-gray-500"
        placeholder="Nom"
        value={form.lastName}
        onChange={(e) => update("lastName", e.target.value)}
        disabled={isEnseignant} // <-- Désactive le champ
      />
      <input
        className="rounded border p-2 disabled:bg-gray-200 disabled:text-gray-500"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => update("email", e.target.value)}
        disabled={isEnseignant} // <-- Désactive le champ
      />
      <input
        className="rounded border p-2"
        placeholder="Filière"
        value={form.filiere}
        onChange={(e) => update("filiere", e.target.value)}
      />
      <input
        className="rounded border p-2"
        placeholder="Niveau"
        value={form.niveau}
        onChange={(e) => update("niveau", e.target.value)}
      />
      <input
        className="rounded border p-2"
        placeholder="Notes (optionnel)"
        value={form.notes ?? ""}
        onChange={(e) => update("notes", e.target.value)}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        disabled={loading}
        className="rounded bg-teal-700 px-3 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}