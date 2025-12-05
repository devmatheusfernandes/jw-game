export default function SessionPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-screen-xl px-4 py-12 space-y-6">
        <section className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Sala de Jogo: {params.id}</h1>
        </section>
      </main>
    </div>
  );
}