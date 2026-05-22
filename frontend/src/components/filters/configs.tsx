import type { FilterConfig } from './types';

export const StatusType: FilterConfig = [
  {
    type: 'text',
    key: 'name',
    title: 'Name',
    placeholder: 'Enter name',
  },
  {
    type: 'date',
    key: 'dateCompleted',
    title: 'Date completed',
    dateMode: 'range', // Can be "single" or "range"
    defaultDatePreset: '7days', // Defaults to 7 days
    datePresets: [
      { value: '7days', label: 'Last 7 days' },
      { value: '30days', label: 'Last 30 days' },
      { value: '6months', label: 'Last 6 months' },
      { value: '1year', label: 'Last year' },
    ],
  },
  {
    type: 'select',
    key: 'status',
    title: 'Status',
    selectMode: 'single', // Can be "single" or "multiple"
    list: [
      {
        value: 'pending',
        label: 'Pending',
      },
      {
        value: 'completed',
        label: 'Completed',
      },
      {
        value: 'cancelled',
        label: 'Cancelled',
      },
    ],
  },
  {
    type: 'select',
    key: 'tags',
    title: 'Tags',
    selectMode: 'multiple', // Multiple selection with OptionPicker
    list: [
      {
        value: 'urgent',
        label: 'Urgent',
      },
      {
        value: 'normal',
        label: 'Normal',
      },
      {
        value: 'low',
        label: 'Low Priority',
      },
    ],
  },
  {
    type: 'multiselect',
    key: 'categories',
    title: 'Categories',
    comboboxMode: 'multiple', // Can be "single" or "multiple"
    list: [
      {
        value: 'urgent',
        label: 'Urgent',
      },
      {
        value: 'normal',
        label: 'Normal',
      },
      {
        value: 'low',
        label: 'Low Priority',
      },
    ],
  },
  {
    type: 'multiselect',
    key: 'assignee',
    title: 'Assignee',
    comboboxMode: 'single', // Single selection with Combobox
    list: [
      {
        value: 'john',
        label: 'John Doe',
      },
      {
        value: 'jane',
        label: 'Jane Smith',
      },
      {
        value: 'bob',
        label: 'Bob Johnson',
      },
    ],
  },
];
