"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./dialog";

const jurusanOptions = ["RPL", "TKJ", "Multimedia"];

type MapelOption = { id: string; nama: string };

export type NilaiSiswaFormValues = {
    spmb: string;
    nama: string;
    jurusan: string;
    nilai: Record<string, string>;
};

interface DialogTambahNilaiSiswaProps {
    mapelList: MapelOption[];
    onSubmit?: (values: NilaiSiswaFormValues) => void;
}

export function DialogTambahNilaiSiswa({ mapelList, onSubmit }: DialogTambahNilaiSiswaProps) {
    const [open, setOpen] = useState(false);
    const [values, setValues] = useState<NilaiSiswaFormValues>(() => createInitialValues(mapelList));

    function handleChange(key: "spmb" | "nama" | "jurusan", value: string) {
        setValues((current) => ({ ...current, [key]: value }));
    }

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        onSubmit?.(values);
        setValues(createInitialValues(mapelList));
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    <Button className="inline-flex items-center gap-2">
                        <Plus className="size-4" />
                        Tambah Nilai
                    </Button>
                }
            />

            <DialogContent className="sm:max-w-2xl">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <DialogHeader>
                        <DialogTitle>Tambah Nilai Siswa</DialogTitle>
                        <DialogDescription>Isi data siswa dan nilai mata pelajaran yang tersedia.</DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="No. SPMB" htmlFor="spmb">
                            <input
                                id="spmb"
                                required
                                value={values.spmb}
                                onChange={(event) => handleChange("spmb", event.target.value)}
                                placeholder="SPMB-0006"
                                className={inputClassName}
                            />
                        </Field>

                        <Field label="Jurusan" htmlFor="jurusan">
                            <select id="jurusan" required value={values.jurusan} onChange={(event) => handleChange("jurusan", event.target.value)} className={inputClassName}>
                                <option value="" disabled>Pilih jurusan</option>
                                {jurusanOptions.map((jurusan) => <option key={jurusan} value={jurusan}>{jurusan}</option>)}
                            </select>
                        </Field>

                        <Field label="Nama" htmlFor="nama" className="sm:col-span-2">
                            <input
                                id="nama"
                                required
                                value={values.nama}
                                onChange={(event) => handleChange("nama", event.target.value)}
                                placeholder="Nama siswa"
                                className={inputClassName}
                            />
                        </Field>
                    </div>

                    <fieldset className="rounded-lg border border-border p-4">
                        <legend className="px-1 text-sm font-medium text-foreground">Nilai Mata Pelajaran</legend>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {mapelList.map((mapel) => (
                                <Field key={mapel.id} label={mapel.nama} htmlFor={`nilai-${mapel.id}`} compact>
                                    <input
                                        id={`nilai-${mapel.id}`}
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={values.nilai[mapel.id] ?? ""}
                                        onChange={(event) => setValues((current) => ({
                                            ...current,
                                            nilai: { ...current.nilai, [mapel.id]: event.target.value },
                                        }))}
                                        className={inputClassName}
                                    />
                                </Field>
                            ))}
                        </div>
                    </fieldset>

                    <DialogFooter>
                        <DialogClose render={<Button type="button" variant="outline">Batal</Button>} />
                        <Button type="submit">Simpan</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

const inputClassName = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

function createInitialValues(mapelList: MapelOption[]): NilaiSiswaFormValues {
    return { spmb: "", nama: "", jurusan: "", nilai: Object.fromEntries(mapelList.map((mapel) => [mapel.id, ""])) };
}

function Field({ label, htmlFor, children, className, compact = false }: { label: string; htmlFor: string; children: React.ReactNode; className?: string; compact?: boolean }) {
    return (
        <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
            <label htmlFor={htmlFor} className={compact ? "truncate text-xs font-medium text-foreground" : "text-sm font-medium text-foreground"}>{label}</label>
            {children}
        </div>
    );
}
