import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { DevControlPanel } from '../ui/DevControlPanel';

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface-muted print:block print:bg-white">
      <div className="contents print:hidden">
        <Sidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />
      </div>
      <div className="flex min-h-screen flex-1 flex-col lg:pl-0 print:block">
        <div className="contents print:hidden">
          <Topbar onMenuClick={() => setMobileNavOpen(true)} />
        </div>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 print:p-0">
          <Outlet />
        </main>
      </div>
      <div className="contents print:hidden">
        <DevControlPanel />
      </div>
    </div>
  );
}
