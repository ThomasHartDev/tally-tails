import type { LoaderFunctionArgs } from "react-router";
import { Link } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  throw new Response(`${new URL(request.url).pathname} not found`, {
    status: 404,
  });
}

export default function CatchAllPage() {
  // Loader always throws, so this default export only runs if React Router
  // ever rendered the route directly. The shared ErrorBoundary in root.tsx
  // handles the actual 404 surface. Render a soft fallback just in case.
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
      <img
        src="/brand/mascots/cat-shocked.webp"
        alt=""
        width="200"
        height="200"
        className="h-40 w-40 object-contain"
      />
      <h1 className="mt-6 font-display text-3xl font-bold tracking-[-0.04em] text-[var(--color-ink)]">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
        That URL didn't match anything in the catalog or the journal.
      </p>
      <Link to="/" className="btn-primary mt-6">
        Back to the score
      </Link>
    </div>
  );
}
