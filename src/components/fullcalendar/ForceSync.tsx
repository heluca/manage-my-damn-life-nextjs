import React, { useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { fetchLatestEventsV2 } from '@/helpers/frontend/sync';
import { directFetchEventsFromServer } from '@/helpers/frontend/directFetch';
import { useTranslation } from 'next-i18next';
import { getCalDAVSummaryFromDexie } from '@/helpers/frontend/dexie/caldav_dexie';
import { isValidResultArray } from '@/helpers/general';
import { saveAPIEventReponseToDexie } from '@/helpers/frontend/dexie/events_dexie';

interface ForceSyncProps {
  onSyncComplete?: () => void;
}

export const ForceSync: React.FC<ForceSyncProps> = ({ onSyncComplete }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const { t } = useTranslation();

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      // First try the normal sync method
      await fetchLatestEventsV2(true);
      
      // Then try direct fetch as a backup
      const caldavAccounts = await getCalDAVSummaryFromDexie();
      if (isValidResultArray(caldavAccounts)) {
        for (const account of caldavAccounts) {
          if (isValidResultArray(account.calendars)) {
            for (const calendar of account.calendars) {
              console.log(`Direct fetching events for calendar: ${calendar.displayName}`);
              const events = await directFetchEventsFromServer(account.caldav_accounts_id, calendar.calendars_id);
              if (events) {
                await saveAPIEventReponseToDexie(calendar.calendars_id, events);
              }
            }
          }
        }
      }
      
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button 
      variant="outline-primary" 
      size="sm" 
      onClick={handleSync} 
      disabled={isSyncing}
      className="ms-2"
    >
      {isSyncing ? (
        <>
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
          />
          <span className="ms-1">{t('SYNCING')}</span>
        </>
      ) : (
        t('FORCE_SYNC')
      )}
    </Button>
  );
};