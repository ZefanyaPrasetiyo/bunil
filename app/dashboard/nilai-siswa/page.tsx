"use client";

import { useCallback, useEffect, useState } from "react";
import { GraduationCap, BookOpen, Users, Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { TableNilaiSiswa, type Mapel, type NilaiSiswaRow } from "@/components/application/table/table-nilaiSiswa";
import { DialogTambahNilaiSiswa, type NilaiSiswaFormValues } from "@/components/ui/dialog/dialogAddNilai";

type UserApi = { id: string; username: string; no_spmb: string | null; nama: string | null; jurusan: string | null; role: "USER" | "ADMIN" };
type NilaiApi = { id: string; userId: string; mapelId: string; nilai: number };
type SortOption = "nama-asc" | "nama-desc" | "nilai-asc" | "nilai-desc";

async function getErrorMessage(response: Response) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    return body?.error ?? "Terjadi kesalahan saat memproses nilai siswa.";
}

function buildRows(users: UserApi[], nilaiRecords: NilaiApi[]): NilaiSiswaRow[] {
    return users.filter((user) => user.role === "USER").map((user, index) => ({
        id: user.id,
        no: index + 1,
        spmb: user.no_spmb ?? user.username,
        nama: user.nama ?? "-",
        jurusan: user.jurusan ?? "-",
        nilai: Object.fromEntries(nilaiRecords.filter((item) => item.userId === user.id).map((item) => [item.mapelId, item.nilai])),
    }));
}

