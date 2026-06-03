"use client";

import { Input } from "@/components/ui/input";
import type { ProductFormInput } from "@/types/product";

interface ProductFormFieldsProps {
  values: ProductFormInput;
  onChange: (field: keyof ProductFormInput, value: string) => void;
  disabled?: boolean;
  formError?: string | null;
}

export function ProductFormFields({
  values,
  onChange,
  disabled = false,
  formError,
}: ProductFormFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Product name"
        name="name"
        required
        value={values.name}
        onChange={(e) => onChange("name", e.target.value)}
        disabled={disabled}
        placeholder="e.g. Organic Coffee Beans 1kg"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="SKU"
          name="sku"
          required
          value={values.sku}
          onChange={(e) => onChange("sku", e.target.value)}
          disabled={disabled}
          placeholder="WH-001"
        />
        <Input
          label="Barcode"
          name="barcode"
          value={values.barcode}
          onChange={(e) => onChange("barcode", e.target.value)}
          disabled={disabled}
          placeholder="Optional"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Wholesale price"
          name="wholesale_price"
          type="number"
          min="0"
          step="0.01"
          required
          value={values.wholesale_price}
          onChange={(e) => onChange("wholesale_price", e.target.value)}
          disabled={disabled}
          placeholder="0.00"
        />
        <Input
          label="Suggested retail price"
          name="suggested_retail_price"
          type="number"
          min="0"
          step="0.01"
          value={values.suggested_retail_price}
          onChange={(e) => onChange("suggested_retail_price", e.target.value)}
          disabled={disabled}
          placeholder="Optional"
        />
      </div>
      {formError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {formError}
        </p>
      )}
    </div>
  );
}
