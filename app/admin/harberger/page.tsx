import Link from 'next/link';

const tools = [
  {
    href: '/admin/harberger/factory',
    title: 'Factory manager',
    description:
      'Review factory state, update global addresses, and create new slots.',
  },
  {
    href: '/admin/harberger/metadata',
    title: 'Metadata visualizer',
    description:
      'Compare on-chain slots with local metadata JSON and export templates.',
  },
];

export default function AdminHarbergerIndexPage() {
  return (
    <div className="mx-auto flex w-full flex-col gap-6 py-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-black">Harberger admin</h1>
        <p className="text-sm text-black/60">
          Access administrative tools for managing Harberger slots without
          running local scripts.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="rounded-lg border border-black/10 bg-white p-5 shadow-sm transition hover:border-black/20 hover:shadow"
          >
            <h2 className="text-lg font-semibold text-black">{tool.title}</h2>
            <p className="mt-1 text-sm text-black/60">{tool.description}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-black">
              Open tool →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
