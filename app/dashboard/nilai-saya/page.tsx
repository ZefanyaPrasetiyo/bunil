"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, BookOpen, Calculator, Trophy } from "lucide-react";

type NilaiSayaItem = {
    pelajaran: string;
    nilai: number;
};

type UserSessionPayload = {
    user?: {
        id?: string;
        nama?: string | null;
        username?: string | null;
    } | null;
    session?: {
        user?: {
            id?: string;
            nama?: string | null;
            username?: string | null;
        } | null;
    } | null;
};

type NilaiApiItem = {
    id: string;
    nilai: number;
    userId?: string;
    mapelId?: string;
    mapel?: { id?: string; nama?: string };
};

type NilaiApiResponse = {
    data?: NilaiApiItem[];
    message?: string;
    status?: number;
};

function nilaiTone(score: number) {
    if (score < 70) return "border-destructive/30 bg-destructive/10 text-destructive";
    if (score <= 90) return "border-border bg-muted text-foreground";
    return "border-secondary/40 bg-secondary/20 text-[color-mix(in_oklab,var(--secondary),black_35%)] dark:text-secondary";
}

export default function NilaiSaya() {
    const [studentName, setStudentName] = useState("Siswa");
    const [nilai, setNilai] = useState<NilaiSayaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        async function loadData() {
            try {
                setLoading(true);
                setError(null);

                const sessionResponse = await fetch("/api/session", { credentials: "include" });
                const sessionPayload = (await sessionResponse.json()) as UserSessionPayload;
                const user = sessionPayload.user ?? sessionPayload.session?.user ?? null;

                if (!sessionResponse.ok || !user?.id) {
                    throw new Error("Sesi pengguna tidak ditemukan");
                }

                if (active) {
                    setStudentName(user.nama || user.username || "Siswa");
                }

                const nilaiResponse = await fetch("/api/nilai?page=1&limit=200", { credentials: "include" });
                const nilaiPayload = (await nilaiResponse.json()) as NilaiApiResponse;

                if (!nilaiResponse.ok) {
                    throw new Error(nilaiPayload.message || "Gagal memuat nilai");
                }

                if (active) {
                    const filtered = (nilaiPayload.data ?? [])
                        .filter((item) => item.userId === user.id || item.user?.id === user.id)
                        .map((item) => ({
                            pelajaran: item.mapel?.nama || "Mata pelajaran",
                            nilai: Number(item.nilai) || 0,
                        }))
                        .sort((a, b) => a.pelajaran.localeCompare(b.pelajaran));

                    setNilai(filtered);
                }
            } catch (err) {
                if (active) {
                    setError(err instanceof Error ? err.message : "Gagal memuat nilai");
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

    const totalNilai = useMemo(() => nilai.reduce((total, item) => total + item.nilai, 0), [nilai]);
    const nilaiTerkecil = useMemo(() => (nilai.length > 0 ? Math.min(...nilai.map((item) => item.nilai)) : 0), [nilai]);
    const nilaiTerbesar = useMemo(() => (nilai.length > 0 ? Math.max(...nilai.map((item) => item.nilai)) : 0), [nilai]);
    const rataRata = useMemo(() => (nilai.length > 0 ? totalNilai / nilai.length : 0), [nilai, totalNilai]);

    return (
        <div className="flex min-h-svh w-full flex-col gap-8 p-6 font-sans md:p-10">
            <section className="rounded-2xl border border-border bg-card p-6">
                <p className="text-sm font-medium text-primary">Portal Nilai Siswa</p>
                <h1 className="mt-1 font-heading text-3xl font-bold text-foreground">Hi, {studentName}</h1>
                <p className="mt-2 text-muted-foreground">Amati hasil penilaianmu di sini.</p>
            </section>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            {loading ? (
                <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">Memuat nilai...</div>
            ) : (
                <>
                    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard icon={<BookOpen className="size-5" />} label="Jumlah Mapel" value={nilai.length} tone="primary" />
                        <StatCard icon={<Calculator className="size-5" />} label="Jumlah Keseluruhan Nilai" value={totalNilai} tone="accent" />
                        <div className="rounded-2xl border border-border bg-card p-5">
                            <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground"><BarChart3 className="size-5" /></div>
                            <p className="text-sm text-muted-foreground">Rentang Nilai</p>
                            <div className="mt-1 flex items-end gap-3"><div><p className="text-xs text-muted-foreground">Terkecil</p><p className="font-heading text-xl font-bold text-foreground">{nilaiTerkecil}</p></div><span className="mb-1 h-7 w-px bg-border" /><div><p className="text-xs text-muted-foreground">Terbesar</p><p className="font-heading text-xl font-bold text-foreground">{nilaiTerbesar}</p></div></div>
                        </div>
                        <StatCard icon={<Trophy className="size-5" />} label="Nilai Rata-rata" value={rataRata.toFixed(1)} tone="secondary" />
                    </section>

                    <section className="flex flex-col gap-4">
                        <div><h2 className="font-heading text-2xl font-bold text-foreground">Nilai Kamu</h2><p className="mt-1 text-sm text-muted-foreground">Daftar nilai untuk setiap mata pelajaran.</p></div>
                        {nilai.length === 0 ? (
                            <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">Belum ada data nilai yang tersedia.</div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {nilai.map((item) => <article key={item.pelajaran} className="flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4"><h3 className="font-medium text-foreground">{item.pelajaran}</h3><span className={`min-w-14 rounded-lg border px-3 py-1.5 text-center font-heading text-lg font-bold ${nilaiTone(item.nilai)}`}>{item.nilai}</span></article>)}
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string | number; tone: "primary" | "secondary" | "accent" }) {
    const toneClass = { primary: "bg-primary/15 text-primary", secondary: "bg-secondary/20 text-[color-mix(in_oklab,var(--secondary),black_35%)] dark:text-secondary", accent: "bg-accent/20 text-[color-mix(in_oklab,var(--accent),black_45%)] dark:text-accent" }[tone];
    return <div className="rounded-2xl border border-border bg-card p-5"><div className={`mb-4 flex size-11 items-center justify-center rounded-xl ${toneClass}`}>{icon}</div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 font-heading text-2xl font-bold text-foreground">{value}</p></div>;
}
