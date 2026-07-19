"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  BookOpenCheck,
  Eye,
  EyeOff,
  Lock,
  UserRound,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false)
  const [nama, setNama] = useState("")
  const [noSpmb, setNoSpmb] = useState("")
  const router = useRouter()
const [loading, setLoading] = useState(false);

const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);

  try {
    console.log("Login:", {
      username: nama,
      password: noSpmb,
    });

    const { data, error } = await authClient.signIn.username({
      username: nama,
      password: noSpmb,
    });

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if (error) {
      alert(error.message);
      return;
    }

    const role =
      (data as { user?: { role?: string }; session?: { user?: { role?: string } } } | undefined)
        ?.user?.role ??
      (data as { user?: { role?: string }; session?: { user?: { role?: string } } } | undefined)
        ?.session?.user?.role ??
      "USER";

    console.log("LOGIN BERHASIL", { role });

    toast.success("Login berhasil");

    router.replace(role === "ADMIN" ? "/dashboard" : "/dashboard/nilai-saya");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-foreground/70 transition-colors hover:text-primary dark:hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke beranda
      </Link>

      <Card className="border-border/60 shadow-xl shadow-primary/5">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-accent/10 dark:text-accent">
            <BookOpenCheck className="h-6 w-6" />
          </div>
          <CardTitle className="font-heading text-2xl font-bold tracking-tight">
            Masuk ke Akun Anda
          </CardTitle>
          <CardDescription>
            Masukkan akun Anda untuk masuk ke aplikasi
          </CardDescription>
        </CardHeader>

        <CardContent>
         <form onSubmit={handleLogin}>
            <FieldGroup className="gap-5">
              <Field>
                <FieldLabel htmlFor="username">Nama Pengguna</FieldLabel>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                 <Input
  id="username"
  type="text"
  placeholder="Username"
  required
  className="pl-9"
  value={nama}
  onChange={(e) => setNama(e.target.value)}
/>
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Kata Sandi</FieldLabel>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
               <Input
  id="no_spmb"
  type="text"
  placeholder="No. SPMB"
  required
  className="pl-9"
  value={noSpmb}
  onChange={(e) => setNoSpmb(e.target.value)}
/>
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 transition-colors hover:text-foreground/70"
                    aria-label={
                      showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </Field>

              <Field>
            <Button type="submit" disabled={loading}>
  {loading ? "Loading..." : "Login"}
</Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}