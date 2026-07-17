"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import {
  TableMasterMapel,
  type MasterMapelRow,
} from "@/components/application/table/table-masterMapel";
import { DialogTambahMapel } from "@/components/ui/dialog/dialogAddMapel";

type MataPelajaran = { id: string; nama: string };

async function getErrorMessage(response: Response) {
  const body = (await response.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? "Terjadi kesalahan saat memproses data mata pelajaran.";
}

export default function MasterMapel() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<MasterMapelRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMataPelajaran = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/mata-pelajaran", { cache: "no-store" });
      if (!response.ok) throw new Error(await getErrorMessage(response));

      const mataPelajaran = (await response.json()) as MataPelajaran[];
      setData(mataPelajaran.map((item, index) => ({ ...item, no: index + 1 })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat mata pelajaran.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMataPelajaran();
  }, [loadMataPelajaran]);

  async function createMataPelajaran(values: { nama: string }) {
    setError("");
    const response = await fetch("/api/mata-pelajaran", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!response.ok) {
      const message = await getErrorMessage(response);
      setError(message);
      throw new Error(message);
    }

    const created = (await response.json()) as MataPelajaran;
    setData((current) => [...current, { ...created, no: current.length + 1 }]);
  }

  async function updateMataPelajaran(id: string, values: { nama: string }) {
    setError("");
    const response = await fetch("/api/mata-pelajaran", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...values }),
    });
    if (!response.ok) {
      const message = await getErrorMessage(response);
      setError(message);
      throw new Error(message);
    }

    const updated = (await response.json()) as MataPelajaran;
    setData((current) => current.map((row) => (row.id === id ? { ...row, ...updated } : row)));
  }

  async function deleteMataPelajaran(id: string) {
    setError("");
    const response = await fetch(`/api/mata-pelajaran?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const message = await getErrorMessage(response);
      setError(message);
      throw new Error(message);
    }

    setData((current) => current.filter((row) => row.id !== id).map((row, index) => ({ ...row, no: index + 1 })));
  }

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
        <DialogTambahMapel onSubmit={createMataPelajaran} />
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
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Memuat mata pelajaran...</p>
      ) : (
      <TableMasterMapel
        data={filteredData}
        onEdit={updateMataPelajaran}
        onDelete={deleteMataPelajaran}
      />
      )}
    </div>
  );
}
