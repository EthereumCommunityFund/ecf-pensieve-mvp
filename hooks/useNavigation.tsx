'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { devLog } from '@/utils/devLog';

export const useNavigationContext = () => useContext(NavigationContext);

const useNavigation = () => {
  const pathname = usePathname();
  const router = useRouter();

  const [currentRoute, setCurrentRoute] = useState<string | null>(null);
  const [previousRoute, setPreviousRoute] = useState<string | null>(null);
  const [clientSearchParams, setClientSearchParams] =
    useState<URLSearchParams | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setClientSearchParams(new URLSearchParams(window.location.search));
    }
  }, []);

  useEffect(() => {
    const effectiveSearchParams = clientSearchParams || new URLSearchParams('');
    const url = `${pathname}?${effectiveSearchParams.toString()}`;
    setPreviousRoute(currentRoute);
    setCurrentRoute(url);
  }, [pathname, clientSearchParams, currentRoute]);

  const onRouterBack = useCallback(() => {
    if (previousRoute) {
      router.back();
    } else {
      router.push('/');
    }
  }, [previousRoute, router]);

  useEffect(() => {
    devLog('previousRoute', previousRoute);
  }, [previousRoute]);

  return { previousRoute: previousRoute || '/', onRouterBack };
};

const NavigationContext = createContext<ReturnType<typeof useNavigation>>({
  previousRoute: '/',
  onRouterBack: () => {},
});

export const NavigationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const navigation = useNavigation();

  return (
    <NavigationContext.Provider value={navigation}>
      {children}
    </NavigationContext.Provider>
  );
};
