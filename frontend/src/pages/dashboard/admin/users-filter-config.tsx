import type { FilterConfig } from '@/components/filters/types';

export const adminUsersFilterConfig: FilterConfig = [
  {
    type: 'select',
    key: 'isActive',
    title: 'Account status',
    selectMode: 'single',
    list: [
      { value: 'true', label: 'Active' },
      { value: 'false', label: 'Inactive' },
    ],
  },
];
