import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/navbar';

const DashboardLayout = () => {
  return (
    <div>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
