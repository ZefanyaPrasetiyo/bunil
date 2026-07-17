"use client";

import { useEffect, useMemo, useState } from "react";
import { KeyRound, Search } from "lucide-react";
import { TableManajemenAkun, type ManajemenAkunRow } from "@/components/application/table/table-manajemenAkun";
import { DialogTambahSiswa, type SiswaFormValues } from "@/components/ui/dialog/dialogAddSiswa";
import type { SiswaUpdate } from "@/components/ui/dialog/dialogEdit/dialogEditSiswa";

type UserApiItem = {
    id: string;
    no_spmb?: string | null;
    nama?: string | null;
    username?: string | null;
    jurusan?: string | null;
    password?: string | null;
};

type UserApiResponse = {
    data?: UserApiItem[];
    message?: string;
    status?: number;
};

function mapUserToRow(user: UserApiItem, index: number): ManajemenAkunRow {
    return {
        id: user.id,
        no: index + 1,
        spmb: user.no_spmb || "-",
        nama: user.nama || user.username || "Tanpa nama",
        jurusan: user.jurusan || "-",
        password: user.password ? "●●●●" : "-",
    };
}

function buildUsername(values: Pick<SiswaFormValues, "spmb" | "nama">) {
    const base = `${values.spmb || values.nama}`.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
    return base || `siswa${Math.floor(Math.random() * 1000)}`;
}

export default function Dashboard() {
    const [query, setQuery] = useState("");
    const [data, setData] = useState<ManajemenAkunRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        async function loadUsers() {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch("/api/user?page=1&limit=100", { credentials: "include" });
                const payload = (await response.json()) as UserApiResponse;

                if (!response.ok) {
                    throw new Error(payload.message || "Gagal memuat akun siswa");
                }

                if (active) {
                    setData((payload.data ?? []).map((user, index) => mapUserToRow(user, index)));
                }
            } catch (err) {
                if (active) {
                    setError(err instanceof Error ? err.message : "Gagal memuat akun siswa");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadUsers();
        return () => {
            active = false;
        };
    }, []);

    const filteredData = useMemo(
        () => data.filter((row) => [row.nama, row.jurusan, row.spmb].join(" ").toLowerCase().includes(query.toLowerCase())),
        [data, query],
    );

    async function handleCreate(values: SiswaFormValues) {
        try {
            const response = await fetch("/api/user", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    no_spmb: values.spmb,
                    nama: values.nama,
                    username: buildUsername(values),
                    password: values.password || undefined,
                    jurusan: values.jurusan,
                    role: "USER",
                }),
            });
            const payload = (await response.json()) as { data?: UserApiItem; message?: string };

            if (!response.ok) {
                throw new Error(payload.message || "Gagal membuat akun siswa");
            }

            if (payload.data) {
                setData((current) => [...current, mapUserToRow(payload.data!, current.length)]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal membuat akun siswa");
        }
    }

    async function handleEdit(id: string, values: SiswaUpdate) {
        try {
            const response = await fetch("/api/user", {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id,
                    no_spmb: values.spmb,
                    nama: values.nama,
                    username: buildUsername(values),
                    password: values.password || undefined,
                    jurusan: values.jurusan,
                    role: "USER",
                }),
            });
            const payload = (await response.json()) as { data?: UserApiItem; message?: string };

            if (!response.ok) {
                throw new Error(payload.message || "Gagal memperbarui akun siswa");
            }

            if (payload.data) {
                setData((current) => current.map((row) => (row.id === id ? mapUserToRow(payload.data!, current.findIndex((item) => item.id === id)) : row)));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal memperbarui akun siswa");
        }
    }

    async function handleDelete(id: string) {
        try {
            const response = await fetch("/api/user", {
                method: "DELETE",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            const payload = (await response.json()) as { message?: string };

            if (!response.ok) {
                throw new Error(payload.message || "Gagal menghapus akun siswa");
            }

            setData((current) => current.filter((row) => row.id !== id).map((row, index) => ({ ...row, no: index + 1 })));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal menghapus akun siswa");
        }
    }

    return (
        <div className="flex min-h-svh w-full flex-col gap-6 p-6 font-sans md:p-10">
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                        <KeyRound className="size-6" />
                    </div>
                    <div>
                        <h1 className="font-heading text-2xl font-bold text-foreground">Manajemen Akun</h1>
                        <p className="text-sm text-muted-foreground">Lihat akun yang digunakan siswa untuk mengakses nilai</p>
                    </div>
                </div>

                <DialogTambahSiswa onSubmit={handleCreate} />
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
                <div className="relative w-full sm:max-w-sm">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Cari berdasarkan nama, jurusan, atau NO SPMB"
                        className="w-full rounded-lg border border-input bg-background py-2.5 pr-3 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                    />
                </div>
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            {loading ? (
                <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">Memuat data akun...</div>
            ) : (
                <TableManajemenAkun data={filteredData} onEdit={handleEdit} onDelete={handleDelete} />
            )}
        </div>
    );
}
