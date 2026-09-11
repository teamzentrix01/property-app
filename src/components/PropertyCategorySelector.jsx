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
      <legend className="text-sm font-semibold text-gray-900">Show Property In{required && " *"}</legend>
      <p className="mt-1 text-xs text-gray-500">
        Choose every section where this property should appear after approval.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CONTENT_CATEGORIES.map((category) => {
          const isSelected = selected.has(category.value);
          return (
            <label
              key={category.value}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 transition ${
                isSelected
                  ? "border-[#15803D] bg-[#DCFCE7]/70 text-[#14532D] shadow-xs font-semibold ring-1 ring-[#15803D]/20"
                  : "border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggle(category.value)}
                className="h-4 w-4 accent-[#15803D] rounded"
              />
              <span className="text-sm font-medium">{category.label}</span>
              {isSelected && <span className="ml-auto text-sm font-bold text-[#15803D]">✓</span>}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
