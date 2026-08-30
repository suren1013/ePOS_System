"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { extractInvoiceData, importInvoiceItems } from "@/app/actions/retailer/invoice-import";
import type { ExtractedInvoiceItem } from "@/app/actions/retailer/invoice-import";
import { FileUpload } from "./file-upload";
import { InvoicePreview } from "./invoice-preview";

export function InvoiceImportWorkspace() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedItems, setExtractedItems] = useState<ExtractedInvoiceItem[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setExtractedItems([]);
    setExtractionError(null);
    setImportError(null);
    setImportSuccess(null);
  };

  const handleExtract = async () => {
    if (!selectedFile) return;

    setIsExtracting(true);
    setExtractionError(null);

    try {
      const result = await extractInvoiceData(selectedFile);

      if (!result.success) {
        setExtractionError(result.error || "Failed to extract invoice data");
        return;
      }

      if (result.items && result.items.length > 0) {
        setExtractedItems(result.items);
      } else {
        setExtractionError("No items found in invoice");
      }
    } catch (error) {
      setExtractionError(error instanceof Error ? error.message : "Failed to extract invoice data");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleImport = async () => {
    if (extractedItems.length === 0) return;

    setIsImporting(true);
    setImportError(null);
    setImportSuccess(null);

    try {
      const result = await importInvoiceItems(extractedItems);

      if (!result.success) {
        setImportError(result.error || "Failed to import invoice items");
        return;
      }

      setImportSuccess(`Successfully imported ${result.importedCount} items`);
      setExtractedItems([]);
      setSelectedFile(null);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Failed to import invoice items");
    } finally {
      setIsImporting(false);
    }
  };

  const handleRemoveItem = (index: number) => {
    setExtractedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setSelectedFile(null);
    setExtractedItems([]);
    setExtractionError(null);
    setImportError(null);
    setImportSuccess(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Import Invoice</h2>
        <p className="text-sm text-slate-600">
          Upload an invoice document (PDF, JPG, or PNG) to extract product information and import it into your inventory.
        </p>
      </div>

      {importSuccess && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
          {importSuccess}
        </div>
      )}

      {extractionError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {extractionError}
        </div>
      )}

      {importError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {importError}
        </div>
      )}

      {!selectedFile ? (
        <FileUpload onFileSelect={handleFileSelect} isProcessing={isExtracting} />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-slate-900">{selectedFile.name}</p>
              <p className="text-xs text-slate-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={isExtracting || isImporting}
            >
              Change File
            </Button>
          </div>

          {!extractedItems.length && !extractionError && (
            <div className="flex justify-center">
              <Button
                type="button"
                onClick={handleExtract}
                disabled={isExtracting}
                loading={isExtracting}
              >
                {isExtracting ? "Extracting..." : "Extract Items"}
              </Button>
            </div>
          )}

          {extractedItems.length > 0 && (
            <>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Extracted Items ({extractedItems.length})
                  </h3>
                </div>
                <InvoicePreview
                  items={extractedItems}
                  onEditItem={() => {}}
                  onRemoveItem={handleRemoveItem}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleReset}
                  disabled={isImporting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleImport}
                  disabled={isImporting || extractedItems.length === 0}
                  loading={isImporting}
                >
                  {isImporting ? "Importing..." : "Import to Inventory"}
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> Products must already exist in the product catalog (added by wholesalers) before they can be imported. Items with unknown barcodes will be skipped.
        </p>
      </div>
    </div>
  );
}
