import type { ReactNode } from 'react';
import CopyToClipboard from '@/components/copy-to-clipboard';
import type { CustomColumn } from '@/components/table/types';
import { formatDate } from '@/lib/utils';
import type { AdminUser } from '@/types/domain';

export type AdminUsersTableRow = {
  fullName: string;
  email: ReactNode;
  phone: ReactNode;
  role: string;
  verification: string;
  status: string;
  joined: string;
  action: string;
  row: AdminUser;
};

const getVerificationStatus = (user: AdminUser): string => {
  if (user.role === 'LANDLORD') {
    return user.landlord?.verificationStatus ?? 'PENDING';
  }
  if (user.role === 'TENANT') {
    return user.tenant?.kycStatus ?? 'PENDING';
  }
  return 'N/A';
};

const formatBadgeLabel = (value: string): string => {
  return value.replace(/_/g, ' ');
};

const getAccountStatus = (user: AdminUser): string => {
  return user.isActive ? 'ACTIVE' : 'DEACTIVATED';
};

const getUsersConfig = () => {
  const usersColumns: CustomColumn<AdminUsersTableRow>[] = [
    {
      header: 'Full Name',
      accessor: 'fullName',
      type: 'string',
    },
    {
      header: 'Email',
      accessor: 'email',
      type: 'string',
    },
    {
      header: 'Phone Number',
      accessor: 'phone',
      type: 'string',
    },
    {
      header: 'Role',
      accessor: 'role',
      type: 'string',
    },
    {
      header: 'Verification',
      accessor: 'verification',
      type: 'badge',
    },
    {
      header: 'Status',
      accessor: 'status',
      type: 'badge',
    },
    {
      header: 'Joined',
      accessor: 'joined',
      type: 'string',
    },
    {
      header: '',
      accessor: 'action',
      type: 'actions',
      actions: ['kebab'],
    },
  ];

  const UsersHelper = (data?: AdminUser[]): AdminUsersTableRow[] =>
    data?.map((item) => ({
      fullName: `${item.firstName} ${item.lastName}`.trim(),
      email: <CopyToClipboard value={item.email || '-'} />,
      phone: <CopyToClipboard value={item.phone || '-'} />,
      role: item.role,
      verification: formatBadgeLabel(getVerificationStatus(item)),
      status: getAccountStatus(item),
      joined: formatDate(item.createdAt),
      action: '',
      row: item,
    })) ?? [];

  return { usersColumns, UsersHelper };
};

export { getUsersConfig, getVerificationStatus };
