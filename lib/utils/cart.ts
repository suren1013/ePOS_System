import type { CartLine } from "@/types/sales";

export function calculateCartSubtotal(lines: CartLine[]): number {
  return roundMoney(
    lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
  );
}

export function calculateCartTotal(lines: CartLine[]): number {
  return calculateCartSubtotal(lines);
}

export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}
