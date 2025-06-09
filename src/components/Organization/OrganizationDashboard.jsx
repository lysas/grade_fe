import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import OrganizationSidebar from './OrganizationSidebar';

const OrganizationDashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleSidebarStateChange = (event) => {
      setIsSidebarCollapsed(event.detail);
    };

    window.addEventListener('sidebarStateChange', handleSidebarStateChange);
    return () => {
      window.removeEventListener('sidebarStateChange', handleSidebarStateChange);
    };
  }, []);

  return (
    <div className="organization-dashboard">
      <OrganizationSidebar />
      <main className={`organization-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="container-fluid">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default OrganizationDashboard;