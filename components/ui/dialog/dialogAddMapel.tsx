"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog/dialog";

export type MapelFormValues = { nama: string };

interface DialogTambahMapelProps {
    onSubmit?: (values: MapelFormValues) => void | Promise<void>;
}

export function DialogTambahMapel({ onSubmit }: DialogTambahMapelProps) {
    const [open, setOpen] = useState(false);
    const [nama, setNama] = useState("");

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        try {
            await onSubmit?.({ nama: nama.trim() });
            setNama("");
            setOpen(false);
        } catch {
            // Pesan kegagalan ditampilkan oleh halaman pemanggil.
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button className="inline-flex items-center gap-2"><Plus className="size-4" />Tambah Pelajaran</Button>} />
            <DialogContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <DialogHeader>
                        <DialogTitle>Tambah Mata Pelajaran</DialogTitle>
                        <DialogDescription>Masukkan nama mata pelajaran baru.</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="nama-mapel" className="text-sm font-medium text-foreground">Pelajaran</label>
                        <input id="nama-mapel" required value={nama} onChange={(event) => setNama(event.target.value)} placeholder="Contoh: Matematika" className={inputClassName} />
                    </div>
                    <DialogFooter>
                        <DialogClose render={<Button type="button" variant="outline">Batal</Button>} />
                        <Button type="submit">Simpan Pelajaran</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

const inputClassName = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none";
