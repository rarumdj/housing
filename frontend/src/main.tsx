import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ReactQueryProvider } from '@/components/providers/react-query-provider';
import AuthProvider from '@/hooks/auth/auth-context';
import { router } from './app-router';
import 'react-day-picker/style.css';
import 'react-phone-number-input/style.css';
import './styles/index.css';
import { Toaster } from 'sonner';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <ReactQueryProvider>
        <RouterProvider router={router} />
      </ReactQueryProvider>
      <Toaster richColors position="top-center" />
    </AuthProvider>
  </StrictMode>
);
