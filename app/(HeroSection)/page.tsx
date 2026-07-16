import React from "react";
import Button from "@/components/ui/buttonHero";
import Link from "next/link";

const Hero: React.FC = () => (
  <section className="relative z-10 flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center px-4 text-center">
    <div className="max-w-4xl mx-auto">
      <span className="inline-block rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary dark:text-accent">
        Penilaian Siswa
      </span>
      <h1 className="mt-2 text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground">
        Aplikasi Penilaian Siswa <br className="hidden sm:block" />
        <span className="text-primary dark:text-accent">Dengan Terstruktur</span>
      </h1>
      <p className="mt-6 max-w-2xl mx-auto text-lg text-foreground/70">
        Aplikasi penilaian siswa yang dirancang untuk memudahkan guru dalam
        memberikan penilaian secara efisien dan terstruktur
      </p>
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button 
          variant="secondary" className="w-full sm:w-auto">
           <Link href="/login">Mulai Sekarang</Link>
        </Button>
      </div>
    </div>
  </section>
);

export default Hero;