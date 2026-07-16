"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, BookOpenCheck, Sun, Moon } from "lucide-react";
import Button from "@/components/ui/buttonHero";
import { Switch } from "@/components/ui/switch";

interface MobileMenuProps {
  isOpen: boolean;
}

const getInitialIsDark = () => {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem("theme");
  if (stored) return stored === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(getInitialIsDark);

  // Effect only synchronizes React state -> DOM, it never calls setState here.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggleTheme = (checked: boolean) => {
    setIsDark(checked);
    localStorage.setItem("theme", checked ? "dark" : "light");
  };

  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5">
      {isDark ? (
        <Moon className="h-4 w-4 text-foreground/70" />
      ) : (
        <Sun className="h-4 w-4 text-foreground/70" />
      )}
      <span className="text-sm font-medium text-foreground/70">
        {isDark ? "Mode Gelap" : "Mode Terang"}
      </span>
      <Switch checked={isDark} onCheckedChange={toggleTheme} />
    </div>
  );
};

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen }) => (
  <div
    id="mobile-menu"
    className={`
      md:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-sm border-t border-border shadow-lg
      transition-all duration-300 ease-in-out
      ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}
  `}
  >
    <div className="flex flex-col gap-3 border-t border-border px-5 pt-4 pb-4">
      <ThemeToggle />
      <Button variant="outline" className="w-full" >
        <Link href="/login">Masuk</Link>
      </Button>
    </div>
  </div>
);

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="shrink-0 flex items-center gap-2">
            <BookOpenCheck className="w-6 h-6 text-primary" strokeWidth={2} />
            <span className="font-heading text-xl font-bold text-foreground">
              Nilai
            </span>
          </div>

          <div className="hidden md:flex">
            <ThemeToggle />
          </div>

          <div className="hidden md:block">
            <Button variant="outline">
              <Link href="/login">Masuk</Link>
            </Button>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-foreground/70 hover:bg-card hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              <span className="sr-only">Buka menu utama</span>
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      <MobileMenu isOpen={isMenuOpen} />
    </header>
  );
};

export default Navbar;