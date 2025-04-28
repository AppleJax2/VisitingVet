import React, { useState } from 'react';
import { Container, Row, Col, Nav, Button, Offcanvas, Navbar } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  House, Calendar, Search, Person, 
  Building, Gear, BoxArrowRight, Download,
  List as ListIcon, X as XIcon, BellFill, ChatDotsFill, FileEarmarkText, List, ChevronDown
} from 'react-bootstrap-icons';
import theme from '../../utils/theme';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../NotificationBell';
import { Dropdown } from 'react-bootstrap';

// DashboardLayout serves as the base layout for all dashboard types
const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const location = useLocation();

  const handleOffcanvasClose = () => setShowOffcanvas(false);
  const handleOffcanvasShow = () => setShowOffcanvas(true);

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
      width: sidebarCollapsed ? '80px' : '260px',
      backgroundColor: theme.colors.primary.dark,
      transition: 'all 0.3s ease',
      zIndex: 1030,
      overflowY: 'auto',
      boxShadow: theme.shadows.md,
      paddingTop: '60px',
    },
    sidebarHeader: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      padding: '15px 20px',
      textAlign: sidebarCollapsed ? 'center' : 'left',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      backgroundColor: theme.colors.primary.dark,
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
      zIndex: 1
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
      marginLeft: sidebarCollapsed ? '80px' : '260px',
      padding: '20px',
      transition: 'all 0.3s ease',
      minHeight: '100vh',
      backgroundColor: theme.colors.background.light,
      paddingTop: '80px',
    },
    contentSmallScreen: {
      padding: '20px',
      minHeight: '100vh',
      backgroundColor: theme.colors.background.light,
      paddingTop: '80px',
    },
    toggleButton: {
      position: 'absolute',
      bottom: '20px',
      left: sidebarCollapsed ? '20px' : '110px',
      backgroundColor: 'rgba(255,255,255,0.1)',
      color: theme.colors.text.white,
      border: 'none',
      transition: 'all 0.3s ease',
      zIndex: 2
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.background.white,
      padding: '15px 20px',
      boxShadow: theme.shadows.sm,
      position: 'fixed',
      top: 0,
      left: sidebarCollapsed ? '80px' : '260px',
      right: 0,
      zIndex: 1020,
      height: '60px',
      transition: 'left 0.3s ease',
    },
    headerSmallScreen: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.background.white,
      padding: '15px 20px',
      boxShadow: theme.shadows.sm,
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1020,
      height: '60px',
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
      width: '32px',
      height: '32px',
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
          text: 'Clinic Settings',
        },
      ];
    }

    // Default items if no specific role
    return commonItems;
  };

  const navItems = getNavItems();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Reusable Sidebar Content Component
  const SidebarContent = ({ isOffcanvas = false }) => (
    <Nav className="flex-column pt-3">
      {navItems.map((item, index) => (
        <Nav.Item key={index} style={sidebarStyles.navItem}>
          <Link
            to={item.path}
            style={{
              ...sidebarStyles.navLink,
              ...(isActive(item.path) ? sidebarStyles.navLinkActive : {})
            }}
            className={isActive(item.path) ? 'active' : ''}
            onClick={isOffcanvas ? handleOffcanvasClose : undefined}
          >
            <span style={sidebarStyles.navIcon}>{item.icon}</span>
            <span style={sidebarStyles.navText}>{item.text}</span>
          </Link>
        </Nav.Item>
      ))}
       <Nav.Item style={{ ...sidebarStyles.navItem, marginTop: 'auto' }}>
          <Nav.Link 
            onClick={handleLogout}
            style={{...sidebarStyles.navLink, color: 'rgba(255,255,255,0.7)'}}
          >
            <span style={sidebarStyles.navIcon}><BoxArrowRight /></span>
            <span style={sidebarStyles.navText}>Logout</span>
          </Nav.Link>
        </Nav.Item>
    </Nav>
  );

  // Reusable Header Content Component
  const HeaderContent = () => (
     <div style={sidebarStyles.headerActions}>
        <NotificationBell />
        <Dropdown align="end">
          <Dropdown.Toggle 
            as={Button} 
            variant="link" 
            id="dropdown-user-profile" 
            style={sidebarStyles.profileButton}
          >
            <img 
              src={user?.profile?.photoUrl || 'https://via.placeholder.com/50?text=' + (user?.email?.[0]?.toUpperCase() || 'U')}
              alt="User profile" 
              style={sidebarStyles.profileImg}
            />
            <span className="d-none d-md-inline ms-1 me-1">{user?.name || user?.email}</span>
            <ChevronDown size={14} />
          </Dropdown.Toggle>
          <Dropdown.Menu renderOnMount>
            <Dropdown.Item as={Link} to="/profile">My Profile</Dropdown.Item>
            <Dropdown.Item as={Link} to="/settings">Settings</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
  );

  return (
    <div className="dashboard-layout">
      {/* Offcanvas Sidebar for small screens (hidden on md and up) */}
      <div className="d-md-none">
          <Navbar style={sidebarStyles.headerSmallScreen} className="px-3">
             <Button 
                variant="outline-secondary" 
                onClick={handleOffcanvasShow} 
                className="p-1 me-2 lh-1"
                aria-label="Open navigation menu"
              >
                <ListIcon size={24}/>
              </Button>
             <Navbar.Brand as={Link} to="/dashboard" style={{ color: theme.colors.primary.main }}>Dashboard</Navbar.Brand>
             <HeaderContent />
          </Navbar>
          <Offcanvas 
            show={showOffcanvas} 
            onHide={handleOffcanvasClose} 
            placement="start" 
            style={{ backgroundColor: theme.colors.primary.dark, color: theme.colors.text.white, width: '260px' }}
          >
            <Offcanvas.Header closeButton closeVariant="white" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
               <div style={sidebarStyles.sidebarHeader} className="position-relative w-100 p-0">
                 <Link to="/dashboard" style={sidebarStyles.sidebarBrand}>
                   <img src="/assets/logo-white.png" alt="Logo" style={sidebarStyles.sidebarLogo} />
                   VisitingVet
                 </Link>
               </div>
            </Offcanvas.Header>
            <Offcanvas.Body className="p-0">
              <SidebarContent isOffcanvas={true} />
            </Offcanvas.Body>
          </Offcanvas>
      </div>

      {/* Fixed Collapsible Sidebar for medium screens and up (visible on md and up) */}
      <div className="d-none d-md-block" style={{ ...sidebarStyles.sidebar, left: 0 }}>
          <div style={sidebarStyles.sidebarHeader}>
             <Link to="/dashboard" style={sidebarStyles.sidebarBrand}>
               <img src="/assets/logo-white.png" alt="Logo" style={sidebarStyles.sidebarLogo} />
               {!sidebarCollapsed && <span>VisitingVet</span>}
             </Link>
           </div>
           <SidebarContent />
            <Button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
              style={sidebarStyles.toggleButton} 
              variant="outline-light"
              size="sm"
            >
              {sidebarCollapsed ? <ListIcon /> : <XIcon />}
            </Button>
      </div>
      
       {/* Header for medium screens and up */}
       <div className="d-none d-md-block" style={sidebarStyles.header}>
            <div>{/* Placeholder for potential breadcrumbs or title */}</div>
            <HeaderContent />
        </div>

      {/* Main Content Area - Adjust margin based on screen size */}
      <main className="d-md-none" style={sidebarStyles.contentSmallScreen}>
        {children}
      </main>
      <main className="d-none d-md-block" style={sidebarStyles.mainContent}>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout; 