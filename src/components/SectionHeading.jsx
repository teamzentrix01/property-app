export default function SectionHeading({ eyebrow = "Discover Bhoomi", title, description, action }) {
  return <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
    <div className="min-w-0">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[.16em] text-green-700">{eyebrow}</p>
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{title}</h2>
      <div aria-hidden="true" className="mt-3 flex gap-1"><span className="h-1 w-10 rounded-full bg-green-700"/><span className="h-1 w-4 rounded-full bg-red-600"/></div>
      {description && <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">{description}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>;
}
