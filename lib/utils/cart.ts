import type { CartLine } from "@/types/sales";

export function calculateCartSubtotal(lines: CartLine[]): number {
  return roundMoney(
    lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
  );
}

export function calculateCartDiscount(lines: CartLine[]): number {
  return roundMoney(
    lines.reduce((sum, line) => sum + (line.discount || 0), 0)
  );
}

export function calculateCartTax(lines: CartLine[]): number {
  return roundMoney(
    lines.reduce((sum, line) => {
      const lineTotal = line.unitPrice * line.quantity - (line.discount || 0);
      return sum + (line.tax || 0);
    }, 0)
  );
}

export function calculateCartTotal(lines: CartLine[]): number {
  const subtotal = calculateCartSubtotal(lines);
  const discount = calculateCartDiscount(lines);
  const tax = calculateCartTax(lines);
  return roundMoney(subtotal - discount + tax);
}

export function calculateLineTotal(line: CartLine): number {
  const subtotal = line.unitPrice * line.quantity;
  const discount = line.discount || 0;
  const tax = line.tax || 0;
  return roundMoney(subtotal - discount + tax);
}

export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}
