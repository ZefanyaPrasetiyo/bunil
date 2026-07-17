"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
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

export type SiswaUpdate = {
    spmb: string;
    nama: string;
    jurusan: string;
    password: string;
};

type SiswaEditable = SiswaUpdate & { id: string };

interface DialogEditSiswaProps {
    row: SiswaEditable;
    onSubmit?: (values: SiswaUpdate) => void;
}

export function DialogEditSiswa({ row, onSubmit }: DialogEditSiswaProps) {
    const [open, setOpen] = useState(false);
    const [values, setValues] = useState<SiswaUpdate>(() => createValues(row));

    function handleOpenChange(nextOpen: boolean) {
        if (nextOpen) setValues(createValues(row));
        setOpen(nextOpen);
    }

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        onSubmit?.(values);
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger render={<Button variant="outline" size="icon-sm" aria-label={`Edit akun ${row.nama}`}><Pencil className="size-4 text-primary" /></Button>} />

            <DialogContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <DialogHeader>
                        <DialogTitle>Edit Akun Siswa</DialogTitle>
                        <DialogDescription>Perbarui data akun untuk {row.nama}.</DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="NO SPMB" htmlFor={`edit-spmb-${row.id}`}>
                            <input id={`edit-spmb-${row.id}`} required value={values.spmb} onChange={(event) => setValues((current) => ({ ...current, spmb: event.target.value }))} className={inputClassName} />
                        </Field>
                        <Field label="Jurusan" htmlFor={`edit-jurusan-${row.id}`}>
                            <select id={`edit-jurusan-${row.id}`} required value={values.jurusan} onChange={(event) => setValues((current) => ({ ...current, jurusan: event.target.value }))} className={inputClassName}>
                                {jurusanOptions.map((jurusan) => <option key={jurusan} value={jurusan}>{jurusan}</option>)}
                            </select>
                        </Field>
                        <Field label="Nama" htmlFor={`edit-nama-${row.id}`} className="sm:col-span-2">
                            <input id={`edit-nama-${row.id}`} required value={values.nama} onChange={(event) => setValues((current) => ({ ...current, nama: event.target.value }))} className={inputClassName} />
                        </Field>
                        <Field label="Password" htmlFor={`edit-password-${row.id}`} className="sm:col-span-2">
                            <input id={`edit-password-${row.id}`} required value={values.password} onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))} className={inputClassName} />
                        </Field>
                    </div>

                    <DialogFooter>
                        <DialogClose render={<Button type="button" variant="outline">Batal</Button>} />
                        <Button type="submit">Simpan Perubahan</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface DialogHapusSiswaProps {
    nama: string;
    onConfirm?: () => void;
}

export function DialogHapusSiswa({ nama, onConfirm }: DialogHapusSiswaProps) {
    const [open, setOpen] = useState(false);

    function handleConfirm() {
        onConfirm?.();
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button variant="destructive" size="icon-sm" aria-label={`Hapus akun ${nama}`}><Trash2 className="size-4" /></Button>} />
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Hapus Akun Siswa</DialogTitle>
                    <DialogDescription>Yakin ingin menghapus akun {nama}? Tindakan ini tidak dapat dibatalkan.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose render={<Button type="button" variant="outline">Batal</Button>} />
                    <Button type="button" variant="destructive" onClick={handleConfirm}>Hapus Akun</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

const inputClassName = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none";

function createValues(row: SiswaEditable): SiswaUpdate {
    return { spmb: row.spmb, nama: row.nama, jurusan: row.jurusan, password: row.password };
}

function Field({ label, htmlFor, children, className }: { label: string; htmlFor: string; children: React.ReactNode; className?: string }) {
    return <div className={`flex flex-col gap-1.5 ${className ?? ""}`}><label htmlFor={htmlFor} className="text-sm font-medium text-foreground">{label}</label>{children}</div>;
}
