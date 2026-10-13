import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { LoadingSpinner } from '../src/components/ui/LoadingSpinner';

export default function Index() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace('/onboarding');
      return;
    }

    const role = (user.role || '').toUpperCase();
    switch (role) {
      case 'SELLER':
        router.replace('/(seller)/dashboard');
        break;
      case 'COLLECTOR':
        router.replace('/(collector)/dashboard');
        break;
      case 'BUYER':
        router.replace('/(buyer)/dashboard');
        break;
      case 'RECYCLER':
        router.replace('/(recycler)/dashboard');
        break;
      case 'ADMIN':
        router.replace('/(admin)/dashboard');
        break;
      default:
        router.replace('/select-role');
        break;
    }
  }, [isLoading, isAuthenticated, user]);

  return <LoadingSpinner message="Loading ScrapSetu..." />;
}

