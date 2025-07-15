import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import SettingsHelper from '@/helpers/frontend/classes/SettingsHelper';

export const SETTING_NAME_NAVBAR_LINKS = 'NAVBAR_CUSTOM_LINKS';

interface NavLink {
  name: string;
  url: string;
  enabled: boolean;
}

export const NavbarLinksSettings = () => {
  const { t } = useTranslation();
  const [links, setLinks] = useState<NavLink[]>([
    { name: '', url: '', enabled: false },
    { name: '', url: '', enabled: false },
    { name: '', url: '', enabled: false },
    { name: '', url: '', enabled: false },
    { name: '', url: '', enabled: false }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchNavbarLinks = async () => {
      try {
        const savedLinks = localStorage.getItem(SETTING_NAME_NAVBAR_LINKS);
        if (savedLinks) {
          const parsedLinks = JSON.parse(savedLinks);
          // Ensure we always have exactly 5 links
          const newLinks = [...links];
          parsedLinks.forEach((link: NavLink, index: number) => {
            if (index < 5) {
              newLinks[index] = link;
            }
          });
          setLinks(newLinks);
        }
      } catch (error) {
        console.error('Error fetching navbar links setting:', error);
      }
    };

    fetchNavbarLinks();
  }, []);

  const handleLinkChange = (index: number, field: keyof NavLink, value: string | boolean) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const linksString = JSON.stringify(links);
      const success = await SettingsHelper.setKey(SETTING_NAME_NAVBAR_LINKS, linksString);
      if (success) {
        localStorage.setItem(SETTING_NAME_NAVBAR_LINKS, linksString);
        toast.success(t('UPDATE_OK'));
        
        // Dispatch event to update navbar
        if (typeof window !== 'undefined') {
          const navbarUpdateEvent = new CustomEvent('navbarLinksUpdated', { 
            detail: { links } 
          });
          window.dispatchEvent(navbarUpdateEvent);
        }
      } else {
        toast.error(t('ERROR_GENERIC'));
      }
    } catch (error) {
      console.error('Error saving navbar links setting:', error);
      toast.error(t('ERROR_GENERIC'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Row>
        <Col xs={12}>
          <h5>{t('NAVBAR_CUSTOM_LINKS')}</h5>
          <p className="text-muted">{t('NAVBAR_CUSTOM_LINKS_DESC')}</p>
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>{t('ENABLED')}</th>
                <th>{t('NAME')}</th>
                <th>{t('URL')}</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link, index) => (
                <tr key={index}>
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={link.enabled}
                      onChange={(e) => handleLinkChange(index, 'enabled', e.target.checked)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      placeholder={t('LINK_NAME')}
                      value={link.name}
                      onChange={(e) => handleLinkChange(index, 'name', e.target.value)}
                      size="sm"
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      placeholder={t('LINK_URL')}
                      value={link.url}
                      onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                      size="sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
      <Row>
        <Col xs={12} className="text-end">
          <Button 
            variant="primary" 
            onClick={handleSave} 
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? t('SAVING') : t('SAVE')}
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default NavbarLinksSettings;