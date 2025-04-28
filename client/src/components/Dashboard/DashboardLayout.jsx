import React, { useState } from 'react';
import { Container, Row, Col, Nav, Button, Navbar, Dropdown } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { 
  House, Calendar, Search, Person, 
  Building, Gear, BoxArrowRight, Download,
  List as ListIcon, X as XIcon, BellFill, ChatDotsFill, FileEarmarkText,
} from 'react-bootstrap-icons';
import theme from '../../utils/theme';
import { useAuth } from '../../contexts/AuthContext';
import './Dashboard.css'; // Import the Dashboard CSS

// DashboardLayout serves as the base layout for all dashboard types
const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Determine active link
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Different navigation items based on user role
  const getNavItems = () => {
    const baseDashboardPath = `/dashboard/${user.role.toLowerCase()}`;
    
    const commonItems = [
      {
        path: '/dashboard',
        icon: <House className="nav-icon" />,
        text: 'Dashboard',
      },
    ];

    if (user?.role === 'PetOwner') {
      return [
        ...commonItems,
        {
          path: '/search-providers',
          icon: <Search className="nav-icon" />,
          text: 'Find Vets',
        },
        {
          path: '/my-appointments',
          icon: <Calendar className="nav-icon" />,
          text: 'My Appointments',
        },
        {
          path: '/dashboard/pet-owner/service-requests',
          icon: <FileEarmarkText className="nav-icon" />,
          text: 'Specialist Referrals',
        },
        {
          path: '/my-pets',
          icon: <Person className="nav-icon" />,
          text: 'My Pets',
        },
        {
          path: '/manage-reminders',
          icon: <BellFill className="nav-icon" />,
          text: 'Reminders',
        },
        {
          path: '/profile',
          icon: <Gear className="nav-icon" />,
          text: 'Settings',
        },
      ];
    } 
    
    if (user?.role === 'MVSProvider') {
      return [
        ...commonItems,
        {
          path: '/provider-appointments',
          icon: <Calendar className="nav-icon" />,
          text: 'Appointments',
        },
        {
          path: '/dashboard/provider/service-requests',
          icon: <FileEarmarkText className="nav-icon" />,
          text: 'Service Requests',
        },
        {
          path: '/provider-clients',
          icon: <Person className="nav-icon" />,
          text: 'Clients',
        },
        {
          path: '/provider-profile',
          icon: <Person className="nav-icon" />,
          text: 'My Profile',
        },
        {
          path: '/provider-settings',
          icon: <Gear className="nav-icon" />,
          text: 'Settings',
        },
      ];
    }

    if (user?.role === 'Clinic') {
      return [
        ...commonItems,
        {
          path: '/clinic-appointments',
          icon: <Calendar className="nav-icon" />,
          text: 'Appointments',
        },
        {
          path: '/dashboard/clinic/service-requests',
          icon: <FileEarmarkText className="nav-icon" />,
          text: 'Specialist Referrals',
        },
        {
          path: '/clinic-staff',
          icon: <Person className="nav-icon" />,
          text: 'Staff Management',
        },
        {
          path: '/clinic-profile',
          icon: <Building className="nav-icon" />,
          text: 'Clinic Profile',
        },
        {
          path: '/clinic-settings',
          icon: <Gear className="nav-icon" />,
          text: 'Settings',
        },
      ];
    }

    // Default items if no specific role
    return commonItems;
  };

  return (
    <div className="dashboard-layout d-flex">
      {/* Sidebar */}
      <div className={`dashboard-sidebar bg-dark text-white ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header py-3 px-3 border-bottom border-secondary">
          <Link to="/dashboard" className="sidebar-brand text-decoration-none text-white">
            <span className="sidebar-logo me-2">🐾</span>
            {!sidebarCollapsed && <span className="fs-4 fw-bold">VisitingVet</span>}
          </Link>
        </div>

        {/* Navigation */}
        <Nav className="flex-column mt-3">
          {getNavItems().map((item, index) => (
            <Nav.Item key={index} className="px-3 py-1">
              <Link
                to={item.path}
                className={`nav-link py-2 px-3 rounded d-flex align-items-center ${isActive(item.path) ? 'active bg-primary' : 'text-white-50'}`}
              >
                {item.icon}
                <span className={sidebarCollapsed ? 'd-none' : ''}>{item.text}</span>
              </Link>
            </Nav.Item>
          ))}

          {/* Logout */}
          <Nav.Item className="px-3 py-1 mt-auto">
            <Button
              variant="link"
              onClick={logout}
              className="nav-link py-2 px-3 text-white-50 w-100 text-start border-0 bg-transparent"
            >
              <BoxArrowRight className="nav-icon" />
              <span className={sidebarCollapsed ? 'd-none' : ''}>Logout</span>
            </Button>
          </Nav.Item>
        </Nav>

        {/* Install Now Button - Example, functionality not implemented */}
        <div className="px-3 mt-3">
          <Button variant="warning" className="w-100 d-flex align-items-center justify-content-center py-2">
            <Download className={`${sidebarCollapsed ? '' : 'me-2'}`} />
            {!sidebarCollapsed && <span>Install App</span>}
          </Button>
        </div>

        {/* Toggle Sidebar Button */}
        <Button
          variant="outline-secondary"
          className="sidebar-toggle mt-4 mx-auto d-block"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? <ListIcon /> : <XIcon />}
        </Button>
      </div>

      {/* Main Content Area */}
      <div className={`dashboard-content bg-light ${sidebarCollapsed ? 'expanded' : ''}`}>
        {/* Top Header */}
        <Navbar bg="white" className="shadow-sm mb-4 px-3 py-2 rounded">
          <Container fluid className="px-0">
            <h5 className="mb-0">Welcome, {user?.name || user?.email?.split('@')[0] || 'User'}</h5>
            
            <div className="d-flex align-items-center">
              <Button variant="outline-light" className="border-0 p-1 position-relative me-3">
                <BellFill size={20} className="text-dark" />
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  3
                </span>
              </Button>
              
              <Button variant="outline-light" className="border-0 p-1 me-3">
                <ChatDotsFill size={20} className="text-dark" />
              </Button>
              
              <Dropdown align="end">
                <Dropdown.Toggle as="div" className="d-flex align-items-center cursor-pointer">
                  <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white me-2" style={{ width: 38, height: 38 }}>
                    {user?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                </Dropdown.Toggle>
                
                <Dropdown.Menu className="shadow-sm border-0">
                  <Dropdown.Item as={Link} to="/profile">My Profile</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/settings">Settings</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Container>
        </Navbar>

        {/* Dashboard Content */}
        <Container fluid className="pb-4">
          {children}
        </Container>
      </div>
    </div>
  );
};

export default DashboardLayout; 