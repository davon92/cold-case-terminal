'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the terminal landing animation
    router.replace('/landing');
  }, [router]);

  return null;
}
