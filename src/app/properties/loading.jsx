import React from "react";

export default function PropertiesLoading() {
  return (
    <main className="min-h-screen flex-1 bg-[#f7f7f3] pb-24 md:pb-16">
      <section className="border-b border-ink/8 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="mt-3 h-8 w-64 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-40 animate-pulse rounded bg-gray-200" />
          <div className="mt-5 h-12 w-full animate-pulse rounded-xl bg-gray-100" />
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-7 px-4 py-7 sm:px-6 lg:grid-cols-[260px_1fr]">
        <aside className="hidden h-96 rounded-2xl border border-ink/8 bg-white p-5 lg:block">
          <div className="h-6 w-20 animate-pulse rounded bg-gray-200" />
          <div className="mt-6 space-y-4">
            <div className="h-10 w-full animate-pulse rounded-xl bg-gray-100" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-gray-100" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-gray-100" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-gray-100" />
          </div>
        </aside>

        <section>
          <div className="mb-5 flex items-center justify-between">
            <div className="h-6 w-28 animate-pulse rounded-full bg-gray-200" />
            <div className="h-8 w-32 animate-pulse rounded-xl bg-gray-200" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="aspect-[4/3] w-full animate-pulse bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
                    <div className="h-5 w-16 animate-pulse rounded-full bg-gray-100" />
                  </div>
                  <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="h-8 animate-pulse rounded-xl bg-gray-100" />
                    <div className="h-8 animate-pulse rounded-xl bg-gray-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
