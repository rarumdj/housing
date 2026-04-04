import type { RouteObject } from 'react-router-dom';
import type { UserRole } from '@/types/domain';

export type RouteHandle = {
  roles?: UserRole[];
};

export type AppRouteObject = RouteObject & {
  handle?: RouteHandle;
  children?: AppRouteObject[];
};
