"use client";

import { useEffect, useMemo, useState } from "react";
import { GraduationCap, BookOpen, Users, Search, Calendar } from "lucide-react";
import { TableNilaiSiswa, type Mapel, type NilaiSiswaRow } from "@/components/application/table/table-nilaiSiswa";
import { DialogTambahNilaiSiswa, type NilaiSiswaFormValues } from "@/components/ui/dialog/dialogAddNilai";
import type { NilaiSiswaUpdate } from "@/components/ui/dialog/dialogEdit/dialogEditNilai";

type UserApiItem = {
    id: string;
    no_spmb?: string | null;
    nama?: string | null;
    username?: string | null;
    jurusan?: string | null;
};

type MataPelajaranApiItem = { id: string; nama: string };

type NilaiApiItem = {
    id: string;
    nilai: number;
    userId: string;
    mapelId: string;
    user?: { id?: string };
    mapel?: { id?: string };
};

type NilaiRecord = {
    id: string;
    nilai: number;
    userId: string;
    mapelId: string;
};

function average(row: NilaiSiswaRow) {
    const values = Object.values(row.nilai).filter((v): v is number => typeof v === "number");
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
}

function mapUserToRow(user: UserApiItem, index: number, nilaiRecords: NilaiRecord[]): NilaiSiswaRow {
    const row: NilaiSiswaRow = {
        id: user.id,
        no: index + 1,
        spmb: user.no_spmb || "-",
        nama: user.nama || user.username || "Tanpa nama",
        jurusan: user.jurusan || "-",
        nilai: {},
    };

    nilaiRecords
        .filter((item) => item.userId === user.id)
        .forEach((item) => {
            row.nilai[item.mapelId] = item.nilai;
        });

    return row;
}

function buildUsername(values: Pick<NilaiSiswaFormValues, "spmb" | "nama">) {
    const base = `${values.spmb || values.nama}`.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
    return base || `siswa${Math.floor(Math.random() * 1000)}`;
}

