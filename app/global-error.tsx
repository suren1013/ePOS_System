"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center font-sans">
        <h2 className="text-xl font-semibold text-slate-900">Application error</h2>
        <p className="max-w-md text-sm text-slate-600">
          {error.message || "A critical error occurred."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
