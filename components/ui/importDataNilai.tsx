"use client";

import * as XLSX from "xlsx-js-style";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImportExcel, type ExcelColumn } from "@/components/ui/importExcel";

export type MapelImportOption = { id: string; nama: string };
export type NilaiImportValues = {
    spmb: string;
    nama: string;
    jurusan: string;
    nilai: Record<string, string>;
};

interface ImportDataNilaiProps {
    mapelList: MapelImportOption[];
    siswaList: { spmb: string; nama: string; jurusan: string }[];
    existingSpmbs: string[];
    onImport: (values: NilaiImportValues[]) => void;
    onMessage: (message: string) => void;
}

function createColumns(mapelList: MapelImportOption[]): ExcelColumn<string>[] {
    return [
        { field: "spmb", label: "NO SPMB", aliases: ["SPMB", "NO_SPMB"], required: true },
        { field: "nama", label: "Nama" },
        { field: "jurusan", label: "Jurusan" },
        ...mapelList.map((mapel) => ({ field: mapel.id, label: mapel.nama, aliases: [mapel.id] })),
    ];
}

export function ImportDataNilai({ mapelList, siswaList, existingSpmbs, onImport, onMessage }: ImportDataNilaiProps) {
    const columns = createColumns(mapelList);

    function handleImport(rows: Record<string, string>[]) {
        const siswaBySpmb = new Map(siswaList.map((siswa) => [siswa.spmb.trim().toLowerCase(), siswa]));
        const usedSpmbs = new Set(existingSpmbs.map((spmb) => spmb.trim().toLowerCase()));
        const validRows: NilaiImportValues[] = [];
        const invalidRows: string[] = [];

        rows.forEach((row, index) => {
            const spmb = row.spmb.trim();
            const siswa = siswaBySpmb.get(spmb.toLowerCase());
            const nilai = Object.fromEntries(mapelList.map((mapel) => [mapel.id, row[mapel.id]?.trim() ?? ""]));
            const nilaiTidakValid = Object.values(nilai).some((value) => {
                if (!value) return false;
                const angka = Number(value);
                return !Number.isFinite(angka) || angka < 0 || angka > 100;
            });

            if (!spmb || !siswa || usedSpmbs.has(spmb.toLowerCase()) || nilaiTidakValid) {
                invalidRows.push(String(index + 2));
                return;
            }

            usedSpmbs.add(spmb.toLowerCase());
            validRows.push({
                spmb: siswa.spmb,
                nama: siswa.nama,
                jurusan: row.jurusan.trim() || siswa.jurusan,
                nilai,
            });
        });

        if (validRows.length) onImport(validRows);
        if (invalidRows.length) onMessage(`Baris ${invalidRows.join(", ")} dilewati. Pastikan NO SPMB terdaftar dan unik pada staging, serta nilai di antara 0 sampai 100.`);
        else onMessage(`${validRows.length} data nilai berhasil ditambahkan ke staging.`);
    }

    function downloadTemplate() {
        const inputRowCount = 20;
        const headers = columns.map((column) => column.label);
        const example = ["SPMB-0001", "Nama Siswa", "RPL", ...mapelList.map(() => "80")];
        const worksheet = XLSX.utils.aoa_to_sheet([
            ["TEMPLATE IMPORT NILAI SISWA"],
            ["Isi NO SPMB siswa yang telah terdaftar. Kolom mata pelajaran mengikuti data master saat template diunduh; nilai dapat dikosongkan atau diisi 0 sampai 100."],
            [],
            [],
            headers,
            example,
            ...Array.from({ length: inputRowCount - 1 }, () => headers.map(() => "")),
        ]);

        const lastColumn = XLSX.utils.encode_col(Math.max(headers.length - 1, 0));
        worksheet["!cols"] = headers.map((header, index) => ({ wch: index === 0 ? 18 : index === 1 ? 30 : index === 2 ? 14 : Math.max(14, header.length + 3) }));
        worksheet["!merges"] = [XLSX.utils.decode_range(`A1:${lastColumn}1`), XLSX.utils.decode_range(`A2:${lastColumn}2`)];
        worksheet["!rows"] = [{ hpt: 28 }, { hpt: 34 }, { hpt: 8 }, { hpt: 8 }];
        worksheet["!autofilter"] = { ref: `A5:${lastColumn}${5 + inputRowCount}` };

        const border = { top: { style: "thin", color: { rgb: "CBD5E1" } }, bottom: { style: "thin", color: { rgb: "CBD5E1" } }, left: { style: "thin", color: { rgb: "CBD5E1" } }, right: { style: "thin", color: { rgb: "CBD5E1" } } };
        const titleStyle = { fill: { fgColor: { rgb: "1E3A8A" } }, font: { bold: true, color: { rgb: "FFFFFF" }, sz: 16 }, alignment: { horizontal: "center", vertical: "center" } };
        const descriptionStyle = { fill: { fgColor: { rgb: "DBEAFE" } }, font: { color: { rgb: "1E3A8A" }, italic: true }, alignment: { horizontal: "left", vertical: "center", wrapText: true } };
        const headerStyle = { fill: { fgColor: { rgb: "2563EB" } }, font: { bold: true, color: { rgb: "FFFFFF" } }, alignment: { horizontal: "center", vertical: "center" }, border };
        const exampleStyle = { fill: { fgColor: { rgb: "DCFCE7" } }, font: { color: { rgb: "166534" } }, border };
        const inputStyle = { fill: { fgColor: { rgb: "F8FAFC" } }, border };

        if (worksheet.A1) worksheet.A1.s = titleStyle;
        if (worksheet.A2) worksheet.A2.s = descriptionStyle;
        for (let column = 0; column < headers.length; column += 1) {
            const letter = XLSX.utils.encode_col(column);
            if (worksheet[`${letter}5`]) worksheet[`${letter}5`].s = headerStyle;
            for (let row = 6; row <= 5 + inputRowCount; row += 1) {
                if (worksheet[`${letter}${row}`]) worksheet[`${letter}${row}`].s = row === 6 ? exampleStyle : inputStyle;
            }
        }

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Nilai Siswa");
        XLSX.writeFile(workbook, "template-nilai-siswa.xlsx");
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            <ImportExcel columns={columns} onImport={handleImport} onError={onMessage} label="Import Excel" />
            <Button type="button" variant="ghost" onClick={downloadTemplate} className="inline-flex items-center gap-2">
                <Download className="size-4" />Unduh Template
            </Button>
        </div>
    );
}
