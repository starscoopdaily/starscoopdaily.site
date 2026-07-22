'use client';
import { usePathname } from 'next/navigation';

export default function AdConditional({ children }) {
  const path = usePathname();
  if (path?.startsWith('/admin')) return null;
  return <>{children}</>;
}
