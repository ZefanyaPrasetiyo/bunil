"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { TableMasterMapel, type MasterMapelRow } from "@/components/application/table/table-masterMapel";
import { DialogTambahMapel, type MapelFormValues } from "@/components/ui/dialog/dialogAddMapel";
import type { MapelUpdate } from "@/components/ui/dialog/dialogEdit/dialogEditMapel";

type MataPelajaranApiItem = {
  id: string;
  nama: string;
};

type MataPelajaranApiResponse = {
  data?: MataPelajaranApiItem[];
  message?: string;
  status?: number;
};

function mapMapelToRow(item: MataPelajaranApiItem, index: number): MasterMapelRow {
  return { id: item.id, no: index + 1, nama: item.nama };
}

export default function MasterMapel() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<MasterMapelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/mata-pelajaran?page=1&limit=100", { credentials: "include" });
        const payload = (await response.json()) as MataPelajaranApiResponse;

        if (!response.ok) {
          throw new Error(payload.message || "Gagal memuat mata pelajaran");
        }

        if (active) {
          setData((payload.data ?? []).map((item, index) => mapMapelToRow(item, index)));
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Gagal memuat mata pelajaran");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, []);

  const filteredData = useMemo(
    () => data.filter((row) => row.nama.toLowerCase().includes(query.toLowerCase())),
    [data, query],
  );

  async function handleCreate(values: MapelFormValues) {
    try {
      const response = await fetch("/api/mata-pelajaran", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: values.nama }),
      });
      const payload = (await response.json()) as { data?: MataPelajaranApiItem; message?: string };

      if (!response.ok) {
        throw new Error(payload.message || "Gagal membuat mata pelajaran");
      }

      if (payload.data) {
        setData((current) => [...current, mapMapelToRow(payload.data!, current.length)]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat mata pelajaran");
    }
  }

  async function handleEdit(id: string, values: MapelUpdate) {
    try {
      const response = await fetch("/api/mata-pelajaran", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, nama: values.nama }),
      });
      const payload = (await response.json()) as { data?: MataPelajaranApiItem; message?: string };

      if (!response.ok) {
        throw new Error(payload.message || "Gagal memperbarui mata pelajaran");
      }

      if (payload.data) {
        setData((current) => current.map((row) => (row.id === id ? mapMapelToRow(payload.data!, current.findIndex((item) => item.id === id)) : row)));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui mata pelajaran");
    }
  }

  async function handleDelete(id: string) {
    try {
      const response = await fetch("/api/mata-pelajaran", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message || "Gagal menghapus mata pelajaran");
      }

      setData((current) => current.filter((row) => row.id !== id).map((row, index) => ({ ...row, no: index + 1 })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus mata pelajaran");
    }
  }

  return (
    <div className="flex min-h-svh w-full flex-col gap-6 p-6 font-sans md:p-10">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <BookOpen className="size-6" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Master Mata Pelajaran</h1>
            <p className="text-sm text-muted-foreground">Kelola daftar mata pelajaran yang tersedia.</p>
          </div>
        </div>
        <DialogTambahMapel onSubmit={handleCreate} />
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

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">Memuat data mata pelajaran...</div>
      ) : (
        <TableMasterMapel data={filteredData} onEdit={handleEdit} onDelete={handleDelete} />
      )}
    </div>
  );
}
