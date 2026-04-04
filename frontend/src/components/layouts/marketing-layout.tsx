import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/navbar';

export default function MarketingLayout() {
  return (
    <div>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
