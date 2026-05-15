import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import useAuthStore from '../src/store/authStore';
import { PageLoader } from '../src/components/common/Loader';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        if (user?.role === 'salon_owner') {
          router.replace('/(owner-tabs)/dashboard');
        } else {
          router.replace('/(tabs)');
        }
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [isLoading, isAuthenticated, user]);

  return <PageLoader />;
}
