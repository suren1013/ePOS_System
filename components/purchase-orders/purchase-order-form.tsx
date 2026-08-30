"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { getAllWholesalersList, getWholesalerProducts } from "@/app/actions/retailer/purchase-orders";
import { PurchaseOrderCart } from "./purchase-order-cart";
import type { CartItem } from "@/types/purchase-orders";

interface Wholesaler {
  id: string;
  business_name: string;
  contact_email: string;
}

interface ProductSearchResult {
  id: string;
  wholesaler_id: string;
  sku: string;
  barcode: string | null;
  name: string;
  wholesale_price: number;
  suggested_retail_price: number | null;
  wholesalers: {
    id: string;
    business_name: string;
    contact_email: string;
  };
}

export function PurchaseOrderForm() {
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([]);
  const [selectedWholesalerId, setSelectedWholesalerId] = useState<string | null>(null);
  const [selectedWholesaler, setSelectedWholesaler] = useState<Wholesaler | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [loadingWholesalers, setLoadingWholesalers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWholesalers();
  }, []);

  const loadWholesalers = async () => {
    setLoadingWholesalers(true);
    setError(null);
    const result = await getAllWholesalersList();
    if (result.success) {
      setWholesalers(result.data);
    } else {
      setError(result.error);
    }
    setLoadingWholesalers(false);
  };

  const handleWholesalerSelect = (wholesalerId: string) => {
    setSelectedWholesalerId(wholesalerId);
    const wholesaler = wholesalers.find((w) => w.id === wholesalerId);
    setSelectedWholesaler(wholesaler || null);
    // Clear cart when switching wholesalers
    setCart([]);
    setSearchResults([]);
    setSearchTerm("");
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (!selectedWholesalerId) {
      setError("Please select a wholesaler first");
      return;
    }
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    setError(null);

    const result = await getWholesalerProducts(selectedWholesalerId, term);

    if (result.success) {
      setSearchResults(result.data);
    } else {
      setError(result.error);
      setSearchResults([]);
    }

    setSearching(false);
  };

  const addToCart = (product: ProductSearchResult) => {
    // Check if product is already in cart
    const existingItem = cart.find((item) => item.product_id === product.id);

    if (existingItem) {
      // Update quantity if already in cart
      setCart(
        cart.map((item) =>
          item.product_id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.unit_cost,
              }
            : item
        )
      );
    } else {
      // Add new item to cart
      const newItem: CartItem = {
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        product_barcode: product.barcode,
        wholesaler_id: product.wholesaler_id,
        wholesaler_name: product.wholesalers.business_name,
        unit_cost: product.wholesale_price,
        quantity: 1,
        subtotal: product.wholesale_price,
      };

      setCart([...cart, newItem]);
    }

    // Clear search results after adding
    setSearchResults([]);
    setSearchTerm("");
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart(
      cart.map((item) =>
        item.product_id === productId
          ? {
              ...item,
              quantity,
              subtotal: quantity * item.unit_cost,
            }
          : item
      )
    );
  };

  const removeItem = (productId: string) => {
    const newCart = cart.filter((item) => item.product_id !== productId);
    setCart(newCart);
  };

  const handleCreateOrder = async () => {
    if (!selectedWholesalerId || cart.length === 0) {
      setError("Please select a wholesaler and add items to your cart");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { createPurchaseOrder } = await import("@/app/actions/retailer/purchase-orders");

      const result = await createPurchaseOrder({
        wholesaler_id: selectedWholesalerId,
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
        })),
      });

      if (result.success) {
        // Clear cart and show success
        setCart([]);
        alert("Purchase order created successfully!");
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to create purchase order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Wholesaler Selector */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          Select Wholesaler
        </h3>
        {loadingWholesalers ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : wholesalers.length === 0 ? (
          <p className="text-center text-slate-500">No wholesalers available</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {wholesalers.map((wholesaler) => (
              <button
                key={wholesaler.id}
                onClick={() => handleWholesalerSelect(wholesaler.id)}
                className={`rounded-lg border p-4 text-left transition-colors hover:bg-slate-50 ${
                  selectedWholesalerId === wholesaler.id
                    ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20"
                    : "border-slate-200"
                }`}
              >
                <p className="font-medium text-slate-900">{wholesaler.business_name}</p>
                <p className="text-sm text-slate-500">{wholesaler.contact_email}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Catalog Section */}
      {selectedWholesaler && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              {selectedWholesaler.business_name} Catalog
            </h3>
            <p className="text-sm text-slate-500">
              Browse and add products to your cart
            </p>
          </div>
          <Input
            type="text"
            placeholder="Search by name, SKU, or barcode..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            disabled={searching}
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

          {searching && (
            <div className="mt-4 flex items-center justify-center">
              <Spinner />
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{product.name}</p>
                    <p className="text-sm text-slate-500">
                      SKU: {product.sku}
                      {product.barcode && ` • Barcode: ${product.barcode}`}
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-900">
                      ${product.wholesale_price.toFixed(2)} / unit
                    </p>
                    {product.suggested_retail_price && (
                      <p className="text-sm text-slate-500">
                        Suggested retail: ${product.suggested_retail_price.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => addToCart(product)}
                    className="mt-4 w-full"
                    disabled={cart.some((item) => item.product_id === product.id)}
                  >
                    {cart.some((item) => item.product_id === product.id)
                      ? "In Cart"
                      : "Add to Cart"}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {searchResults.length === 0 && searchTerm.length >= 2 && !searching && (
            <p className="mt-4 text-center text-sm text-slate-500">
              No products found matching your search
            </p>
          )}

          {searchResults.length === 0 && searchTerm.length < 2 && !searching && (
            <p className="mt-4 text-center text-sm text-slate-500">
              Enter at least 2 characters to search products
            </p>
          )}
        </div>
      )}

      {!selectedWholesaler && (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-500">
            Select a wholesaler above to browse their product catalog
          </p>
        </div>
      )}

      {/* Cart Section */}
      <PurchaseOrderCart
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCreateOrder={handleCreateOrder}
        loading={loading}
      />
    </div>
  );
}
