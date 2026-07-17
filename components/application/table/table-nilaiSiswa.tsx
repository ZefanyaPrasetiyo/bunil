"use client";

import { Table, TableCard } from "@/components/application/table/table";
import { DialogEditNilaiSiswa, DialogHapusNilaiSiswa, type NilaiSiswaUpdate } from "@/components/ui/dialog/dialogEdit/dialogEditNilai";

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
    const columns = buildColumns(mapelList);

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

                <Table.Body items={data}>
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
        </TableCard.Root>
    );
}
