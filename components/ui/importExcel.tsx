"use client";

import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ExcelColumn<Field extends string> = {
    field: Field;
    label: string;
    aliases?: string[];
    required?: boolean;
};

type ImportExcelProps<Field extends string> = {
    columns: ExcelColumn<Field>[];
    onImport: (rows: Record<Field, string>[]) => void;
    onError?: (message: string) => void;
    label?: string;
};

function normalizeHeader(value: unknown) {
    return String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function ImportExcel<Field extends string>({ columns, onImport, onError, label = "Import Excel" }: ImportExcelProps<Field>) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isImporting, setIsImporting] = useState(false);

    async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        try {
            const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
            const firstSheetName = workbook.SheetNames[0];
            if (!firstSheetName) throw new Error("File Excel tidak memiliki sheet.");

            const rows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[firstSheetName], { header: 1, defval: "", raw: false });
            const headerRowIndex = rows.findIndex((row) => {
                const headers = row.map(normalizeHeader);
                return columns.filter((column) => column.required).every((column) => {
                    const acceptedHeaders = [column.label, column.field, ...(column.aliases ?? [])].map(normalizeHeader);
                    return headers.some((header) => acceptedHeaders.includes(header));
                });
            });
            if (headerRowIndex < 0) throw new Error("Header kolom Excel tidak ditemukan.");

            const headers = rows[headerRowIndex].map(normalizeHeader);
            const columnIndexes = columns.map((column) => {
                const acceptedHeaders = [column.label, column.field, ...(column.aliases ?? [])].map(normalizeHeader);
                return headers.findIndex((header) => acceptedHeaders.includes(header));
            });
            const missingColumns = columns.filter((column, index) => column.required && columnIndexes[index] < 0).map((column) => column.label);
            if (missingColumns.length) throw new Error(`Kolom wajib tidak ditemukan: ${missingColumns.join(", ")}.`);

            const importedRows = rows.slice(headerRowIndex + 1)
                .filter((row) => row.some((cell) => String(cell).trim() !== ""))
                .map((row) => Object.fromEntries(
                    columns.map((column, index) => [column.field, columnIndexes[index] < 0 ? "" : String(row[columnIndexes[index]] ?? "").trim()]),
                )) as Record<Field, string>[];

            if (!importedRows.length) throw new Error("Tidak ada baris data pada file Excel.");
            onImport(importedRows);
        } catch (error) {
            onError?.(error instanceof Error ? error.message : "Format Excel tidak valid.");
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }

    return (
        <>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isImporting} className="inline-flex items-center gap-2">
                <Upload className="size-4" />{isImporting ? "Memproses Excel..." : label}
            </Button>
        </>
    );
}
