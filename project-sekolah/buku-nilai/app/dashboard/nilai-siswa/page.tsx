"use client";

import { useState } from "react";
import { GraduationCap, BookOpen, Users, Search, Calendar } from "lucide-react";
import { TableNilaiSiswa, type Mapel, type NilaiSiswaRow } from "@/components/application/table/table-nilaiSiswa";
import { DialogTambahNilaiSiswa } from "@/components/ui/dialog/dialogAddNilai";

const mapelList: Mapel[] = [
    { id: "mtk", nama: "Matematika" },
    { id: "bindo", nama: "Bahasa Indonesia" },
    { id: "bing", nama: "Bahasa Inggris" },
    { id: "ipa", nama: "IPA" },
];

const dummyData: NilaiSiswaRow[] = [
    { id: "1", no: 1, spmb: "SPMB-0001", nama: "Ahmad Fauzi", jurusan: "RPL", nilai: { mtk: 88, bindo: 90, bing: 82, ipa: 85 } },
    { id: "2", no: 2, spmb: "SPMB-0002", nama: "Siti Nurhaliza", jurusan: "TKJ", nilai: { mtk: 95, bindo: 89, bing: 91, ipa: 93 } },
    { id: "3", no: 3, spmb: "SPMB-0003", nama: "Budi Santoso", jurusan: "RPL", nilai: { mtk: 70, bindo: 75, bing: null, ipa: 78 } },
    { id: "4", no: 4, spmb: "SPMB-0004", nama: "Dewi Lestari", jurusan: "Multimedia", nilai: { mtk: 84, bindo: 88, bing: 80, ipa: 82 } },
    { id: "5", no: 5, spmb: "SPMB-0005", nama: "Rizky Ramadhan", jurusan: "TKJ", nilai: { mtk: 91, bindo: 85, bing: 87, ipa: 90 } },
];

function average(row: NilaiSiswaRow) {
    const values = Object.values(row.nilai).filter((v): v is number => typeof v === "number");
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
}

export default function NilaiSiswa() {
    const [query, setQuery] = useState("");
    const [data, setData] = useState(dummyData);

    const filteredData = data.filter((row) =>
        [row.nama, row.jurusan, row.spmb].join(" ").toLowerCase().includes(query.toLowerCase())
    );

    const totalSiswa = data.length;
    const totalMapel = mapelList.length;
    const rataRata = data.reduce((sum, row) => sum + average(row), 0) / (totalSiswa || 1);

    return (
        <div className="flex min-h-svh w-full flex-col gap-6 p-6 font-sans md:p-10">
            {/* Header card */}
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

               <DialogTambahNilaiSiswa
                    onSubmit={(values) => {
                        // TODO: sambungkan ke state/API sungguhan.
                        console.log("Nilai baru:", values);
                    }}
                />
            </div>

            {/* Stat cards — pakai primary / secondary / accent, bukan warna acak */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard icon={<Users className="size-5" />} tone="primary" label="Total Siswa" value={totalSiswa} />
                <StatCard icon={<BookOpen className="size-5" />} tone="secondary" label="Total Mata Pelajaran" value={totalMapel} />
                <StatCard icon={<GraduationCap className="size-5" />} tone="accent" label="Rata-rata Nilai" value={rataRata.toFixed(1)} />
            </div>

            {/* Search + filter bar */}
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

            <TableNilaiSiswa
                mapelList={mapelList}
                data={filteredData}
                onEdit={(id, values) => {
                    setData((current) => current.map((row) => (row.id === id ? { ...row, ...values } : row)));
                }}
                onDelete={(id) => {
                    setData((current) => current.filter((row) => row.id !== id));
                }}
            />
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
