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

type MapelOption = { id: string; nama: string };
const jurusanOptions = ["DKV", "RPL", "ANIMASI", "TKJ", "PSPT", "TE"];

export type NilaiSiswaUpdate = {
  spmb: string;
  nama: string;
  jurusan: string;
  nilai: Record<string, number | null>;
};

type NilaiSiswaEditable = Omit<NilaiSiswaUpdate, "nilai"> & {
  id: string;
  nilai: Record<string, number | null | undefined>;
};

interface DialogEditNilaiSiswaProps {
  row: NilaiSiswaEditable;
  mapelList: MapelOption[];
  onSubmit?: (values: NilaiSiswaUpdate) => void | Promise<void>;
}

export function DialogEditNilaiSiswa({
  row,
  mapelList,
  onSubmit,
}: DialogEditNilaiSiswaProps) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<NilaiSiswaUpdate>(() =>
    createValues(row),
  );

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) setValues(createValues(row));
    setOpen(nextOpen);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    try {
      await onSubmit?.(values);
      setOpen(false);
    } catch {
      // Pesan kegagalan ditampilkan oleh halaman pemanggil.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={`Edit nilai ${row.nama}`}
          >
            <Pencil className="size-4 text-primary" />
          </Button>
        }
      />

      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>Edit Nilai Siswa</DialogTitle>
            <DialogDescription>
              Perbarui data dan nilai untuk {row.nama}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="No. SPMB" htmlFor={`edit-spmb-${row.id}`}>
              <input
                id={`edit-spmb-${row.id}`}
                required
                value={values.spmb}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    spmb: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>

            <Field
              label="Nama"
              htmlFor={`edit-nama-${row.id}`}
              className="sm:col-span-2"
            >
              <input
                id={`edit-nama-${row.id}`}
                required
                value={values.nama}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    nama: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>

            <Field label="Jurusan" htmlFor={`edit-jurusan-${row.id}`}>
              <select
                id={`edit-jurusan-${row.id}`}
                required
                value={values.jurusan}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    jurusan: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {jurusanOptions.map((jurusan) => (
                  <option key={jurusan} value={jurusan}>
                    {jurusan}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <fieldset className="rounded-lg border border-border p-4">
            <legend className="px-1 text-sm font-medium text-foreground">
              Nilai Mata Pelajaran
            </legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {mapelList.map((mapel) => (
                <Field
                  key={mapel.id}
                  label={mapel.nama}
                  htmlFor={`edit-nilai-${row.id}-${mapel.id}`}
                  compact
                >
                  <input
                    id={`edit-nilai-${row.id}-${mapel.id}`}
                    type="number"
                    min="0"
                    max="100"
                    value={values.nilai[mapel.id] ?? ""}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        nilai: {
                          ...current.nilai,
                          [mapel.id]:
                            event.target.value === ""
                              ? null
                              : Number(event.target.value),
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </Field>
              ))}
            </div>
          </fieldset>

          <DialogFooter>
            <DialogClose
              render={
                <Button type="button" variant="outline">
                  Batal
                </Button>
              }
            />
            <Button type="submit">Simpan Perubahan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DialogHapusNilaiSiswaProps {
  nama: string;
  onConfirm?: () => void | Promise<void>;
}

export function DialogHapusNilaiSiswa({
  nama,
  onConfirm,
}: DialogHapusNilaiSiswaProps) {
  const [open, setOpen] = useState(false);

  async function handleConfirm() {
    try {
      await onConfirm?.();
      setOpen(false);
    } catch {
      // Pesan kegagalan ditampilkan oleh halaman pemanggil.
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="destructive"
            size="icon-sm"
            aria-label={`Hapus nilai ${nama}`}
          >
            <Trash2 className="size-4" />
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus Nilai Siswa</DialogTitle>
          <DialogDescription>
            Yakin ingin menghapus seluruh data nilai {nama}? Tindakan ini tidak
            dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose
            render={
              <Button type="button" variant="outline">
                Batal
              </Button>
            }
          />
          <Button type="button" variant="destructive" onClick={handleConfirm}>
            Hapus Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function createValues(row: NilaiSiswaEditable): NilaiSiswaUpdate {
  const nilai = Object.entries(row.nilai).reduce<Record<string, number | null>>(
    (current, [mapelId, value]) => {
      current[mapelId] = value ?? null;
      return current;
    },
    {},
  );

  return {
    spmb: row.spmb,
    nama: row.nama,
    jurusan: row.jurusan,
    nilai,
  };
}

function Field({
  label,
  htmlFor,
  children,
  className,
  compact = false,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label
        htmlFor={htmlFor}
        className={
          compact
            ? "truncate text-xs font-medium text-foreground"
            : "text-sm font-medium text-foreground"
        }
      >
        {label}
      </label>
      {children}
    </div>
  );
}
