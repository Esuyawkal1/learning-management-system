"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "@/components/common/icons";
import { getCategories } from "@/services/category.service";

let categoriesCache = null;
let categoriesPromise = null;

const loadCategories = async () => {
  if (categoriesCache) {
    return categoriesCache;
  }

  if (!categoriesPromise) {
    categoriesPromise = getCategories()
      .then((categories) => {
        categoriesCache = [...(categories || [])].sort((left, right) =>
          String(left.name || "").localeCompare(String(right.name || ""))
        );
        return categoriesCache;
      })
      .finally(() => {
        categoriesPromise = null;
      });
  }

  return categoriesPromise;
};

export default function CategorySelect({
  value,
  onChange,
  label = "Category",
  name = "categoryId",
  required = false,
  disabled = false,
  error,
}) {
  const [categories, setCategories] = useState(categoriesCache || []);
  const [loading, setLoading] = useState(!categoriesCache);
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    let isMounted = true;

    loadCategories()
      .then((response) => {
        if (!isMounted) return;
        setCategories(response || []);
        setRequestError("");
      })
      .catch((loadError) => {
        if (!isMounted) return;
        setRequestError(loadError.message || "Failed to load categories.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleValueChange = (event) => {
    onChange(event.target.value);
  };

  const fieldError = error || requestError;
  const hasActiveCategories = categories.some((category) => category.isActive !== false);
  const placeholderText = loading
    ? "Loading categories..."
    : hasActiveCategories
      ? "Select a category"
      : "No categories found";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" /> : null}
      </div>

      <div className="relative">
        <select
          name={name}
          required={required}
          value={value || ""}
          onChange={handleValueChange}
          disabled={disabled || loading}
          className={`w-full appearance-none rounded-lg border bg-white px-4 py-2 pr-11 text-sm text-slate-700 transition focus:ring-2 focus:ring-blue-500 focus:outline-none ${
            fieldError ? "border-rose-300" : "border-slate-300"
          } ${disabled || loading ? "cursor-not-allowed opacity-70" : ""}`}
        >
          <option value="">{placeholderText}</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id} disabled={category.isActive === false}>
              {category.name}
              {category.isActive === false ? " (Inactive)" : ""}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>

      {fieldError ? <p className="text-sm text-rose-600">{fieldError}</p> : null}
    </div>
  );
}
