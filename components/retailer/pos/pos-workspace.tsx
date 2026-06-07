"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { completeSale } from "@/app/actions/retailer/sales";
import { Input } from "@/components/ui/input";
import { BillingSidebar } from "@/components/retailer/pos/billing-sidebar";
import { BillingTable } from "@/components/retailer/pos/billing-table";
import { SearchDropdown } from "@/components/retailer/pos/search-dropdown";
import { TotalsPanel } from "@/components/retailer/pos/totals-panel";
import {
  calculateCartDiscount,
  calculateCartSubtotal,
  calculateCartTax,
  calculateCartTotal,
} from "@/lib/utils/cart";
import { filterInventoryForPos } from "@/lib/utils/pos-search";
import type { InventoryItem } from "@/types/inventory";
import type { CartLine, PaymentMethod } from "@/types/sales";

interface PosWorkspaceProps {
  initialInventory: InventoryItem[];
  loadError?: string | null;
}

function inventoryItemToCartLine(item: InventoryItem, quantity = 1): CartLine {
  return {
    inventoryId: item.id,
    productId: item.product_id,
    productName: item.product_name,
    sku: item.sku,
    barcode: item.barcode,
    unitPrice: item.retail_price,
    quantity,
    maxStock: item.stock_quantity,
    discount: 0,
    tax: 0,
  };
}

