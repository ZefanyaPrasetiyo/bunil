"use client";

import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImportDataNilai } from "@/components/ui/importDataNilai";
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

type MapelOption = { id: string; nama: string };
type SiswaOption = { spmb: string; nama: string; jurusan: string };
const jurusanOptions = ["DKV", "RPL", "ANIMASI", "TKJ", "PSPT", "TE"];

export type NilaiSiswaFormValues = {
  spmb: string;
  nama: string;
  jurusan: string;
  nilai: Record<string, string>;
};

type StagedNilai = NilaiSiswaFormValues & { id: string };

interface DialogTambahNilaiSiswaProps {
  mapelList: MapelOption[];
  siswaList: SiswaOption[];
  onSubmit?: (values: NilaiSiswaFormValues[]) => void | Promise<void>;
}

export function DialogTambahNilaiSiswa({
  mapelList,
  siswaList,
  onSubmit,
}: DialogTambahNilaiSiswaProps) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<NilaiSiswaFormValues>(() =>
    createInitialValues(mapelList),
  );
  const [staging, setStaging] = useState<StagedNilai[]>([]);
  const [importMessage, setImportMessage] = useState("");

  function handleAddToStaging(event: React.FormEvent) {
    event.preventDefault();
    setStaging((current) => [
      ...current,
      { ...values, id: crypto.randomUUID() },
    ]);
    setValues(createInitialValues(mapelList));
  }

  function updateStaging(
    id: string,
    key: "spmb" | "nama" | "jurusan",
    value: string,
  ) {
    setStaging((current) =>
      current.map((item) =>
        item.id === id ? { ...item, [key]: value } : item,
      ),
    );
  }

  function selectSiswa(id: string, spmb: string) {
    const siswa = siswaList.find((item) => item.spmb === spmb);
    if (!siswa) return;
    setStaging((current) =>
      current.map((item) => (item.id === id ? { ...item, ...siswa } : item)),
    );
  }

  function updateStagedNilai(id: string, mapelId: string, value: string) {
    setStaging((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, nilai: { ...item.nilai, [mapelId]: value } }
          : item,
      ),
    );
  }

  function importNilai(valuesList: NilaiSiswaFormValues[]) {
    setStaging((current) => [
      ...current,
      ...valuesList.map((values) => ({ ...values, id: crypto.randomUUID() })),
    ]);
  }

  async function handleSaveAll() {
    try {
      await onSubmit?.(
        staging.map((item) => ({
          spmb: item.spmb,
          nama: item.nama,
          jurusan: item.jurusan,
          nilai: item.nilai,
        })),
      );
      setStaging([]);
      setValues(createInitialValues(mapelList));
      setImportMessage("");
      setOpen(false);
    } catch {
      // Pesan kegagalan ditampilkan oleh halaman pemanggil.
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setStaging([]);
      setValues(createInitialValues(mapelList));
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
            Tambah Nilai
          </Button>
        }
      />
      <DialogContent className="lg:max-w-[70vw]">
                <div className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>Tambah Nilai Siswa</DialogTitle>
            <DialogDescription>
              Tambahkan nilai ke staging terlebih dahulu. Mata pelajaran diambil
              dari data master mata pelajaran.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Template Excel
            </p>
            <ImportDataNilai
              mapelList={mapelList}
              siswaList={siswaList}
              existingSpmbs={staging.map((item) => item.spmb)}
              onImport={importNilai}
              onMessage={setImportMessage}
            />
          </div>
          {importMessage && (
            <p className="text-sm text-muted-foreground" role="status">
              {importMessage}
            </p>
          )}

          <form onSubmit={handleAddToStaging} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Siswa" htmlFor="spmb">
                <select
                  id="spmb"
                  required
                  value={values.spmb}
                  onChange={(event) => {
                    const siswa = siswaList.find(
                      (item) => item.spmb === event.target.value,
                    );
                    if (siswa)
                      setValues((current) => ({ ...current, ...siswa }));
                  }}
                  className={inputClassName}
                >
                  <option value="" disabled>
                    Pilih NO SPMB — Nama siswa
                  </option>
                  {siswaList.map((siswa) => (
                    <option key={siswa.spmb} value={siswa.spmb}>
                      {siswa.spmb} — {siswa.nama}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Jurusan" htmlFor="jurusan">
                <select
                  id="jurusan"
                  required
                  value={values.jurusan}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      jurusan: event.target.value,
                    }))
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
            </div>
            <NilaiFields
              mapelList={mapelList}
              nilai={values.nilai}
              onChange={(mapelId, value) =>
                setValues((current) => ({
                  ...current,
                  nilai: { ...current.nilai, [mapelId]: value },
                }))
              }
              idPrefix="nilai"
            />
            <div>
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
            <table className="w-full min-w-[900px] text-left text-sm">
                            <thead className="sticky top-0 z-10 border-b border-border bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="p-3 font-medium">Siswa</th>
                  <th className="p-3 font-medium">Jurusan</th>
                  {mapelList.map((mapel) => (
                    <th key={mapel.id} className="p-3 font-medium">
                      {mapel.nama}
                    </th>
                  ))}
                  <th className="w-20 p-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {staging.length === 0 ? (
                  <tr>
                    <td
                      colSpan={mapelList.length + 3}
                      className="p-6 text-center text-muted-foreground"
                    >
                      Belum ada nilai pada staging.
                    </td>
                  </tr>
                ) : (
                  staging.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="p-2">
                        <select
                          aria-label={`Siswa ${item.nama}`}
                          value={item.spmb}
                          onChange={(event) =>
                            selectSiswa(item.id, event.target.value)
                          }
                          className={tableInputClassName}
                        >
                          {siswaList.map((siswa) => (
                            <option key={siswa.spmb} value={siswa.spmb}>
                              {siswa.spmb} — {siswa.nama}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <select
                          aria-label={`Jurusan ${item.nama}`}
                          value={item.jurusan}
                          onChange={(event) =>
                            updateStaging(
                              item.id,
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
                      {mapelList.map((mapel) => (
                        <td key={mapel.id} className="p-2">
                          <input
                            aria-label={`Nilai ${mapel.nama} ${item.nama}`}
                            type="number"
                            min="0"
                            max="100"
                            value={item.nilai[mapel.id] ?? ""}
                            onChange={(event) =>
                              updateStagedNilai(
                                item.id,
                                mapel.id,
                                event.target.value,
                              )
                            }
                            className={tableInputClassName}
                          />
                        </td>
                      ))}
                      <td className="p-2">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-sm"
                          aria-label={`Hapus nilai ${item.nama} dari staging`}
                          onClick={() =>
                            setStaging((current) =>
                              current.filter((staged) => staged.id !== item.id),
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
            disabled={staging.length === 0}
            className="inline-flex items-center gap-2"
          >
            <Save className="size-4" />
            Simpan Semua
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NilaiFields({
  mapelList,
  nilai,
  onChange,
  idPrefix,
}: {
  mapelList: MapelOption[];
  nilai: Record<string, string>;
  onChange: (mapelId: string, value: string) => void;
  idPrefix: string;
}) {
  return (
    <fieldset className="rounded-lg border border-border p-4">
      <legend className="px-1 text-sm font-medium text-foreground">
        Nilai Mata Pelajaran
      </legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {mapelList.map((mapel) => (
          <Field
            key={mapel.id}
            label={mapel.nama}
            htmlFor={`${idPrefix}-${mapel.id}`}
            compact
          >
            <input
              id={`${idPrefix}-${mapel.id}`}
              type="number"
              min="0"
              max="100"
              value={nilai[mapel.id] ?? ""}
              onChange={(event) => onChange(mapel.id, event.target.value)}
              className={inputClassName}
            />
          </Field>
        ))}
      </div>
    </fieldset>
  );
}

const inputClassName =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none";
const tableInputClassName =
  "w-full min-w-20 rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none";

function createInitialValues(mapelList: MapelOption[]): NilaiSiswaFormValues {
  return {
    spmb: "",
    nama: "",
    jurusan: "",
    nilai: Object.fromEntries(mapelList.map((mapel) => [mapel.id, ""])),
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
