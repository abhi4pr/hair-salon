import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import useAuthStore from '../src/store/authStore';
import { PageLoader } from '../src/components/common/Loader';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [isLoading, isAuthenticated]);

  return <PageLoader />;
}
