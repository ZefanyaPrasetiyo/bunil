"use client";

import * as XLSX from "xlsx-js-style";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImportExcel, type ExcelColumn } from "@/components/ui/importExcel";

const jurusanOptions = ["DKV", "RPL", "ANIMASI", "TKJ", "BC", "TE"] as const;
type SiswaImportField = "spmb" | "nama" | "jurusan";

export type SiswaImportValues = Record<SiswaImportField, string>;

const siswaColumns: ExcelColumn<SiswaImportField>[] = [
    { field: "spmb", label: "NO SPMB", aliases: ["SPMB", "NO_SPMB"], required: true },
    { field: "nama", label: "Nama", required: true },
    { field: "jurusan", label: "Jurusan", required: true },
];

interface ImportDataSiswaProps {
    existingSpmbs: string[];
    onImport: (values: SiswaImportValues[]) => void;
    onMessage: (message: string) => void;
}

export function ImportDataSiswa({ existingSpmbs, onImport, onMessage }: ImportDataSiswaProps) {
    function handleImport(rows: SiswaImportValues[]) {
        const usedSpmbs = new Set(existingSpmbs.map((spmb) => spmb.trim().toLowerCase()));
        const validRows: SiswaImportValues[] = [];
        const invalidRows: string[] = [];

        rows.forEach((row, index) => {
            const siswa = { ...row, jurusan: row.jurusan.toUpperCase() };
            const isIncomplete = Object.values(siswa).some((value) => !value.trim());
            const duplicateSpmb = usedSpmbs.has(siswa.spmb.toLowerCase());
            const invalidJurusan = !jurusanOptions.includes(siswa.jurusan as (typeof jurusanOptions)[number]);

            if (isIncomplete || duplicateSpmb || invalidJurusan) {
                invalidRows.push(String(index + 2));
                return;
            }

            usedSpmbs.add(siswa.spmb.toLowerCase());
            validRows.push(siswa);
        });

        if (validRows.length) onImport(validRows);
        if (invalidRows.length) onMessage(`Baris ${invalidRows.join(", ")} dilewati. Pastikan semua kolom terisi, NO SPMB unik, dan jurusan valid (${jurusanOptions.join(", ")}).`);
        else onMessage(`${validRows.length} data siswa berhasil ditambahkan ke staging.`);
    }

    function downloadTemplate() {
        const inputRowCount = 20;
        const worksheet = XLSX.utils.aoa_to_sheet([
            ["TEMPLATE IMPORT DATA SISWA"],
            ["Isi data mulai baris contoh atau baris kosong di bawahnya. Jurusan: DKV, RPL, ANIMASI, TKJ, BC, atau TE."],
            [],
            [],
            siswaColumns.map((column) => column.label),
            ["SPMB-0001", "Nama Siswa", "RPL"],
            ...Array.from({ length: inputRowCount - 1 }, () => ["", "", ""]),
        ]);
        worksheet["!cols"] = [{ wch: 18 }, { wch: 30 }, { wch: 14 }];
        worksheet["!merges"] = [XLSX.utils.decode_range("A1:C1"), XLSX.utils.decode_range("A2:C2")];
        worksheet["!rows"] = [{ hpt: 28 }, { hpt: 34 }, { hpt: 8 }, { hpt: 8 }];
        worksheet["!autofilter"] = { ref: `A5:C${5 + inputRowCount}` };

        const border = { top: { style: "thin", color: { rgb: "CBD5E1" } }, bottom: { style: "thin", color: { rgb: "CBD5E1" } }, left: { style: "thin", color: { rgb: "CBD5E1" } }, right: { style: "thin", color: { rgb: "CBD5E1" } } };
        const titleStyle = { fill: { fgColor: { rgb: "1E3A8A" } }, font: { bold: true, color: { rgb: "FFFFFF" }, sz: 16 }, alignment: { horizontal: "center", vertical: "center" } };
        const descriptionStyle = { fill: { fgColor: { rgb: "DBEAFE" } }, font: { color: { rgb: "1E3A8A" }, italic: true }, alignment: { horizontal: "left", vertical: "center", wrapText: true } };
        const headerStyle = { fill: { fgColor: { rgb: "2563EB" } }, font: { bold: true, color: { rgb: "FFFFFF" } }, alignment: { horizontal: "center", vertical: "center" }, border };
        const exampleStyle = { fill: { fgColor: { rgb: "DCFCE7" } }, font: { color: { rgb: "166534" } }, border };
        const inputStyle = { fill: { fgColor: { rgb: "F8FAFC" } }, border };

        ["A1", "A2"].forEach((cell, index) => {
            if (worksheet[cell]) worksheet[cell].s = index === 0 ? titleStyle : descriptionStyle;
        });
        ["A", "B", "C"].forEach((column) => {
            if (worksheet[`${column}5`]) worksheet[`${column}5`].s = headerStyle;
            for (let row = 6; row <= 5 + inputRowCount; row += 1) {
                if (worksheet[`${column}${row}`]) worksheet[`${column}${row}`].s = row === 6 ? exampleStyle : inputStyle;
            }
        });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Siswa");
        XLSX.writeFile(workbook, "template-data-siswa.xlsx");
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            <ImportExcel columns={siswaColumns} onImport={handleImport} onError={onMessage} label="Import Excel" />
            <Button type="button" variant="ghost" onClick={downloadTemplate} className="inline-flex items-center gap-2">
                <Download className="size-4" />Unduh Template
            </Button>
        </div>
    );
}
