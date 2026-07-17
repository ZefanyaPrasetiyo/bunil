"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog/dialog";

export type MapelUpdate = { nama: string };

interface DialogEditMapelProps { row: { id: string; nama: string }; onSubmit?: (values: MapelUpdate) => void; }

export function DialogEditMapel({ row, onSubmit }: DialogEditMapelProps) {
    const [open, setOpen] = useState(false);
    const [nama, setNama] = useState(row.nama);
    function handleOpenChange(nextOpen: boolean) { if (nextOpen) setNama(row.nama); setOpen(nextOpen); }
    function handleSubmit(event: React.FormEvent) { event.preventDefault(); onSubmit?.({ nama: nama.trim() }); setOpen(false); }
    return <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger render={<Button variant="outline" size="icon-sm" aria-label={`Edit ${row.nama}`}><Pencil className="size-4 text-primary" /></Button>} />
        <DialogContent><form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <DialogHeader><DialogTitle>Edit Mata Pelajaran</DialogTitle><DialogDescription>Perbarui nama mata pelajaran {row.nama}.</DialogDescription></DialogHeader>
            <div className="flex flex-col gap-1.5"><label htmlFor={`edit-mapel-${row.id}`} className="text-sm font-medium text-foreground">Pelajaran</label><input id={`edit-mapel-${row.id}`} required value={nama} onChange={(event) => setNama(event.target.value)} className={inputClassName} /></div>
            <DialogFooter><DialogClose render={<Button type="button" variant="outline">Batal</Button>} /><Button type="submit">Simpan Perubahan</Button></DialogFooter>
        </form></DialogContent>
    </Dialog>;
}

interface DialogHapusMapelProps { nama: string; onConfirm?: () => void; }

export function DialogHapusMapel({ nama, onConfirm }: DialogHapusMapelProps) {
    const [open, setOpen] = useState(false);
    function handleConfirm() { onConfirm?.(); setOpen(false); }
    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button variant="destructive" size="icon-sm" aria-label={`Hapus ${nama}`}><Trash2 className="size-4" /></Button>} />
        <DialogContent><DialogHeader><DialogTitle>Hapus Mata Pelajaran</DialogTitle><DialogDescription>Yakin ingin menghapus mata pelajaran {nama}? Tindakan ini tidak dapat dibatalkan.</DialogDescription></DialogHeader><DialogFooter><DialogClose render={<Button type="button" variant="outline">Batal</Button>} /><Button type="button" variant="destructive" onClick={handleConfirm}>Hapus Pelajaran</Button></DialogFooter></DialogContent>
    </Dialog>;
}

const inputClassName = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none";
