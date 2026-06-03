"use client";

import { Button } from "@/components/ui/button";
import { PAYMENT_METHODS, type PaymentMethod } from "@/types/sales";

interface CheckoutPanelProps {
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onComplete: () => void;
  disabled: boolean;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

export function CheckoutPanel({
  paymentMethod,
  onPaymentMethodChange,
  onComplete,
  disabled,
  loading,
  error,
  successMessage,
}: CheckoutPanelProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">Checkout</h2>
      <p className="mt-1 text-xs text-slate-500">Select payment method and complete the sale.</p>

      <fieldset className="mt-4 space-y-2">
        <legend className="sr-only">Payment method</legend>
        {PAYMENT_METHODS.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50"
          >
            <input
              type="radio"
              name="paymentMethod"
              value={option.value}
              checked={paymentMethod === option.value}
              onChange={() => onPaymentMethodChange(option.value)}
              className="text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium text-slate-900">{option.label}</span>
          </label>
        ))}
      </fieldset>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      {successMessage && (
        <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800" role="status">
          {successMessage}
        </p>
      )}

      <Button
        type="button"
        className="mt-4 w-full"
        onClick={onComplete}
        disabled={disabled}
        loading={loading}
      >
        Complete sale
      </Button>
    </div>
  );
}
