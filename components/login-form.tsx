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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false)

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
          <form>
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
                  />
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Kata Sandi</FieldLabel>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="pl-9 pr-9"
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
                <Button variant="secondary" className="w-full" >
                  <Link href="/dashboard/">Masuk</Link>
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}