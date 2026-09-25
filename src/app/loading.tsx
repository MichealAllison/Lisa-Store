export default function Loading() {
  return (
    <div className="container-site py-10">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[4/5] rounded-xl bg-ink/10" />
            <div className="mt-3 h-3 w-2/3 rounded bg-ink/10" />
            <div className="mt-2 h-3 w-1/3 rounded bg-ink/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
