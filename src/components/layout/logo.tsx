"use client"

import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import logo from '@/assets/images/logo.png';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center space-x-4", className)}>
      <Image src={logo} alt="CBTIS 294 Logo" width={64} height={64} className="rounded-full" priority />
      <span className="font-bold text-2xl">CBTIS 294</span>
    </Link>
  );
}