export default function NilaiSiswa() {
    const [query, setQuery] = useState("");
    const [data, setData] = useState<NilaiSiswaRow[]>([]);
    const [mapelList, setMapelList] = useState<Mapel[]>([]);
    const [nilaiRecords, setNilaiRecords] = useState<NilaiRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        async function loadData() {
            try {
                setLoading(true);
                setError(null);

                const [usersResponse, mapelsResponse, nilaiResponse] = await Promise.all([
                    fetch("/api/user?page=1&limit=100", { credentials: "include" }),
                    fetch("/api/mata-pelajaran?page=1&limit=100", { credentials: "include" }),
                    fetch("/api/nilai?page=1&limit=200", { credentials: "include" }),
                ]);

                const usersPayload = (await usersResponse.json()) as { data?: UserApiItem[]; message?: string };
                const mapelsPayload = (await mapelsResponse.json()) as { data?: MataPelajaranApiItem[]; message?: string };
                const nilaiPayload = (await nilaiResponse.json()) as { data?: NilaiApiItem[]; message?: string };

                if (!usersResponse.ok || !mapelsResponse.ok || !nilaiResponse.ok) {
                    throw new Error(usersPayload.message || mapelsPayload.message || nilaiPayload.message || "Gagal memuat data nilai");
                }

                if (active) {
                    const records = (nilaiPayload.data ?? []).map((item) => ({
                        id: item.id,
                        nilai: Number(item.nilai) || 0,
                        userId: item.userId || item.user?.id || "",
                        mapelId: item.mapelId || item.mapel?.id || "",
                    }));
                    const rows = (usersPayload.data ?? []).map((user, index) => mapUserToRow(user, index, records));
                    setNilaiRecords(records);
                    setData(rows);
                    setMapelList((mapelsPayload.data ?? []).map((item) => ({ id: item.id, nama: item.nama })));
                }
            } catch (err) {
                if (active) {
                    setError(err instanceof Error ? err.message : "Gagal memuat data nilai");
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
        () => data.filter((row) => [row.nama, row.jurusan, row.spmb].join(" ").toLowerCase().includes(query.toLowerCase())),
        [data, query],
    );

    const totalSiswa = data.length;
    const totalMapel = mapelList.length;
    const rataRata = useMemo(() => data.reduce((sum, row) => sum + average(row), 0) / (totalSiswa || 1), [data, totalSiswa]);

    async function handleCreate(values: NilaiSiswaFormValues) {
        try {
            const response = await fetch("/api/user", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    no_spmb: values.spmb,
                    nama: values.nama,
                    username: buildUsername(values),
                    password: "default123",
                    jurusan: values.jurusan,
                    role: "USER",
                }),
            });
            const userPayload = (await response.json()) as { data?: UserApiItem; message?: string };

            if (!response.ok) {
                throw new Error(userPayload.message || "Gagal membuat data siswa");
            }

            const user = userPayload.data;
            if (!user) {
                throw new Error("Data siswa tidak ditemukan setelah dibuat");
            }

            const createdRecords: NilaiRecord[] = [];
            for (const mapel of mapelList) {
                const value = values.nilai[mapel.id];
                if (value === "" || value == null) continue;

                const gradeResponse = await fetch("/api/nilai", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nilai: Number(value), userId: user.id, mapelId: mapel.id }),
                });
                const gradePayload = (await gradeResponse.json()) as { data?: NilaiApiItem; message?: string };

                if (!gradeResponse.ok) {
                    throw new Error(gradePayload.message || "Gagal membuat nilai siswa");
                }

                if (gradePayload.data) {
                    createdRecords.push({
                        id: gradePayload.data.id,
                        nilai: Number(gradePayload.data.nilai) || 0,
                        userId: user.id,
                        mapelId: mapel.id,
                    });
                }
            }

            const nextRow: NilaiSiswaRow = {
                id: user.id,
                no: data.length + 1,
                spmb: user.no_spmb || values.spmb,
                nama: user.nama || values.nama,
                jurusan: user.jurusan || values.jurusan,
                nilai: Object.fromEntries(createdRecords.map((item) => [item.mapelId, item.nilai])) as Record<string, number | null | undefined>,
            };

            setData((current) => [...current, nextRow]);
            setNilaiRecords((current) => [...current, ...createdRecords]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal menambahkan data nilai");
        }
    }

    async function handleEdit(id: string, values: NilaiSiswaUpdate) {
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
                    password: undefined,
                    jurusan: values.jurusan,
                    role: "USER",
                }),
            });
            const userPayload = (await response.json()) as { message?: string };

            if (!response.ok) {
                throw new Error(userPayload.message || "Gagal memperbarui siswa");
            }

            const updatedRecords = [...nilaiRecords];
            for (const mapel of mapelList) {
                const existingRecord = updatedRecords.find((item) => item.userId === id && item.mapelId === mapel.id);
                const rawValue = values.nilai[mapel.id];

                if (rawValue == null) {
                    if (existingRecord) {
                        const deleteResponse = await fetch("/api/nilai", {
                            method: "DELETE",
                            credentials: "include",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: existingRecord.id }),
                        });
                        if (deleteResponse.ok) {
                            const index = updatedRecords.findIndex((item) => item.id === existingRecord.id);
                            if (index >= 0) updatedRecords.splice(index, 1);
                        }
                    }
                    continue;
                }

                const numericValue = Number(rawValue);
                if (existingRecord) {
                    const gradeResponse = await fetch("/api/nilai", {
                        method: "PUT",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: existingRecord.id, nilai: numericValue, userId: id, mapelId: mapel.id }),
                    });
                    if (gradeResponse.ok) {
                        const index = updatedRecords.findIndex((item) => item.id === existingRecord.id);
                        if (index >= 0) {
                            updatedRecords[index] = { ...updatedRecords[index], nilai: numericValue };
                        }
                    }
                } else {
                    const gradeResponse = await fetch("/api/nilai", {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ nilai: numericValue, userId: id, mapelId: mapel.id }),
                    });
                    const gradePayload = (await gradeResponse.json()) as { data?: NilaiApiItem; message?: string };
                    if (gradeResponse.ok && gradePayload.data) {
                        updatedRecords.push({
                            id: gradePayload.data.id,
                            nilai: Number(gradePayload.data.nilai) || 0,
                            userId: id,
                            mapelId: mapel.id,
                        });
                    }
                }
            }

            setNilaiRecords(updatedRecords);
            setData((current) => current.map((row) => (row.id === id ? {
                ...row,
                spmb: values.spmb,
                nama: values.nama,
                jurusan: values.jurusan,
                nilai: Object.fromEntries(updatedRecords.filter((item) => item.userId === id).map((item) => [item.mapelId, item.nilai])),
            } : row)));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal memperbarui data nilai");
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
                throw new Error(payload.message || "Gagal menghapus data siswa");
            }

            setData((current) => current.filter((row) => row.id !== id).map((row, index) => ({ ...row, no: index + 1 })));
            setNilaiRecords((current) => current.filter((item) => item.userId !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal menghapus data siswa");
        }
    }

    return (
        <div className="flex min-h-svh w-full flex-col gap-6 p-6 font-sans md:p-10">
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                        <GraduationCap className="size-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold font-heading text-foreground">Data Nilai Siswa</h1>
                        <p className="text-sm text-muted-foreground">Kelola dan pantau nilai akademik siswa</p>
                    </div>
                </div>

                <DialogTambahNilaiSiswa mapelList={mapelList} onSubmit={handleCreate} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard icon={<Users className="size-5" />} tone="primary" label="Total Siswa" value={totalSiswa} />
                <StatCard icon={<BookOpen className="size-5" />} tone="secondary" label="Total Mata Pelajaran" value={totalMapel} />
                <StatCard icon={<GraduationCap className="size-5" />} tone="accent" label="Rata-rata Nilai" value={rataRata.toFixed(1)} />
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Cari berdasarkan nama, jurusan, atau no. SPMB"
                        className="w-full rounded-lg border border-input bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>

                <button className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground hover:bg-muted">
                    <Calendar className="size-4" />
                    Filter Jurusan
                </button>
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            {loading ? (
                <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">Memuat data nilai siswa...</div>
            ) : (
                <TableNilaiSiswa mapelList={mapelList} data={filteredData} onEdit={handleEdit} onDelete={handleDelete} />
            )}
        </div>
    );
}

function StatCard({
    icon,
    tone,
    label,
    value,
}: {
    icon: React.ReactNode;
    tone: "primary" | "secondary" | "accent";
    label: string;
    value: string | number;
}) {
    const toneClass = {
        primary: "bg-primary/15 text-primary",
        secondary: "bg-secondary/20 text-secondary",
        accent: "bg-accent/20 text-accent",
    }[tone];

    return (
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
            <div className={`flex size-11 items-center justify-center rounded-xl ${toneClass}`}>{icon}</div>
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-heading text-xl font-bold text-foreground">{value}</p>
            </div>
        </div>
    );
}
