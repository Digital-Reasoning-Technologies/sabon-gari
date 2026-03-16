"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LogoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function logout() {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        if (!cancelled) {
          toast({
            variant: 'success',
            title: 'Logged out successfully',
            description: 'You have been logged out of your account.',
          });
        }
      } catch (error) {
        console.error('Logout error:', error);
        if (!cancelled) {
          toast({
            variant: 'destructive',
            title: 'Logout error',
            description: 'An error occurred while logging out.',
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoggingOut(false);
          // Small delay to show toast before redirect
          setTimeout(() => {
            router.replace('/login?logout=success');
          }, 500);
        }
      }
    }

    logout();

    return () => {
      cancelled = true;
    };
  }, [router, toast]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-700 mx-auto mb-4" />
        <p className="text-gray-600">Logging out...</p>
      </div>
    </div>
  );
}
