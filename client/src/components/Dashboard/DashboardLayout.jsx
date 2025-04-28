import React, { useState } from 'react';
import { Container, Row, Col, Nav, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { 
  House, Calendar, Search, Person, 
  Building, Gear, BoxArrowRight, Download,
  List as ListIcon, X as XIcon, BellFill, ChatDotsFill, FileEarmarkText,
} from 'react-bootstrap-icons';
import theme from '../../utils/theme';
import { useAuth } from '../../contexts/AuthContext';

// DashboardLayout serves as the base layout for all dashboard types
const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Determine active link
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Sidebar styles
  const sidebarStyles = {
    sidebar: {
      position: 'fixed',
      top: 0,
      bottom: 0,
      left: 0,
      width: sidebarCollapsed ? '70px' : '260px',
      backgroundColor: theme.colors.primary.dark,
      transition: 'all 0.3s ease',
      zIndex: 1030,
      overflowY: 'auto',
      boxShadow: theme.shadows.md,
    },
    sidebarHeader: {
      padding: '20px',
      textAlign: sidebarCollapsed ? 'center' : 'left',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
    },
    sidebarBrand: {
      color: theme.colors.text.white,
      fontFamily: theme.fonts.heading,
      fontWeight: 'bold',
      fontSize: sidebarCollapsed ? '1.2rem' : '1.5rem',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
    },
    sidebarLogo: {
      marginRight: sidebarCollapsed ? '0' : '10px',
      width: '30px',
      height: '30px',
    },
    navItem: {
      margin: '5px 0',
    },
    navLink: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 20px',
      color: 'rgba(255,255,255,0.7)',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      borderRadius: '5px',
      marginRight: '10px',
      marginLeft: '10px',
    },
    navLinkActive: {
      backgroundColor: 'rgba(255,255,255,0.1)',
      color: theme.colors.text.white,
    },
    navIcon: {
      marginRight: sidebarCollapsed ? '0' : '15px',
      fontSize: '1.2rem',
      minWidth: '20px',
      textAlign: 'center',
    },
    navText: {
      display: sidebarCollapsed ? 'none' : 'block',
    },
    mainContent: {
      marginLeft: sidebarCollapsed ? '70px' : '260px',
      padding: '20px',
      transition: 'all 0.3s ease',
      minHeight: 'calc(100vh - 60px)',
      backgroundColor: theme.colors.background.light,
    },
    toggleButton: {
      position: 'absolute',
      bottom: '20px',
      left: sidebarCollapsed ? '15px' : '105px',
      backgroundColor: 'rgba(255,255,255,0.1)',
      color: theme.colors.text.white,
      border: 'none',
      transition: 'all 0.3s ease',
    },
    installButton: {
      backgroundColor: theme.colors.secondary.main,
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
      padding: '12px 20px',
      marginTop: '20px',
      marginRight: '10px',
      marginLeft: '10px',
      borderRadius: '5px',
    },
    installIcon: {
      marginRight: sidebarCollapsed ? '0' : '10px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      backgroundColor: theme.colors.background.white,
      padding: '15px 20px',
      borderRadius: theme.borderRadius.md,
      boxShadow: theme.shadows.sm,
      position: 'sticky',
      top: 0,
      zIndex: 1020,
    },
    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
    },
    actionIcon: {
      fontSize: '1.3rem',
      color: theme.colors.text.primary,
      cursor: 'pointer',
    },
    profileButton: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: 'transparent',
      border: 'none',
      color: theme.colors.text.primary,
      padding: 0,
    },
    profileImg: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      marginRight: '10px',
      objectFit: 'cover',
    },
  };

  // Different navigation items based on user role
  const getNavItems = () => {
    const baseDashboardPath = `/dashboard/${user.role.toLowerCase()}`;
    
    const commonItems = [
      {
        path: '/dashboard',
        icon: <House style={sidebarStyles.navIcon} />,
        text: 'Dashboard',
      },
    ];

    if (user?.role === 'PetOwner') {
      return [
        ...commonItems,
        {
          path: '/search-providers',
          icon: <Search style={sidebarStyles.navIcon} />,
          text: 'Find Vets',
        },
        {
          path: '/my-appointments',
          icon: <Calendar style={sidebarStyles.navIcon} />,
          text: 'My Appointments',
        },
        {
          path: '/dashboard/pet-owner/service-requests',
          icon: <FileEarmarkText style={sidebarStyles.navIcon} />,
          text: 'Specialist Referrals',
        },
        {
          path: '/my-pets',
          icon: <Person style={sidebarStyles.navIcon} />,
          text: 'My Pets',
        },
        {
          path: '/manage-reminders',
          icon: <BellFill style={sidebarStyles.navIcon} />,
          text: 'Reminders',
        },
        {
          path: '/profile',
          icon: <Gear style={sidebarStyles.navIcon} />,
          text: 'Settings',
        },
      ];
    } 
    
    if (user?.role === 'MVSProvider') {
      return [
        ...commonItems,
        {
          path: '/provider-appointments',
          icon: <Calendar style={sidebarStyles.navIcon} />,
          text: 'Appointments',
        },
        {
          path: '/dashboard/provider/service-requests',
          icon: <FileEarmarkText style={sidebarStyles.navIcon} />,
          text: 'Service Requests',
        },
        {
          path: '/provider-clients',
          icon: <Person style={sidebarStyles.navIcon} />,
          text: 'Clients',
        },
        {
          path: '/provider-profile',
          icon: <Person style={sidebarStyles.navIcon} />,
          text: 'My Profile',
        },
        {
          path: '/provider-settings',
          icon: <Gear style={sidebarStyles.navIcon} />,
          text: 'Settings',
        },
      ];
    }

    if (user?.role === 'Clinic') {
      return [
        ...commonItems,
        {
          path: '/clinic-appointments',
          icon: <Calendar style={sidebarStyles.navIcon} />,
          text: 'Appointments',
        },
        {
          path: '/dashboard/clinic/service-requests',
          icon: <FileEarmarkText style={sidebarStyles.navIcon} />,
          text: 'Specialist Referrals',
        },
        {
          path: '/clinic-staff',
          icon: <Person style={sidebarStyles.navIcon} />,
          text: 'Staff Management',
        },
        {
          path: '/clinic-profile',
          icon: <Building style={sidebarStyles.navIcon} />,
          text: 'Clinic Profile',
        },
        {
          path: '/clinic-settings',
          icon: <Gear style={sidebarStyles.navIcon} />,
          text: 'Settings',
        },
      ];
    }

    // Default items if no specific role
    return commonItems;
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div style={sidebarStyles.sidebar}>
        <div style={sidebarStyles.sidebarHeader}>
          <Link to="/dashboard" style={sidebarStyles.sidebarBrand}>
            <span style={sidebarStyles.sidebarLogo}>🐾</span>
            {!sidebarCollapsed && <span>VisitingVet</span>}
          </Link>
        </div>

        {/* Navigation */}
        <Nav className="flex-column mt-4">
          {getNavItems().map((item, index) => (
            <Nav.Item key={index} style={sidebarStyles.navItem}>
              <Link
                to={item.path}
                style={{
                  ...sidebarStyles.navLink,
                  ...(isActive(item.path) ? sidebarStyles.navLinkActive : {}),
                }}
              >
                {item.icon}
                <span style={sidebarStyles.navText}>{item.text}</span>
              </Link>
            </Nav.Item>
          ))}

          {/* Logout */}
          <Nav.Item style={sidebarStyles.navItem}>
            <Button
              variant="link"
              onClick={(e) => {
                e.preventDefault();
                logout();
              }}
              style={{
                ...sidebarStyles.navLink,
                border: 'none',
                background: 'none',
                width: '100%',
                textAlign: 'left'
              }}
            >
              <BoxArrowRight style={sidebarStyles.navIcon} />
              <span style={sidebarStyles.navText}>Logout</span>
            </Button>
          </Nav.Item>
        </Nav>

        {/* Install Now Button - Example, functionality not implemented */}
        <Button style={sidebarStyles.installButton}>
          <Download style={sidebarStyles.installIcon} />
          {!sidebarCollapsed && <span>Install App</span>}
        </Button>

        {/* Toggle Sidebar Button */}
        <Button
          style={sidebarStyles.toggleButton}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? <ListIcon /> : <XIcon />}
        </Button>
      </div>

      {/* Main Content Area */}
      <div style={sidebarStyles.mainContent}>
        {/* Top Header inside Main Content */}
        <div style={sidebarStyles.header}>
          <h4>Welcome, {user?.name || user?.email?.split('@')[0] || 'User'}</h4>
          <div style={sidebarStyles.headerActions}>
            <BellFill style={sidebarStyles.actionIcon} />
            <ChatDotsFill style={sidebarStyles.actionIcon} />
            <button style={sidebarStyles.profileButton}>
              <img
                src={user?.profileImage || '/assets/images/default-profile.png'}
                alt="Profile"
                style={sidebarStyles.profileImg}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/images/default-profile.png';
                }}
              />
              <span>{user?.name || user?.email?.split('@')[0] || 'User'}</span>
            </button>
          </div>
        </div>

        {/* Dashboard Content Rendered Here */}
        <div className="mt-3">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout; 