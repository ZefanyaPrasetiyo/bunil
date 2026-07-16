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

// Dummy — nanti tinggal diganti fetch dari master data jurusan/mapel.
const jurusanOptions = ["RPL", "TKJ", "Multimedia"];
const mapelOptions = ["Matematika", "Bahasa Indonesia", "Bahasa Inggris", "IPA"];

export type NilaiSiswaFormValues = {
    spmb: string;
    nama: string;
    jurusan: string;
    mapel: string;
    nilai: string;
};

const initialValues: NilaiSiswaFormValues = {
    spmb: "",
    nama: "",
    jurusan: "",
    mapel: "",
    nilai: "",
};

interface DialogTambahNilaiSiswaProps {
    onSubmit?: (values: NilaiSiswaFormValues) => void;
}

export function DialogTambahNilaiSiswa({ onSubmit }: DialogTambahNilaiSiswaProps) {
    const [open, setOpen] = useState(false);
    const [values, setValues] = useState<NilaiSiswaFormValues>(initialValues);

    function handleChange<K extends keyof NilaiSiswaFormValues>(key: K, value: string) {
        setValues((prev) => ({ ...prev, [key]: value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onSubmit?.(values);
        setValues(initialValues);
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

            <DialogContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <DialogHeader>
                        <DialogTitle>Tambah Nilai Siswa</DialogTitle>
                        <DialogDescription>
                            Isi data siswa dan pilih satu mata pelajaran untuk input nilai.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-4">
                        <Field label="No. SPMB" htmlFor="spmb">
                            <input
                                id="spmb"
                                required
                                value={values.spmb}
                                onChange={(e) => handleChange("spmb", e.target.value)}
                                placeholder="SPMB-0006"
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </Field>

                        <Field label="Nama" htmlFor="nama">
                            <input
                                id="nama"
                                required
                                value={values.nama}
                                onChange={(e) => handleChange("nama", e.target.value)}
                                placeholder="Nama siswa"
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </Field>

                        <Field label="Jurusan" htmlFor="jurusan">
                            <select
                                id="jurusan"
                                required
                                value={values.jurusan}
                                onChange={(e) => handleChange("jurusan", e.target.value)}
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="" disabled>
                                    Pilih jurusan
                                </option>
                                {jurusanOptions.map((j) => (
                                    <option key={j} value={j}>
                                        {j}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Mata Pelajaran" htmlFor="mapel">
                            <select
                                id="mapel"
                                required
                                value={values.mapel}
                                onChange={(e) => handleChange("mapel", e.target.value)}
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="" disabled>
                                    Pilih satu mata pelajaran
                                </option>
                                {mapelOptions.map((m) => (
                                    <option key={m} value={m}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                        </Field>
                         <Field label="Nilai" htmlFor="nilai">
                            <input
                                id="nilai"
                                required
                                type="number"
                                min="0"
                                max="100"
                                value={values.nilai}
                                onChange={(e) => handleChange("nilai", e.target.value)}
                                placeholder="Nilai"
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </Field>
                    </div>

                    <DialogFooter>
                        <DialogClose
                            render={
                                <Button type="button" variant="outline">
                                    Batal
                                </Button>
                            }
                        />
                        <Button type="submit">Simpan</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function Field({
    label,
    htmlFor,
    children,
}: {
    label: string;
    htmlFor: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
                {label}
            </label>
            {children}
        </div>
    );
}