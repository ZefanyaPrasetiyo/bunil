"use client";

import { useCallback, useEffect, useState } from "react";
import { KeyRound, Search } from "lucide-react";
import { TableManajemenAkun, type ManajemenAkunRow } from "@/components/application/table/table-manajemenAkun";
import { DialogTambahSiswa } from "@/components/ui/dialog/dialogAddSiswa";
// import type { SiswaUpdate } from "@/components/ui/dialog/dialogEdit/dialogEditSiswa";

type UserApi = {
    id: string;
    username: string;
    name: string | null;
    jurusan: string | null;
    role: "USER" | "ADMIN";
};

type SiswaPayload = {
    spmb: string;
    nama: string;
    jurusan: string;
    password?: string;
};

type UserListResponse = { data?: UserApi[]; message?: string; error?: string };
type UserResponse = { data?: UserApi; message?: string; error?: string };

function toTableRows(users: UserApi[]): ManajemenAkunRow[] {
    return (Array.isArray(users) ? users : [])
        .filter((user) => user.role === "USER")
        .map((user, index) => ({
            id: user.id,
            no: index + 1,
            spmb: "••••••••",
            nama: user.name ?? user.username,
            jurusan: user.jurusan ?? "-",
        }));
}

async function getErrorMessage(response: Response) {
    const body = (await response.json().catch(() => null)) as { error?: string; message?: string } | null;
    return body?.error ?? body?.message ?? "Terjadi kesalahan saat memproses akun siswa.";
}

export default function Dashboard() {
    const [query, setQuery] = useState("");
    const [data, setData] = useState<ManajemenAkunRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("/api/user?page=1&limit=200", { cache: "no-store" });
            if (!response.ok) throw new Error(await getErrorMessage(response));

            const payload = (await response.json()) as UserListResponse;
            setData(toTableRows(payload.data ?? []));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal memuat akun siswa.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void loadUsers();
        }, 0);

        return () => window.clearTimeout(timer);
    }, [loadUsers]);

    async function createSiswa(valuesList: SiswaPayload[]) {
        setError("");
        const created = await Promise.all(valuesList.map(async (values) => {
            const response = await fetch("/api/user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: values.nama.trim(),
                    name: values.nama.trim(),
                    jurusan: values.jurusan,
                    password: values.password,
                    role: "USER",
                }),
            });
            if (!response.ok) throw new Error(await getErrorMessage(response));
            const payload = (await response.json()) as UserResponse;
            if (!payload.data) throw new Error("Data akun siswa tidak ditemukan pada respons server.");
            return payload.data;
        })).catch((err: unknown) => {
            const message = err instanceof Error ? err.message : "Gagal menambahkan akun siswa.";
            setError(message);
            throw new Error(message);
        });

        setData((current) => [...current, ...toTableRows(created).map((row, index) => ({ ...row, no: current.length + index + 1 }))]);
    }

    async function updateSiswa(id: string, values: SiswaPayload) {
        setError("");
        const response = await fetch(`/api/user/${encodeURIComponent(id)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: values.nama.trim(),
                name: values.nama.trim(),
                jurusan: values.jurusan,
                ...(values.password ? { password: values.password } : {}),
            }),
        });
        if (!response.ok) {
            const message = await getErrorMessage(response);
            setError(message);
            throw new Error(message);
        }

        const updated = (await response.json()) as UserApi;
        setData((current) => current.map((row) => row.id === id ? { ...toTableRows([updated])[0], no: row.no } : row));
    }

    async function deleteSiswa(id: string) {
        setError("");
        const response = await fetch(`/api/user/${encodeURIComponent(id)}`, { method: "DELETE" });
        if (!response.ok) {
            const message = await getErrorMessage(response);
            setError(message);
            throw new Error(message);
        }

        setData((current) => current.filter((row) => row.id !== id).map((row, index) => ({ ...row, no: index + 1 })));
    }

    const filteredData = data.filter((row) => [row.nama, row.jurusan, row.spmb].join(" ").toLowerCase().includes(query.toLowerCase()));

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

                <DialogTambahSiswa onSubmit={createSiswa} />
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

            {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
            {isLoading ? (
                <p className="text-sm text-muted-foreground">Memuat akun siswa...</p>
            ) : (
                <TableManajemenAkun data={filteredData} onEdit={updateSiswa} onDelete={deleteSiswa} />
            )}
        </div>
    );
}
