"use client";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="p-8 text-center">
      <h2 className="text-red-600 font-bold">Une erreur est survenue.</h2>
      <button onClick={() => reset()} className="mt-4 underline">Réessayer</button>
    </div>
  );
}