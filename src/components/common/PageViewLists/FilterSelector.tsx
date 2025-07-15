import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { useTranslation } from 'next-i18next';
import { PAGE_VIEW_JSON, PAGE_VIEW_NAME_ALL_TASKS, PAGE_VIEW_NAME_DUE_NEXT_SEVEN, PAGE_VIEW_NAME_DUE_TODAY, PAGE_VIEW_NAME_HAVE_STARTED, PAGE_VIEW_NAME_HIGH_PRIORITY, PAGE_VIEW_NAME_MY_DAY } from '@/helpers/viewHelpers/pages';
import { useSetAtom } from 'jotai';
import { calDavObjectAtom, currentPageTitleAtom, filterAtom } from 'stateStore/ViewStore';

interface FilterSelectorProps {
  postClick: Function;
  variant?: 'dropdown' | 'radio';
}

export const FilterSelector: React.FC<FilterSelectorProps> = ({ postClick, variant = 'dropdown' }) => {
  const { t } = useTranslation();
  const setCurrentPageTitle = useSetAtom(currentPageTitleAtom);
  const setFilterAtom = useSetAtom(filterAtom);
  const setCalDavAtom = useSetAtom(calDavObjectAtom);
  const [selectedFilter, setSelectedFilter] = useState(PAGE_VIEW_NAME_MY_DAY);
  
  const filterOptions = [
    { id: PAGE_VIEW_NAME_MY_DAY, label: t('MY_DAY') },
    { id: PAGE_VIEW_NAME_DUE_TODAY, label: t('DUE_TODAY') },
    { id: PAGE_VIEW_NAME_DUE_NEXT_SEVEN, label: t('DUE_NEXT_SEVEN_DAYS') },
    { id: PAGE_VIEW_NAME_HIGH_PRIORITY, label: t('HIGH_PRIORITY') },
    { id: PAGE_VIEW_NAME_HAVE_STARTED, label: t('HAVE_STARTED') },
    { id: PAGE_VIEW_NAME_ALL_TASKS, label: t('ALL_TASKS') }
  ];

  const handleFilterChange = (pageName: string) => {
    setSelectedFilter(pageName);
    setCurrentPageTitle(t(pageName).toString());
    setFilterAtom(PAGE_VIEW_JSON[pageName]);
    setCalDavAtom({ caldav_accounts_id: null, calendars_id: null });
    postClick();
  };

  if (variant === 'radio') {
    return (
      <Form className="filter-selector-radio">
        {filterOptions.map((option) => (
          <Form.Check
            key={option.id}
            type="radio"
            id={`filter-radio-${option.id}`}
            name="filterRadioGroup"
            label={option.label}
            checked={selectedFilter === option.id}
            onChange={() => handleFilterChange(option.id)}
            className="mb-2 text-primary"
          />
        ))}
      </Form>
    );
  }

  return (
    <Form.Select 
      value={selectedFilter}
      onChange={(e) => handleFilterChange(e.target.value)}
      className="filter-selector-dropdown mb-3"
      aria-label="Filter selector"
      style={{ backgroundColor: 'var(--bs-primary)', color: 'var(--bs-primary-bg-subtle)', borderColor: 'var(--bs-primary)' }}
    >
      {filterOptions.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </Form.Select>
  );
};