"use client";

import { useState } from "react";

import { Table, TableCard } from "@/components/application/table/table";
import { DialogEditSiswa, DialogHapusSiswa, type SiswaUpdate } from "@/components/ui/dialog/dialogEdit/dialogEditSiswa";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export type ManajemenAkunRow = {
    id: string;
    no: number;
    spmb: string;
    nama: string;
    jurusan: string;
};

const columns = [
    { id: "no", label: "No" },
    { id: "spmb", label: "NO SPMB" },
    { id: "nama", label: "Nama", isRowHeader: true },
    { id: "jurusan", label: "Jurusan" },
    { id: "aksi", label: "Aksi" },
];

function getCellValue(row: ManajemenAkunRow, columnId: string) {
    switch (columnId) {
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
        default:
            return null;
    }
}

interface TableManajemenAkunProps {
    data: ManajemenAkunRow[];
    onEdit?: (id: string, values: SiswaUpdate) => void | Promise<void>;
    onDelete?: (id: string) => void | Promise<void>;
}

export function TableManajemenAkun({ data, onEdit, onDelete }: TableManajemenAkunProps) {
    const rowsPerPage = 10;
    const [page, setPage] = useState(1);
    const totalPages = Math.ceil(data.length / rowsPerPage);
    const currentPage = Math.min(page, Math.max(totalPages, 1));
    const paginatedData = data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    return (
        <TableCard.Root>
            <TableCard.Header title="Manajemen Akun" description={`${data.length} akun siswa`} />

            <Table aria-label="Tabel manajemen akun siswa">
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
                                <Table.Cell>
                                    {column.id === "aksi" ? (
                                        <div className="flex items-center gap-2">
                                            <DialogEditSiswa row={row} onSubmit={(values) => onEdit?.(row.id, values)} />
                                            <DialogHapusSiswa nama={row.nama} onConfirm={() => onDelete?.(row.id)} />
                                        </div>
                                    ) : getCellValue(row, column.id)}
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
