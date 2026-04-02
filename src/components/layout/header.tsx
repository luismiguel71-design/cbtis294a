'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import { getCurrentUser, signOutUser } from '@/lib/firebase/auth';
import type { User } from 'firebase/auth';

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/carreras', label: 'Carreras' },
  { href: '/docentes', label: 'Docentes' },
  { href: '/admisiones', label: 'Alumnos y Admisiones' },
  { href: '/noticias', label: 'Noticias' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = getCurrentUser(setUser);
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOutUser();
    setUser(null);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-24 items-center gap-4">
        <div className="mr-4 hidden md:flex">
          <Logo />
        </div>
        
        <div className="md:hidden flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="mr-2"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          <Logo />
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'transition-colors hover:text-foreground/80',
                (pathname.startsWith(link.href) && link.href !== '/') || pathname === link.href ? 'text-foreground' : 'text-foreground/60'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/admin/eventos" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden md:flex")}>
                Noticias
              </Link>
              <Link href="/admin/horarios" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden md:flex")}>
                Horarios
              </Link>
              <Button onClick={handleLogout} variant="outline" size="sm">Salir</Button>
            </div>
          ) : (
            <Link href="/login" className={cn(buttonVariants({ size: "sm" }), "flex")}>
              Acceso Admin
            </Link>
          )}
          <Link href="/contacto" className={cn(buttonVariants({ size: "sm" }), "hidden sm:flex")}>
            Contacto
          </Link>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  'block rounded-md px-3 py-2 text-base font-medium',
                  (pathname.startsWith(link.href) && link.href !== '/') || pathname === link.href
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
            
            {user && (
              <>
                <div className="border-t my-2 pt-2">
                  <p className="px-3 text-xs font-semibold text-muted-foreground uppercase py-1">Admin</p>
                  <Link
                    href="/admin/eventos"
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-base font-medium text-primary hover:bg-accent"
                  >
                    Gestionar Noticias
                  </Link>
                  <Link
                    href="/admin/horarios"
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-base font-medium text-primary hover:bg-accent"
                  >
                    Generar Horarios
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
