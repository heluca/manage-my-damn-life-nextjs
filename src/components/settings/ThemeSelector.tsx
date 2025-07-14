import { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { BOOTSWATCH_THEMES } from '../ThemeProvider';
import { getAuthenticationHeadersforUser } from '@/helpers/frontend/user';

export default function ThemeSelector() {
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCurrentTheme();
  }, []);

  const fetchCurrentTheme = async () => {
    try {
      const authHeaders = await getAuthenticationHeadersforUser();
      const response = await fetch('/api/settings/get?name=theme', {
        headers: { 'authorization': authHeaders }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.value) {
          setSelectedTheme(data.data.value);
        }
      }
    } catch (error) {
      console.error('Failed to fetch theme:', error);
    }
  };

  const handleThemeChange = async (theme: string) => {
    setLoading(true);
    try {
      const authHeaders = await getAuthenticationHeadersforUser();
      const response = await fetch('/api/settings/modify', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'authorization': authHeaders
        },
        body: JSON.stringify({ name: 'theme', value: theme })
      });

      if (response.ok) {
        setSelectedTheme(theme);
        applyTheme(theme);
      }
    } catch (error) {
      console.error('Failed to save theme:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (theme: string) => {
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

  return (
    <Form.Group className="mb-3">
      <Form.Label>Theme</Form.Label>
      <Form.Select
        value={selectedTheme}
        onChange={(e) => handleThemeChange(e.target.value)}
        disabled={loading}
      >
        {BOOTSWATCH_THEMES.map(theme => (
          <option key={theme} value={theme}>
            {theme.charAt(0).toUpperCase() + theme.slice(1)}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );
}