"use client";

import { Table, TableCard } from "@/components/application/table/table";
import { DialogEditSiswa, DialogHapusSiswa, type SiswaUpdate } from "@/components/ui/dialog/dialogEdit/dialogEditSiswa";

export type ManajemenAkunRow = {
    id: string;
    no: number;
    spmb: string;
    nama: string;
    jurusan: string;
    password: string;
};

const columns = [
    { id: "no", label: "No" },
    { id: "spmb", label: "NO SPMB" },
    { id: "nama", label: "Nama", isRowHeader: true },
    { id: "jurusan", label: "Jurusan" },
    { id: "password", label: "Password" },
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
        case "password":
            return (
                <code className="rounded-md border border-primary/25 bg-primary/10 px-2 py-1 font-sans text-xs font-semibold text-primary dark:bg-primary/15">
                    {row.password}
                </code>
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

                <Table.Body items={data}>
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
        </TableCard.Root>
    );
}
