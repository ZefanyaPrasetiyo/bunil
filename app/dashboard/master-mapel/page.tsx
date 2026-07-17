"use client";

import { useState } from "react";
import { BookOpen, Search } from "lucide-react";
import {
  TableMasterMapel,
  type MasterMapelRow,
} from "@/components/application/table/table-masterMapel";
import { DialogTambahMapel } from "@/components/ui/dialog/dialogAddMapel";

const initialData: MasterMapelRow[] = [
  { id: "1", no: 1, nama: "Matematika" },
  { id: "2", no: 2, nama: "Bahasa Indonesia" },
  { id: "3", no: 3, nama: "Bahasa Inggris" },
  { id: "4", no: 4, nama: "IPA" },
];

export default function MasterMapel() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState(initialData);
  const filteredData = data.filter((row) =>
    row.nama.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex min-h-svh w-full flex-col gap-6 p-6 font-sans md:p-10">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <BookOpen className="size-6" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Master Mata Pelajaran
            </h1>
            <p className="text-sm text-muted-foreground">
              Kelola daftar mata pelajaran yang tersedia.
            </p>
          </div>
        </div>
        <DialogTambahMapel
          onSubmit={(values) =>
            setData((current) => [
              ...current,
              { id: crypto.randomUUID(), no: current.length + 1, ...values },
            ])
          }
        />
      </div>
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari mata pelajaran"
            className="w-full rounded-lg border border-input bg-background py-2.5 pr-3 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
          />
        </div>
      </div>
      <TableMasterMapel
        data={filteredData}
        onEdit={(id, values) =>
          setData((current) =>
            current.map((row) => (row.id === id ? { ...row, ...values } : row)),
          )
        }
        onDelete={(id) =>
          setData((current) =>
            current
              .filter((row) => row.id !== id)
              .map((row, index) => ({ ...row, no: index + 1 })),
          )
        }
      />
    </div>
  );
}