export function PosWorkspace({ initialInventory, loadError }: PosWorkspaceProps) {
  const [inventory, setInventory] = useState(initialInventory);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [customerName, setCustomerName] = useState("");
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [billDiscount, setBillDiscount] = useState(0);
  const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [selectedSearchIndex, setSelectedSearchIndex] = useState<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = useMemo(
    () => filterInventoryForPos(inventory, searchQuery),
    [inventory, searchQuery]
  );

  const subtotal = useMemo(() => calculateCartSubtotal(cartLines), [cartLines]);
  const discount = useMemo(() => calculateCartDiscount(cartLines), [cartLines]);
  const tax = useMemo(() => calculateCartTax(cartLines), [cartLines]);
  const total = useMemo(() => calculateCartTotal(cartLines) - billDiscount, [cartLines, billDiscount]);

  const getStockForInventory = useCallback(
    (inventoryId: string) =>
      inventory.find((item) => item.id === inventoryId)?.stock_quantity ?? 0,
    [inventory]
  );

  const handleAddToCart = useCallback(
    (item: InventoryItem) => {
      console.log("handleAddToCart - adding item:", item);
      setCheckoutError(null);
      setSuccessMessage(null);
      setCartLines((prev) => {
        const existing = prev.find((line) => line.inventoryId === item.id);
        if (existing) {
          const nextQty = Math.min(existing.quantity + 1, item.stock_quantity);
          return prev.map((line) =>
            line.inventoryId === item.id
              ? { ...line, quantity: nextQty, maxStock: item.stock_quantity }
              : line
          );
        }
        return [...prev, inventoryItemToCartLine(item)];
      });
      setSearchQuery("");
      setIsSearchDropdownOpen(false);
      setSelectedSearchIndex(null);
    },
    []
  );

  const handleQuantityChange = useCallback(
    (inventoryId: string, quantity: number) => {
      setCheckoutError(null);
      setSuccessMessage(null);
      const maxStock = getStockForInventory(inventoryId);
      const clamped = Math.max(1, Math.min(Math.floor(quantity), maxStock));

      setCartLines((prev) =>
        prev.map((line) =>
          line.inventoryId === inventoryId
            ? { ...line, quantity: clamped, maxStock }
            : line
        )
      );
    },
    [getStockForInventory]
  );

  const handleRemove = useCallback((inventoryId: string) => {
    setCheckoutError(null);
    setSuccessMessage(null);
    setCartLines((prev) => prev.filter((line) => line.inventoryId !== inventoryId));
    setSelectedLineIndex(null);
  }, []);

  const handleDiscountChange = useCallback((inventoryId: string, discount: number) => {
    setCheckoutError(null);
    setSuccessMessage(null);
    setCartLines((prev) =>
      prev.map((line) =>
        line.inventoryId === inventoryId ? { ...line, discount } : line
      )
    );
  }, []);

  const handleTaxChange = useCallback((inventoryId: string, tax: number) => {
    setCheckoutError(null);
    setSuccessMessage(null);
    setCartLines((prev) =>
      prev.map((line) =>
        line.inventoryId === inventoryId ? { ...line, tax } : line
      )
    );
  }, []);

  const handleNewBill = useCallback(() => {
    setCartLines([]);
    setCustomerName("");
    setBillDiscount(0);
    setSelectedLineIndex(null);
    setCheckoutError(null);
    setSuccessMessage(null);
    setSearchQuery("");
    searchInputRef.current?.focus();
  }, []);

  const handleHoldBill = useCallback(() => {
    setSuccessMessage("Bill held. Press F5 to retrieve.");
  }, []);

  const handleCompleteSale = useCallback(() => {
    setCheckoutError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await completeSale({
        payment_method: paymentMethod,
        items: cartLines.map((line) => ({
          inventory_id: line.inventoryId,
          product_id: line.productId,
          quantity: line.quantity,
          unit_price: line.unitPrice,
        })),
      });

      if (!result.success) {
        setCheckoutError(result.error);
        return;
      }

      setInventory(result.data.updatedInventory);
      setCartLines([]);
      const receiptNumber = result.data.sale_id ? result.data.sale_id.slice(0, 8) : 'UNKNOWN';
      setSuccessMessage(`Sale completed. Receipt #${receiptNumber}`);
    });
  }, [cartLines, paymentMethod]);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "B") {
        e.preventDefault();
        handleNewBill();
      } else if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        if (cartLines.length > 0) {
          handleCompleteSale();
        }
      } else if (e.key === "F1") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (isSearchDropdownOpen) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedSearchIndex((prev) => {
            if (filteredProducts.length === 0) return null;
            const next = prev === null ? 0 : Math.min(prev + 1, filteredProducts.length - 1);
            console.log("ArrowDown - selectedSearchIndex:", next);
            return next;
          });
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedSearchIndex((prev) => {
            if (filteredProducts.length === 0) return null;
            const next = prev === null ? 0 : Math.max(prev - 1, 0);
            console.log("ArrowUp - selectedSearchIndex:", next);
            return next;
          });
        } else if (e.key === "Enter" && selectedSearchIndex !== null) {
          e.preventDefault();
          const selectedItem = filteredProducts[selectedSearchIndex];
          if (selectedItem) {
            console.log("Enter - adding selected item:", selectedItem);
            handleAddToCart(selectedItem);
          }
        } else if (e.key === "Escape") {
          e.preventDefault();
          setIsSearchDropdownOpen(false);
          setSelectedSearchIndex(null);
        }
      } else if (e.key === "F2" && selectedLineIndex !== null) {
        e.preventDefault();
        const line = cartLines[selectedLineIndex];
        const newQty = prompt(`Edit quantity for ${line.productName}:`, line.quantity.toString());
        if (newQty !== null) {
          const qty = Number(newQty);
          if (!Number.isNaN(qty) && qty > 0) {
            handleQuantityChange(line.inventoryId, qty);
          }
        }
      } else if (e.key === "F3" && selectedLineIndex !== null) {
        e.preventDefault();
        const line = cartLines[selectedLineIndex];
        const newDiscount = prompt(`Edit discount for ${line.productName}:`, (line.discount || 0).toString());
        if (newDiscount !== null) {
          const disc = Number(newDiscount);
          if (!Number.isNaN(disc) && disc >= 0) {
            handleDiscountChange(line.inventoryId, disc);
          }
        }
      } else if (e.key === "F4" && selectedLineIndex !== null) {
        e.preventDefault();
        handleRemove(cartLines[selectedLineIndex].inventoryId);
      } else if (e.key === "F5") {
        e.preventDefault();
        handleHoldBill();
      } else if (e.key === "F6" && selectedLineIndex !== null) {
        e.preventDefault();
        alert("Unit change feature - coming soon");
      } else if (e.key === "F9") {
        e.preventDefault();
        const newBillDiscount = prompt("Enter bill discount:", billDiscount.toString());
        if (newBillDiscount !== null) {
          const disc = Number(newBillDiscount);
          if (!Number.isNaN(disc) && disc >= 0) {
            setBillDiscount(disc);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cartLines, selectedLineIndex, handleNewBill, handleCompleteSale, handleQuantityChange, handleDiscountChange, handleRemove, handleHoldBill, billDiscount, isSearchDropdownOpen, filteredProducts, selectedSearchIndex, handleAddToCart]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log("handleSearchChange - searchQuery:", value);
    setSearchQuery(value);
    setIsSearchDropdownOpen(value.trim().length > 0);
    setSelectedSearchIndex(null);
  }, []);

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const query = searchQuery.trim();
      console.log("handleSearchKeyDown - Enter pressed, query:", query);

      // Defensive guard: do nothing if search is empty
      if (!query) {
        console.log("Search query is empty, doing nothing");
        return;
      }

      // Check if query matches a barcode exactly
      const barcodeMatch = inventory.find(
        (item) => item.barcode === query && item.stock_quantity > 0
      );

      if (barcodeMatch) {
        console.log("Barcode match found:", barcodeMatch);
        handleAddToCart(barcodeMatch);
        setSearchQuery("");
        setIsSearchDropdownOpen(false);
        setSelectedSearchIndex(null);
        // Auto-focus back to search field for rapid scanning
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
      } else if (isSearchDropdownOpen && selectedSearchIndex !== null) {
        // If dropdown is open and item is selected, add it
        const selectedItem = filteredProducts[selectedSearchIndex];
        if (selectedItem) {
          console.log("Enter - adding selected item:", selectedItem);
          handleAddToCart(selectedItem);
        }
      } else if (filteredProducts.length > 0) {
        // Open dropdown for manual selection (do not auto-add)
        console.log("Opening dropdown for manual selection");
        setIsSearchDropdownOpen(true);
        setSelectedSearchIndex(0);
      } else {
        // No match found - show warning and keep focus
        console.log("No product found for query:", query);
        setCheckoutError(`Product not found: ${query}`);
        setTimeout(() => setCheckoutError(null), 3000);
        // Keep focus in search field
        searchInputRef.current?.focus();
      }
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Escape") {
      if (!isSearchDropdownOpen && filteredProducts.length > 0) {
        setIsSearchDropdownOpen(true);
        setSelectedSearchIndex(0);
      }
    }
  }, [searchQuery, inventory, isSearchDropdownOpen, selectedSearchIndex, filteredProducts, handleAddToCart]);

  const handleSearchFocus = useCallback(() => {
    if (searchQuery.trim().length > 0) {
      setIsSearchDropdownOpen(true);
    }
  }, [searchQuery]);

  const handleSearchBlur = useCallback(() => {
    setTimeout(() => {
      setIsSearchDropdownOpen(false);
    }, 200);
  }, []);

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      {loadError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {loadError}
        </p>
      )}

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Input
            ref={searchInputRef}
            placeholder="Scan barcode or search by SKU/product name... (F1 to focus, Enter to add)"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            className="text-base"
          />
          <SearchDropdown
            items={filteredProducts}
            searchQuery={searchQuery}
            isOpen={isSearchDropdownOpen}
            selectedIndex={selectedSearchIndex}
            onSelect={handleAddToCart}
            onClose={() => {
              setIsSearchDropdownOpen(false);
              setSelectedSearchIndex(null);
            }}
            onNavigate={(direction) => {
              if (direction === "up") {
                setSelectedSearchIndex((prev) => {
                  if (filteredProducts.length === 0) return null;
                  const next = prev === null ? 0 : Math.max(prev - 1, 0);
                  console.log("Navigate up - selectedSearchIndex:", next);
                  return next;
                });
              } else {
                setSelectedSearchIndex((prev) => {
                  if (filteredProducts.length === 0) return null;
                  const next = prev === null ? 0 : Math.min(prev + 1, filteredProducts.length - 1);
                  console.log("Navigate down - selectedSearchIndex:", next);
                  return next;
                });
              }
            }}
          />
        </div>
        <div className="flex gap-2 text-xs text-slate-500">
          <span className="px-2 py-1 bg-slate-100 rounded">F1: Search</span>
          <span className="px-2 py-1 bg-slate-100 rounded">F2: Qty</span>
          <span className="px-2 py-1 bg-slate-100 rounded">F3: Disc</span>
          <span className="px-2 py-1 bg-slate-100 rounded">F4: Remove</span>
          <span className="px-2 py-1 bg-slate-100 rounded">F5: Hold</span>
          <span className="px-2 py-1 bg-slate-100 rounded">F9: Bill Disc</span>
          <span className="px-2 py-1 bg-slate-100 rounded">Shift+B: New</span>
          <span className="px-2 py-1 bg-slate-100 rounded">Ctrl+S: Complete</span>
        </div>
      </div>

      <div className="grid gap-4 flex-1 lg:grid-cols-12 min-h-0">
        <div className="lg:col-span-9 flex flex-col min-h-0 rounded-lg border border-slate-200 bg-white shadow-sm">
          <BillingTable
            lines={cartLines}
            selectedLineIndex={selectedLineIndex}
            onQuantityChange={handleQuantityChange}
            onDiscountChange={handleDiscountChange}
            onTaxChange={handleTaxChange}
            onRemove={handleRemove}
            onSelectLine={setSelectedLineIndex}
          />
        </div>
        <div className="lg:col-span-3 min-h-0">
          <BillingSidebar
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            customerName={customerName}
            onCustomerNameChange={setCustomerName}
            saleDate={saleDate}
            onSaleDateChange={setSaleDate}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <TotalsPanel
          subtotal={subtotal}
          discount={discount}
          tax={tax}
          total={total}
          billDiscount={billDiscount}
          onBillDiscountChange={setBillDiscount}
        />
        <div className="flex-1" />
        {checkoutError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {checkoutError}
          </p>
        )}
        {successMessage && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800" role="status">
            {successMessage}
          </p>
        )}
        <button
          type="button"
          onClick={handleCompleteSale}
          disabled={cartLines.length === 0}
          className="px-6 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Processing..." : "Complete Sale (Ctrl+S)"}
        </button>
      </div>
    </div>
  );
}
