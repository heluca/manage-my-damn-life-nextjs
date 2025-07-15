import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import SettingsHelper from '@/helpers/frontend/classes/SettingsHelper';
import { SETTING_NAME_CUSTOM_LOGO } from '@/helpers/frontend/settings';



export const LogoSettings = () => {
  const { t } = useTranslation();
  const [logoUrl, setLogoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLogoSetting = async () => {
      try {
        const savedLogo = localStorage.getItem(SETTING_NAME_CUSTOM_LOGO) || '';
        setLogoUrl(savedLogo);
      } catch (error) {
        console.error('Error fetching logo setting:', error);
      }
    };

    fetchLogoSetting();
  }, []);

  const handleLogoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoUrl(e.target.value);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const success = await SettingsHelper.setKey(SETTING_NAME_CUSTOM_LOGO, logoUrl);
      if (success) {
        localStorage.setItem(SETTING_NAME_CUSTOM_LOGO, logoUrl);
        toast.success(t('UPDATE_OK'));
      } else {
        toast.error(t('ERROR_GENERIC'));
      }
    } catch (error) {
      console.error('Error saving logo setting:', error);
      toast.error(t('ERROR_GENERIC'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    try {
      const success = await SettingsHelper.setKey(SETTING_NAME_CUSTOM_LOGO, '');
      if (success) {
        localStorage.removeItem(SETTING_NAME_CUSTOM_LOGO);
        setLogoUrl('');
        toast.success(t('UPDATE_OK'));
      } else {
        toast.error(t('ERROR_GENERIC'));
      }
    } catch (error) {
      console.error('Error resetting logo setting:', error);
      toast.error(t('ERROR_GENERIC'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Row style={{ display: 'flex', alignItems: 'center' }}>
      <Col xs={3}>
        {t('CUSTOM_LOGO')}
      </Col>
      <Col xs={7}>
        <Form.Control
          type="text"
          placeholder={t('ENTER_LOGO_URL')}
          value={logoUrl}
          onChange={handleLogoUrlChange}
        />
        <Form.Text className="text-muted">
          {t('LOGO_URL_HINT')}
        </Form.Text>
      </Col>
      <Col xs={2}>
        <Button 
          variant="primary" 
          onClick={handleSave} 
          disabled={isLoading}
          size="sm"
          className="me-2"
        >
          {isLoading ? t('SAVING') : t('SAVE')}
        </Button>
        <Button 
          variant="outline-secondary" 
          onClick={handleReset} 
          disabled={isLoading}
          size="sm"
        >
          {t('RESET')}
        </Button>
      </Col>
    </Row>
  );
};

export default LogoSettings;