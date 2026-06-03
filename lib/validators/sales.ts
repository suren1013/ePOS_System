import type { CheckoutInput, CheckoutLineInput, PaymentMethod } from "@/types/sales";

export function parseCheckoutInput(
  input: CheckoutInput
): { data: CheckoutInput } | { error: string } {
  if (!input.items.length) {
    return { error: "Add at least one product to the cart." };
  }

  if (input.payment_method !== "cash" && input.payment_method !== "card") {
    return { error: "Select a valid payment method." };
  }

  const parsedItems: CheckoutLineInput[] = [];

  for (const item of input.items) {
    const inventoryId = item.inventory_id?.trim();
    const productId = item.product_id?.trim();

    if (!inventoryId || !productId) {
      return { error: "Invalid cart item." };
    }

    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      return { error: "Each item must have a quantity of at least 1." };
    }

    if (typeof item.unit_price !== "number" || item.unit_price < 0 || Number.isNaN(item.unit_price)) {
      return { error: "Invalid unit price in cart." };
    }

    parsedItems.push({
      inventory_id: inventoryId,
      product_id: productId,
      quantity: item.quantity,
      unit_price: Math.round(item.unit_price * 100) / 100,
    });
  }

  const seen = new Set<string>();
  for (const item of parsedItems) {
    if (seen.has(item.inventory_id)) {
      return { error: "Duplicate inventory item in cart." };
    }
    seen.add(item.inventory_id);
  }

  return {
    data: {
      payment_method: input.payment_method as PaymentMethod,
      items: parsedItems,
    },
  };
}
