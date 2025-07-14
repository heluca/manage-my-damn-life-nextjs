import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getAuthenticationHeadersforUser } from '@/helpers/frontend/user';

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

export function ThemeProvider({ children }) {
  const { data: session } = useSession();
  const [currentTheme, setCurrentTheme] = useState('default');

  useEffect(() => {
    if (session?.user) {
      fetchUserTheme();
    }
  }, [session]);

  const fetchUserTheme = async () => {
    try {
      const authHeaders = await getAuthenticationHeadersforUser();
      const response = await fetch('/api/settings/get?name=theme', {
        headers: { 'authorization': authHeaders }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.value) {
          setCurrentTheme(data.data.value);
        }
      }
    } catch (error) {
      console.error('Failed to fetch theme:', error);
    }
  };

  useEffect(() => {
    const existingLink = document.getElementById('bootswatch-theme');
    if (existingLink) {
      existingLink.remove();
    }

    if (currentTheme !== 'default') {
      const link = document.createElement('link');
      link.id = 'bootswatch-theme';
      link.rel = 'stylesheet';
      link.href = `https://cdn.jsdelivr.net/npm/bootswatch@5.3.3/dist/${currentTheme}/bootstrap.min.css`;
      document.head.appendChild(link);
    }
  }, [currentTheme]);

  return <>{children}</>;
}

export { BOOTSWATCH_THEMES };