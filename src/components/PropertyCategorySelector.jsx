import { CONTENT_CATEGORIES } from "@/lib/contentCategories";

export default function PropertyCategorySelector({ value = [], onChange, required = false }) {
  const selected = new Set(value);
  const toggle = (category) => {
    const next = selected.has(category)
      ? value.filter((item) => item !== category)
      : [...value, category];
    onChange(next);
  };

  return (
    <fieldset className="sm:col-span-2">
      <legend className="text-sm font-semibold">Show Property In{required && " *"}</legend>
      <p className="mt-1 text-xs text-ink-soft">
        Choose every section where this property should appear after approval.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CONTENT_CATEGORIES.map((category) => {
          const isSelected = selected.has(category.value);
          return (
            <label
              key={category.value}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${
                isSelected
                  ? "border-moss bg-moss/10 text-moss-deep shadow-sm"
                  : "border-ink/10 bg-white text-ink hover:border-moss/40"
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggle(category.value)}
                className="h-4 w-4 accent-moss"
              />
              <span className="font-semibold">{category.label}</span>
              {isSelected && <span className="ml-auto text-sm">✓</span>}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
