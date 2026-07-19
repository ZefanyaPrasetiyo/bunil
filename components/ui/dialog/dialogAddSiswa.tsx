"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImportDataSiswa } from "@/components/ui/importDataSiswa";
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
  password?: string;
};

type StagedSiswa = SiswaFormValues & { id: string };

interface DialogTambahSiswaProps {
  onSubmit?: (values: Array<SiswaFormValues & { role: "USER" }>) => void | Promise<void>;
}

export function DialogTambahSiswa({ onSubmit }: DialogTambahSiswaProps) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<SiswaFormValues>(createInitialValues);
  const [stagedSiswa, setStagedSiswa] = useState<StagedSiswa[]>([]);
  const [importMessage, setImportMessage] = useState("");

  function handleChange(key: keyof SiswaFormValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleAddToStaging(event: React.FormEvent) {
    event.preventDefault();
    setStagedSiswa((current) => [
      ...current,
      { id: crypto.randomUUID(), ...values },
    ]);
    setValues(createInitialValues());
  }

  function updateStagedSiswa(
    id: string,
    key: keyof SiswaFormValues,
    value: string,
  ) {
    setStagedSiswa((current) =>
      current.map((siswa) =>
        siswa.id === id ? { ...siswa, [key]: value } : siswa,
      ),
    );
  }

  function importSiswa(valuesList: SiswaFormValues[]) {
    setStagedSiswa((current) => [
      ...current,
      ...valuesList.map((siswa) => ({ id: crypto.randomUUID(), ...siswa })),
    ]);
  }

  async function handleSaveAll() {
    try {
      await onSubmit?.(
        stagedSiswa.map((siswa) => ({
          spmb: siswa.spmb,
          nama: siswa.nama,
          jurusan: siswa.jurusan,
          // Password akun siswa selalu menggunakan nomor SPMB.
          password: siswa.spmb,
          role: "USER" as const,
        })),
      );
      setStagedSiswa([]);
      setValues(createInitialValues());
      setOpen(false);
    } catch {
      // Pesan kegagalan ditampilkan oleh halaman pemanggil.
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setValues(createInitialValues());
      setStagedSiswa([]);
      setImportMessage("");
    }
    setOpen(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button className="inline-flex items-center gap-2">
            <Plus className="size-4" />
            Tambah Siswa
          </Button>
        }
      />

      <DialogContent className="sm:max-w-6xl xl:max-w-7xl">
        <div className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>Tambah Akun Siswa</DialogTitle>
            <DialogDescription>
              Tambahkan data ke staging terlebih dahulu. Data baru dibuat
              setelah tombol Simpan Semua dipilih.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Template Excel: NO SPMB, Nama, Jurusan. Password otomatis menggunakan NO SPMB.
            </p>
            <ImportDataSiswa
              existingSpmbs={stagedSiswa.map((siswa) => siswa.spmb)}
              onImport={importSiswa}
              onMessage={setImportMessage}
            />
          </div>
          {importMessage && (
            <p className="text-sm text-muted-foreground" role="status">
              {importMessage}
            </p>
          )}

          <form
            onSubmit={handleAddToStaging}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
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
                onChange={(event) =>
                  handleChange("jurusan", event.target.value)
                }
                className={inputClassName}
              >
                <option value="" disabled>
                  Pilih jurusan
                </option>
                {jurusanOptions.map((jurusan) => (
                  <option key={jurusan} value={jurusan}>
                    {jurusan}
                  </option>
                ))}
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
            <Field
              label="Password"
              htmlFor="password"
              className="sm:col-span-2"
            >
              <p className="rounded-lg border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                Password otomatis menggunakan nomor SPMB.
              </p>
            </Field>
            <div className="sm:col-span-2">
              <Button
                type="submit"
                variant="outline"
                className="inline-flex items-center gap-2"
              >
                <Plus className="size-4" />
                Tambah ke Staging
              </Button>
            </div>
          </form>

          <div className="min-h-96 overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-border bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="p-3 font-medium">NO SPMB</th>
                  <th className="p-3 font-medium">Nama</th>
                  <th className="p-3 font-medium">Jurusan</th>
                  <th className="w-24 p-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {stagedSiswa.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-6 text-center text-muted-foreground"
                    >
                      Belum ada data pada staging.
                    </td>
                  </tr>
                ) : (
                  stagedSiswa.map((siswa) => (
                    <tr
                      key={siswa.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="p-2">
                        <input
                          aria-label={`NO SPMB ${siswa.nama}`}
                          value={siswa.spmb}
                          onChange={(event) =>
                            updateStagedSiswa(
                              siswa.id,
                              "spmb",
                              event.target.value,
                            )
                          }
                          className={tableInputClassName}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          aria-label={`Nama ${siswa.spmb}`}
                          value={siswa.nama}
                          onChange={(event) =>
                            updateStagedSiswa(
                              siswa.id,
                              "nama",
                              event.target.value,
                            )
                          }
                          className={tableInputClassName}
                        />
                      </td>
                      <td className="p-2">
                        <select
                          aria-label={`Jurusan ${siswa.nama}`}
                          value={siswa.jurusan}
                          onChange={(event) =>
                            updateStagedSiswa(
                              siswa.id,
                              "jurusan",
                              event.target.value,
                            )
                          }
                          className={tableInputClassName}
                        >
                          {jurusanOptions.map((jurusan) => (
                            <option key={jurusan} value={jurusan}>
                              {jurusan}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-sm"
                          aria-label={`Hapus ${siswa.nama} dari staging`}
                          onClick={() =>
                            setStagedSiswa((current) =>
                              current.filter((item) => item.id !== siswa.id),
                            )
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter>
          <DialogClose
            render={
              <Button type="button" variant="outline">
                Batal
              </Button>
            }
          />
          <Button
            type="button"
            onClick={handleSaveAll}
            disabled={stagedSiswa.length === 0}
            className="inline-flex items-center gap-2"
          >
            <Pencil className="size-4" />
            Simpan Semua
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const inputClassName =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none";
const tableInputClassName =
  "w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none";

function createInitialValues(): SiswaFormValues {
  return { spmb: "", nama: "", jurusan: "", password: "" };
}

function Field({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
