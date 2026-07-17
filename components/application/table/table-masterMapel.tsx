"use client";
import { Table, TableCard } from "@/components/application/table/table";
import {
  DialogEditMapel,
  DialogHapusMapel,
  type MapelUpdate,
} from "@/components/ui/dialog/dialogEdit/dialogEditMapel";
export type MasterMapelRow = { id: string; no: number; nama: string };
const columns = [
  { id: "no", label: "No" },
  { id: "nama", label: "Pelajaran", isRowHeader: true },
  { id: "aksi", label: "Aksi" },
];
export function TableMasterMapel({
  data,
  onEdit,
  onDelete,
}: {
  data: MasterMapelRow[];
  onEdit?: (id: string, values: MapelUpdate) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
}) {
  return (
    <TableCard.Root>
      <TableCard.Header
        title="Master Mata Pelajaran"
        description={`${data.length} mata pelajaran`}
      />
      <Table aria-label="Tabel master mata pelajaran">
        <Table.Header columns={columns}>
          {(column) => (
            <Table.Head id={column.id} isRowHeader={column.isRowHeader}>
              {column.label}
            </Table.Head>
          )}
        </Table.Header>
        <Table.Body items={data}>
          {(row) => (
            <Table.Row id={row.id} columns={columns}>
              {(column) => (
                <Table.Cell>
                  {column.id === "no" ? (
                    row.no
                  ) : column.id === "nama" ? (
                    row.nama
                  ) : (
                    <div className="flex gap-2">
                      <DialogEditMapel
                        row={row}
                        onSubmit={(values) => onEdit?.(row.id, values)}
                      />
                      <DialogHapusMapel
                        nama={row.nama}
                        onConfirm={() => onDelete?.(row.id)}
                      />
                    </div>
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