function average(row: NilaiSiswaRow) {
    const values = Object.values(row.nilai).filter((value): value is number => typeof value === "number");
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

export default function NilaiSiswa() {
    const [query, setQuery] = useState("");
    const [jurusanFilter, setJurusanFilter] = useState("all");
    const [sortOption, setSortOption] = useState<SortOption>("nama-asc");
    const [users, setUsers] = useState<UserApi[]>([]);
    const [mapelList, setMapelList] = useState<Mapel[]>([]);
    const [nilaiRecords, setNilaiRecords] = useState<NilaiApi[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError("");
        try {
            const [usersResponse, mapelResponse, nilaiResponse] = await Promise.all([
                fetch("/api/user", { cache: "no-store" }),
                fetch("/api/mata-pelajaran", { cache: "no-store" }),
                fetch("/api/nilai", { cache: "no-store" }),
            ]);
            if (!usersResponse.ok) throw new Error(await getErrorMessage(usersResponse));
            if (!mapelResponse.ok) throw new Error(await getErrorMessage(mapelResponse));
            if (!nilaiResponse.ok) throw new Error(await getErrorMessage(nilaiResponse));

            setUsers((await usersResponse.json()) as UserApi[]);
            setMapelList((await mapelResponse.json()) as Mapel[]);
            setNilaiRecords((await nilaiResponse.json()) as NilaiApi[]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal memuat data nilai siswa.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => void loadData(), 0);
        return () => window.clearTimeout(timer);
    }, [loadData]);

    async function saveStaging(valuesList: NilaiSiswaFormValues[]) {
        setError("");
        try {
            await Promise.all(valuesList.flatMap((values) => {
                const user = users.find((item) => item.role === "USER" && (item.no_spmb ?? item.username) === values.spmb.trim());
                if (!user) throw new Error(`Siswa dengan NO SPMB ${values.spmb} tidak ditemukan.`);

                return mapelList.flatMap((mapel) => {
                    const rawValue = values.nilai[mapel.id];
                    if (rawValue === "" || rawValue == null) return [];
                    const nilai = Number(rawValue);
                    if (!Number.isFinite(nilai) || nilai < 0 || nilai > 100) throw new Error(`Nilai ${mapel.nama} harus di antara 0 sampai 100.`);

                    const existing = nilaiRecords.find((item) => item.userId === user.id && item.mapelId === mapel.id);
                    return [fetch(existing ? `/api/nilai/${encodeURIComponent(existing.id)}` : "/api/nilai", {
                        method: existing ? "PUT" : "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(existing ? { nilai } : { userId: user.id, mapelId: mapel.id, nilai }),
                    }).then(async (response) => {
                        if (!response.ok) throw new Error(await getErrorMessage(response));
                    })];
                });
            }));
            await loadData();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Gagal menyimpan nilai siswa.";
            setError(message);
            throw new Error(message);
        }
    }

    async function updateNilaiSiswa(userId: string, values: { spmb: string; nama: string; jurusan: string; nilai: Record<string, number | null> }) {
        setError("");
        try {
            const response = await fetch(`/api/user/${encodeURIComponent(userId)}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ no_spmb: values.spmb.trim(), username: values.spmb.trim(), nama: values.nama.trim(), jurusan: values.jurusan }),
            });
            if (!response.ok) throw new Error(await getErrorMessage(response));

            await Promise.all(mapelList.flatMap((mapel) => {
                const value = values.nilai[mapel.id];
                const existing = nilaiRecords.find((item) => item.userId === userId && item.mapelId === mapel.id);
                if (value == null) return existing ? [fetch(`/api/nilai/${encodeURIComponent(existing.id)}`, { method: "DELETE" })] : [];
                const body = existing ? { nilai: value } : { userId, mapelId: mapel.id, nilai: value };
                return [fetch(existing ? `/api/nilai/${encodeURIComponent(existing.id)}` : "/api/nilai", { method: existing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })];
            }).map(async (request) => {
                const nilaiResponse = await request;
                if (!nilaiResponse.ok) throw new Error(await getErrorMessage(nilaiResponse));
            }));
            await loadData();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Gagal mengubah nilai siswa.";
            setError(message);
            throw new Error(message);
        }
    }

    async function deleteNilaiSiswa(userId: string) {
        setError("");
        try {
            await Promise.all(nilaiRecords.filter((item) => item.userId === userId).map(async (item) => {
                const response = await fetch(`/api/nilai/${encodeURIComponent(item.id)}`, { method: "DELETE" });
                if (!response.ok) throw new Error(await getErrorMessage(response));
            }));
            await loadData();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Gagal menghapus nilai siswa.";
            setError(message);
            throw new Error(message);
        }
    }

    const data = buildRows(users, nilaiRecords);
    const jurusanOptions = [...new Set(data.map((row) => row.jurusan).filter((jurusan) => jurusan !== "-"))].sort((a, b) => a.localeCompare(b, "id"));
    const filteredData = data
        .filter((row) => [row.nama, row.jurusan, row.spmb].join(" ").toLowerCase().includes(query.toLowerCase()))
        .filter((row) => jurusanFilter === "all" || row.jurusan === jurusanFilter)
        .sort((first, second) => {
            switch (sortOption) {
                case "nama-desc":
                    return second.nama.localeCompare(first.nama, "id");
                case "nilai-asc":
                    return average(first) - average(second) || first.nama.localeCompare(second.nama, "id");
                case "nilai-desc":
                    return average(second) - average(first) || first.nama.localeCompare(second.nama, "id");
                default:
                    return first.nama.localeCompare(second.nama, "id");
            }
        });
    const totalSiswa = data.length;
    const rataRata = data.reduce((sum, row) => sum + average(row), 0) / (totalSiswa || 1);

    return (
        <div className="flex min-h-svh w-full flex-col gap-6 p-6 font-sans md:p-10">
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"><GraduationCap className="size-6" /></div>
                    <div><h1 className="font-heading text-2xl font-bold text-foreground">Data Nilai Siswa</h1><p className="text-sm text-muted-foreground">Kelola dan pantau nilai akademik siswa</p></div>
                </div>
                <DialogTambahNilaiSiswa
                    mapelList={mapelList}
                    siswaList={users.filter((user) => user.role === "USER").map((user) => ({
                        spmb: user.no_spmb ?? user.username,
                        nama: user.nama ?? "-",
                        jurusan: user.jurusan ?? "",
                    }))}
                    onSubmit={saveStaging}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard icon={<Users className="size-5" />} tone="primary" label="Total Siswa" value={totalSiswa} />
                <StatCard icon={<BookOpen className="size-5" />} tone="secondary" label="Total Mata Pelajaran" value={mapelList.length} />
                <StatCard icon={<GraduationCap className="size-5" />} tone="accent" label="Rata-rata Nilai" value={rataRata.toFixed(1)} />
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-sm"><Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari berdasarkan nama, jurusan, atau no. SPMB" className="w-full rounded-lg border border-input bg-background py-2.5 pr-3 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none" /></div>
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                    <label className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground">
                        <SlidersHorizontal className="size-4 text-muted-foreground" />
                        <span className="sr-only">Filter jurusan</span>
                        <select aria-label="Filter jurusan" value={jurusanFilter} onChange={(event) => setJurusanFilter(event.target.value)} className="min-w-28 bg-transparent outline-none">
                            <option value="all">Semua jurusan</option>
                            {jurusanOptions.map((jurusan) => <option key={jurusan} value={jurusan}>{jurusan}</option>)}
                        </select>
                    </label>
                    <label className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground">
                        <ArrowUpDown className="size-4 text-muted-foreground" />
                        <span className="sr-only">Urutkan data</span>
                        <select aria-label="Urutkan data" value={sortOption} onChange={(event) => setSortOption(event.target.value as SortOption)} className="min-w-40 bg-transparent outline-none">
                            <option value="nama-asc">Nama: A–Z</option>
                            <option value="nama-desc">Nama: Z–A</option>
                            <option value="nilai-asc">Nilai: rendah–tinggi</option>
                            <option value="nilai-desc">Nilai: tinggi–rendah</option>
                        </select>
                    </label>
                </div>
            </div>

            {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
            {isLoading ? <p className="text-sm text-muted-foreground">Memuat data nilai siswa...</p> : <TableNilaiSiswa mapelList={mapelList} data={filteredData} onEdit={updateNilaiSiswa} onDelete={deleteNilaiSiswa} />}
        </div>
    );
}

function StatCard({ icon, tone, label, value }: { icon: React.ReactNode; tone: "primary" | "secondary" | "accent"; label: string; value: string | number }) {
    const toneClass = { primary: "bg-primary/15 text-primary", secondary: "bg-secondary/20 text-secondary", accent: "bg-accent/20 text-accent" }[tone];
    return <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5"><div className={`flex size-11 items-center justify-center rounded-xl ${toneClass}`}>{icon}</div><div><p className="text-sm text-muted-foreground">{label}</p><p className="font-heading text-xl font-bold text-foreground">{value}</p></div></div>;
}
