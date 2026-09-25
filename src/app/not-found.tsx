import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-site flex flex-col items-center py-32 text-center">
      <p className="text-7xl font-extrabold tracking-tight">
        4<span className="text-accent">0</span>4
      </p>
      <h1 className="mt-4 text-xl font-bold uppercase">This page sold out</h1>
      <p className="mt-2 max-w-sm text-sm text-ink/60">
        The page you&apos;re looking for doesn&apos;t exist — but the collection is still live.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn-outline">Back home</Link>
        <Link href="/shop" className="btn-primary">Shop the collection</Link>
      </div>
    </div>
  );
}
