import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center gap-4 pt-24">
      <h1 className="text-3xl font-bold">TP Auth — mon-projet-rima</h1>
      <div className="flex gap-4">
        <Link className="underline" href="/login">Se connecter</Link>
        <Link className="underline" href="/register">S'inscrire</Link>
      </div>
    </main>
  );
}