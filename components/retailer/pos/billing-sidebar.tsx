"use client";

import { Input } from "@/components/ui/input";
import { PAYMENT_METHODS, type PaymentMethod } from "@/types/sales";

interface BillingSidebarProps {
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  customerName: string;
  onCustomerNameChange: (name: string) => void;
  saleDate: string;
  onSaleDateChange: (date: string) => void;
}

export function BillingSidebar({
  paymentMethod,
  onPaymentMethodChange,
  customerName,
  onCustomerNameChange,
  saleDate,
  onSaleDateChange,
}: BillingSidebarProps) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Customer</h3>
        <Input
          placeholder="Customer name (optional)"
          value={customerName}
          onChange={(e) => onCustomerNameChange(e.target.value)}
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Date</h3>
        <Input
          type="date"
          value={saleDate}
          onChange={(e) => onSaleDateChange(e.target.value)}
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm flex-1">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Payment Mode</h3>
        <fieldset className="space-y-2">
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
      </div>
    </div>
  );
}
