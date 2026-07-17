"use client";
import { useState } from "react";
import { Table, TableCard } from "@/components/application/table/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
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
  const rowsPerPage = 10;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const currentPage = Math.min(page, Math.max(totalPages, 1));
  const paginatedData = data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

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
        <Table.Body items={paginatedData}>
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
