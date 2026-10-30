"use client";

import { useRouter } from "next/navigation";

export default function DeleteStudentButton({ id }: { id: number }) {
  const router = useRouter();

  async function onDelete() {
    if (!confirm("Supprimer cet étudiant ?")) return;
    const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
    if (res.status === 403) {
      alert("Action interdite");
      return;
    }
    router.refresh();
  }

  return (
    <button onClick={onDelete} className="text-red-600 underline">
      Supprimer
    </button>
  );
}