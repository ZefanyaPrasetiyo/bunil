"use client";

import { useState } from "react";

import { Table, TableCard } from "@/components/application/table/table";
import { DialogEditNilaiSiswa, DialogHapusNilaiSiswa, type NilaiSiswaUpdate } from "@/components/ui/dialog/dialogEdit/dialogEditNilai";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export type Mapel = { id: string; nama: string };

export type NilaiSiswaRow = {
    id: string;
    no: number;
    spmb: string;
    nama: string;
    jurusan: string;
    nilai: Record<string, number | null | undefined>;
};

type Column = { id: string; label: string; isRowHeader?: boolean };

const MAPEL_PREFIX = "mapel:";

function buildColumns(mapelList: Mapel[]): Column[] {
    return [
        { id: "no", label: "No" },
        { id: "spmb", label: "SPMB" },
        { id: "nama", label: "Nama", isRowHeader: true },
        { id: "jurusan", label: "Jurusan" },
        ...mapelList.map((mapel) => ({ id: `${MAPEL_PREFIX}${mapel.id}`, label: mapel.nama })),
        { id: "aksi", label: "Aksi" },
    ];
}

// Outline tetap tipis, tapi teks digelapkan khusus di light mode
// (secondary & accent terlalu pastel buat dibaca di atas card putih).
// Primary sudah gelap (navy) & destructive sudah cukup kontras, jadi tidak perlu diubah.
function nilaiToneClass(value: number) {
    if (value >= 85)
        return "border-secondary text-[color-mix(in_oklab,var(--secondary),black_35%)] dark:text-secondary";
    if (value >= 75)
        return "border-primary text-primary";
    if (value >= 60)
        return "border-accent text-[color-mix(in_oklab,var(--accent),black_45%)] dark:text-accent";
    return "border-destructive text-[color-mix(in_oklab,var(--destructive),black_15%)] dark:text-destructive";
}

function getCellValue(row: NilaiSiswaRow, column: Column) {
    switch (column.id) {
        case "no":
            return row.no;
        case "spmb":
            return row.spmb;
        case "nama":
            return row.nama;
        case "jurusan":
            return (
                <span className="rounded-md border border-border px-2 py-1 font-sans text-xs font-medium text-muted-foreground">
                    {row.jurusan}
                </span>
            );
        default: {
            if (column.id.startsWith(MAPEL_PREFIX)) {
                const mapelId = column.id.slice(MAPEL_PREFIX.length);
                const nilai = row.nilai[mapelId];
                if (nilai == null) {
                    return <span className="text-muted-foreground">-</span>;
                }
                return (
                    <span
                        className={`inline-flex min-w-10 justify-center rounded-md border bg-transparent px-2 py-1 font-sans text-xs font-semibold ${nilaiToneClass(
                            nilai
                        )}`}
                    >
                        {nilai}
                    </span>
                );
            }
            return null;
        }
    }
}

interface TableNilaiSiswaProps {
    mapelList: Mapel[];
    data: NilaiSiswaRow[];
    onEdit?: (id: string, values: NilaiSiswaUpdate) => void | Promise<void>;
    onDelete?: (id: string) => void | Promise<void>;
}

export function TableNilaiSiswa({ mapelList, data, onEdit, onDelete }: TableNilaiSiswaProps) {
    const rowsPerPage = 10;
    const [page, setPage] = useState(1);
    const columns = buildColumns(mapelList);
    const totalPages = Math.ceil(data.length / rowsPerPage);
    const currentPage = Math.min(page, Math.max(totalPages, 1));
    const paginatedData = data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    return (
        <TableCard.Root>
            <TableCard.Header title="Nilai Siswa" description={`${data.length} siswa · ${mapelList.length} mata pelajaran`} />

            <Table aria-label="Tabel nilai siswa">
                <Table.Header columns={columns}>
                    {(column) => (
                        <Table.Head id={column.id} isRowHeader={column.isRowHeader} className={column.id === "aksi" ? "w-24" : undefined}>
                            {column.label}
                        </Table.Head>
                    )}
                </Table.Header>

                <Table.Body items={paginatedData}>
                    {(row) => (
                        <Table.Row id={row.id} columns={columns}>
                            {(column) => (
                                <Table.Cell className={column.id.startsWith(MAPEL_PREFIX) ? "text-center font-sans font-medium" : undefined}>
                                    {column.id === "aksi" ? (
                                        <div className="flex items-center gap-2">
                                            <DialogEditNilaiSiswa row={row} mapelList={mapelList} onSubmit={(values) => onEdit?.(row.id, values)} />
                                            <DialogHapusNilaiSiswa nama={row.nama} onConfirm={() => onDelete?.(row.id)} />
                                        </div>
                                    ) : (
                                        getCellValue(row, column)
                                    )}
                                </Table.Cell>
                            )}
                        </Table.Row>
                    )}
                </Table.Body>
            </Table>
            {totalPages > 1 && (
                <Pagination className="border-t border-border px-4 py-3 md:px-6">
                    <PaginationContent>
                        <PaginationItem><PaginationPrevious href="#" onClick={(event) => { event.preventDefault(); setPage((current) => Math.max(1, current - 1)); }} aria-disabled={currentPage === 1} className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined} /></PaginationItem>
                        {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                            <PaginationItem key={pageNumber}><PaginationLink href="#" isActive={pageNumber === currentPage} onClick={(event) => { event.preventDefault(); setPage(pageNumber); }}>{pageNumber}</PaginationLink></PaginationItem>
                        ))}
                        <PaginationItem><PaginationNext href="#" onClick={(event) => { event.preventDefault(); setPage((current) => Math.min(totalPages, current + 1)); }} aria-disabled={currentPage === totalPages} className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined} /></PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </TableCard.Root>
    );
}
