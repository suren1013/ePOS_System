"use server";

import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  findProductByBarcode,
  findRetailerInventory,
  insertInventoryRow,
  updateInventoryRow,
} from "@/lib/data/inventory";
import type { RetailerInventoryInsert } from "@/types/inventory";

// Placeholder for Gemini API key - user will add it manually
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export interface ExtractedInvoiceItem {
  productName: string;
  sku: string;
  barcode: string;
  quantity: number;
  purchasePrice: number;
}

export interface InvoiceExtractionResult {
  success: boolean;
  items?: ExtractedInvoiceItem[];
  error?: string;
}

export async function extractInvoiceData(file: File): Promise<InvoiceExtractionResult> {
  try {
    // Check if API key is set
    if (!GEMINI_API_KEY) {
      return {
        success: false,
        error: "Gemini API key not configured. Please set GEMINI_API_KEY environment variable.",
      };
    }

    // Log file details
    console.log("=== INVOICE EXTRACTION DEBUG ===");
    console.log("Filename:", file.name);
    console.log("File type:", file.type);
    console.log("File size:", file.size, "bytes");

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type;

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    console.log("Gemini model: gemini-2.5-flash-lite");

    // Prepare the prompt
    const prompt = `
Extract invoice items.

Return ONLY valid JSON.

Format:
{
  "items": [
    {
      "productName": "string",
      "sku": "string",
      "barcode": "string",
      "quantity": 0,
      "purchasePrice": 0
    }
  ]
}

Do not include markdown.
Do not include explanations.
Do not include comments.
Do not wrap the response in \`\`\`json.
Return JSON only.
`;

    // Call Gemini API
    const imagePart = {
      inlineData: {
        data: base64,
        mimeType,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const responseText = response.text();

    // Log raw Gemini response
    console.log("RAW GEMINI RESPONSE:");
    console.log(responseText);

    // Clean the response by removing markdown code blocks
    const cleaned = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    console.log("CLEANED RESPONSE:");
    console.log(cleaned);

    // Parse the response
    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return {
        success: false,
        error: "AI returned an invalid invoice format",
      };
    }

    console.log("PARSED JSON:");
    console.log(JSON.stringify(parsed, null, 2));

    // Validate the response structure
    if (!parsed || typeof parsed !== "object") {
      console.error("Parsed response is not an object");
      return {
        success: false,
        error: "AI returned an invalid invoice format",
      };
    }

    if (!parsed.items || !Array.isArray(parsed.items)) {
      console.error("Parsed response does not contain items array");
      return {
        success: false,
        error: "AI returned an invalid invoice format",
      };
    }

    // Validate each item
    const validItems = parsed.items.filter((item: any) => {
      const hasProductName = item.productName && typeof item.productName === "string";
      const hasSku = item.sku && typeof item.sku === "string";
      const hasBarcode = item.barcode && typeof item.barcode === "string";
      const hasQuantity = typeof item.quantity === "number" && !isNaN(item.quantity);
      const hasPurchasePrice = typeof item.purchasePrice === "number" && !isNaN(item.purchasePrice);

      if (!hasProductName || !hasSku || !hasBarcode || !hasQuantity || !hasPurchasePrice) {
        console.warn("Invalid item:", item);
        return false;
      }

      return true;
    });

    console.log("VALID ITEMS COUNT:", validItems.length);

    if (validItems.length === 0) {
      return {
        success: false,
        error: "No valid product items found in invoice",
      };
    }

    console.log("=== EXTRACTION SUCCESS ===");

    return {
      success: true,
      items: validItems,
    };
  } catch (error) {
    console.error("Invoice extraction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to extract invoice data",
    };
  }
}

export interface ImportInvoiceResult {
  success: boolean;
  error?: string;
  importedCount?: number;
}

export async function importInvoiceItems(
  items: ExtractedInvoiceItem[]
): Promise<ImportInvoiceResult> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    let importedCount = 0;
    const skippedItems: string[] = [];

    for (const item of items) {
      // First, check if product exists in products table by barcode
      const product = await findProductByBarcode(item.barcode);

      if (!product) {
        // Product doesn't exist in products table - skip it
        console.log(`Product not found in products table: ${item.productName} (${item.barcode})`);
        skippedItems.push(item.productName);
        continue;
      }

      // Check if retailer already has this product in inventory
      // @ts-ignore - Type inference issue with Supabase
      const existingInventory = await findRetailerInventory(user.id, product.id);

      if (existingInventory) {
        // Update existing inventory - add quantity
        // @ts-ignore - Type inference issue with Supabase
        const { error: updateError } = await updateInventoryRow(
          existingInventory.id,
          user.id,
          {
            stock_quantity: existingInventory.stock_quantity + item.quantity,
          }
        );

        if (updateError) {
          console.error("Failed to update inventory:", updateError);
          continue;
        }
      } else {
        // Insert new inventory entry
        // @ts-ignore - Type inference issue with Supabase
        const inventoryData: RetailerInventoryInsert = {
          // @ts-ignore - Type inference issue with Supabase
          retailer_id: user.id,
          // @ts-ignore - Type inference issue with Supabase
          product_id: product.id,
          stock_quantity: item.quantity,
          retail_price: item.purchasePrice * 1.2, // Add 20% margin
        };
        
        const { error: insertError } = await insertInventoryRow(inventoryData);

        if (insertError) {
          console.error("Failed to insert inventory:", insertError);
          continue;
        }
      }

      importedCount++;
    }

    if (importedCount === 0) {
      return {
        success: false,
        error: `No items imported. ${skippedItems.length} products were not found in the product catalog. Please ensure products exist before importing invoices.`,
      };
    }

    if (skippedItems.length > 0) {
      console.log(`Skipped ${skippedItems.length} items:`, skippedItems);
    }

    return {
      success: true,
      importedCount,
    };
  } catch (error) {
    console.error("Invoice import error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to import invoice items",
    };
  }
}
