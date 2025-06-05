import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import OrganizationSidebar from './OrganizationSidebar';

const OrganizationDashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="organization-dashboard">
      <OrganizationSidebar isCollapsed={isSidebarCollapsed} onCollapse={setIsSidebarCollapsed} />
      <main className={`organization-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="container-fluid">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default OrganizationDashboard;