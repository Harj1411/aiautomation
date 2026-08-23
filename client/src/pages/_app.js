import { useEffect } from 'react';
import '../styles/globals.css';
import { useAuthStore } from '../store/authStore';

export default function App({ Component, pageProps }) {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return <Component {...pageProps} />;
}
