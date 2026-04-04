import type { AppRouteObject } from './types';
import { publicKeys } from './keys';
import LandingPage from '@/pages/landing';
import SearchPage from '@/pages/search';
import PropertyDetailPage from '@/pages/properties/detail';
import NotFoundPage from '@/pages/error/not-found-page';

export const publicRoutes: AppRouteObject[] = [
  {
    path: publicKeys.home.path,
    element: <LandingPage />,
  },
  {
    path: publicKeys.search.path,
    element: <SearchPage />,
  },
  {
    path: publicKeys.property.paramPath,
    element: <PropertyDetailPage />,
  },
  {
    path: publicKeys.notFound.path,
    element: <NotFoundPage />,
  },
];
