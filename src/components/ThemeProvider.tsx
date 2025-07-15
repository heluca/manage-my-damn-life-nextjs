import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getAuthenticationHeadersforUser } from '@/helpers/frontend/user';
import { useRouter } from 'next/router';

const BOOTSWATCH_THEMES = [
  'default',
  'cerulean',
  'cosmo',
  'cyborg',
  'darkly',
  'flatly',
  'journal',
  'litera',
  'lumen',
  'lux',
  'materia',
  'minty',
  'morph',
  'pulse',
  'quartz',
  'sandstone',
  'simplex',
  'sketchy',
  'slate',
  'solar',
  'spacelab',
  'superhero',
  'united',
  'vapor',
  'yeti',
  'zephyr'
];

// Store theme in localStorage to persist across page navigations
const THEME_STORAGE_KEY = 'mmdl-theme';

export function ThemeProvider({ children }) {
  const { data: session } = useSession();
  const [currentTheme, setCurrentTheme] = useState('default');
  const router = useRouter();

  // Check localStorage first, then fetch from API if needed
  useEffect(() => {
    const storedTheme = typeof window !== 'undefined' ? localStorage.getItem(THEME_STORAGE_KEY) : null;
    
    if (storedTheme) {
      setCurrentTheme(storedTheme);
    } else if (session?.user) {
      fetchUserTheme();
    }
  }, [session]);

  // Re-apply theme on route changes
  useEffect(() => {
    applyTheme(currentTheme);
  }, [router.asPath, currentTheme]);

  const fetchUserTheme = async () => {
    try {
      const authHeaders = await getAuthenticationHeadersforUser();
      const response = await fetch('/api/settings/get?name=theme', {
        headers: { 'authorization': authHeaders }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.value) {
          const theme = data.data.value;
          setCurrentTheme(theme);
          // Save to localStorage for persistence
          if (typeof window !== 'undefined') {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch theme:', error);
    }
  };

  const applyTheme = (theme) => {
    if (typeof document === 'undefined') return;
    
    const existingLink = document.getElementById('bootswatch-theme');
    if (existingLink) {
      existingLink.remove();
    }

    if (theme !== 'default') {
      const link = document.createElement('link');
      link.id = 'bootswatch-theme';
      link.rel = 'stylesheet';
      link.href = `https://cdn.jsdelivr.net/npm/bootswatch@5.3.3/dist/${theme}/bootstrap.min.css`;
      document.head.appendChild(link);
    }
  };

  return <>{children}</>;
}

export { BOOTSWATCH_THEMES };
