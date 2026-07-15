import type { ChangeEvent, FormEvent } from "react";

import Button from "../common/Button";

type FilterOption = {
  label: string;
  value: string;
};

export type ProductFiltersValue = {
  searchTerm: string;
  category: string;
  condition: string;
  priceRange: string;
  location: string;
  sortBy: string;
};

type ProductFiltersProps = {
  values: ProductFiltersValue;
  categoryShortcuts: FilterOption[];
  categoryOptions: FilterOption[];
  conditionOptions: FilterOption[];
  priceOptions: FilterOption[];
  locationOptions: FilterOption[];
  sortOptions: FilterOption[];
  onSearchTermChange: (value: string) => void;
  onFieldChange: (field: keyof ProductFiltersValue, value: string) => void;
  onSearch: (event: FormEvent<HTMLFormElement>) => void;
};

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <label className="marketplace-filter-select">
      <span>{label}</span>
      <select value={value} onChange={onChange}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function ProductFilters({
  values,
  categoryShortcuts,
  categoryOptions,
  conditionOptions,
  priceOptions,
  locationOptions,
  sortOptions,
  onSearchTermChange,
  onFieldChange,
  onSearch,
}: ProductFiltersProps) {
  return (
    <form className="marketplace-filters" onSubmit={onSearch}>
      <div className="marketplace-search-row">
        <div className="marketplace-search-input">
          <input
            type="search"
            value={values.searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
          />
        </div>
        <Button type="submit">Search</Button>
      </div>

      <div className="marketplace-shortcuts" aria-label="Category shortcuts">
        {categoryShortcuts.map((shortcut) => (
          <button
            key={shortcut.value}
            type="button"
            className={[
              "marketplace-shortcut-chip",
              values.category === shortcut.value
                ? "marketplace-shortcut-chip--active"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onFieldChange("category", shortcut.value)}
          >
            {shortcut.label}
          </button>
        ))}
      </div>

      <div className="marketplace-filter-grid">
        <FilterSelect
          label="Category"
          value={values.category}
          options={categoryOptions}
          onChange={(event) => onFieldChange("category", event.target.value)}
        />
        <FilterSelect
          label="Condition"
          value={values.condition}
          options={conditionOptions}
          onChange={(event) => onFieldChange("condition", event.target.value)}
        />
        <FilterSelect
          label="Price range"
          value={values.priceRange}
          options={priceOptions}
          onChange={(event) => onFieldChange("priceRange", event.target.value)}
        />
        <FilterSelect
          label="Location"
          value={values.location}
          options={locationOptions}
          onChange={(event) => onFieldChange("location", event.target.value)}
        />
        <FilterSelect
          label="Sort by"
          value={values.sortBy}
          options={sortOptions}
          onChange={(event) => onFieldChange("sortBy", event.target.value)}
        />
      </div>
    </form>
  );
}
