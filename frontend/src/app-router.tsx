import { createBrowserRouter } from 'react-router-dom';
import { appRoutes } from '@/routes';

export type { AppRouteObject, RouteHandle } from '@/routes/types';

export const router = createBrowserRouter(appRoutes);
