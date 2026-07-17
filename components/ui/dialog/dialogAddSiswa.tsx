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
} from "@/components/ui/dialog/dialog";

const jurusanOptions = ["RPL", "TKJ", "DKV", "ANIMASI", "BC", "TE"];

export type SiswaFormValues = {
    spmb: string;
    nama: string;
    jurusan: string;
    password: string;
};

interface DialogTambahSiswaProps {
    onSubmit?: (values: SiswaFormValues) => void;
}

export function DialogTambahSiswa({ onSubmit }: DialogTambahSiswaProps) {
    const [open, setOpen] = useState(false);
    const [values, setValues] = useState<SiswaFormValues>(createInitialValues);

    function handleChange(key: keyof SiswaFormValues, value: string) {
        setValues((current) => ({ ...current, [key]: value }));
    }

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        onSubmit?.(values);
        setValues(createInitialValues());
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    <Button className="inline-flex items-center gap-2">
                        <Plus className="size-4" />
                        Tambah Siswa
                    </Button>
                }
            />

            <DialogContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <DialogHeader>
                        <DialogTitle>Tambah Akun Siswa</DialogTitle>
                        <DialogDescription>Isi data akun yang akan digunakan siswa untuk melihat nilai.</DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="NO SPMB" htmlFor="spmb">
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
                            <select
                                id="jurusan"
                                required
                                value={values.jurusan}
                                onChange={(event) => handleChange("jurusan", event.target.value)}
                                className={inputClassName}
                            >
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

                        <Field label="Password" htmlFor="password" className="sm:col-span-2">
                            <input
                                id="password"
                                required
                                value={values.password}
                                onChange={(event) => handleChange("password", event.target.value)}
                                placeholder="Buat password siswa"
                                className={inputClassName}
                            />
                        </Field>
                    </div>

                    <DialogFooter>
                        <DialogClose render={<Button type="button" variant="outline">Batal</Button>} />
                        <Button type="submit">Simpan Akun</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

const inputClassName = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none";

function createInitialValues(): SiswaFormValues {
    return { spmb: "", nama: "", jurusan: "", password: "" };
}

function Field({ label, htmlFor, children, className }: { label: string; htmlFor: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
            <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">{label}</label>
            {children}
        </div>
    );
}
