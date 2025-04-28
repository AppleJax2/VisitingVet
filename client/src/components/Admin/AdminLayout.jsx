import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Container, Nav, Navbar, Offcanvas, Button } from 'react-bootstrap';
import { 
    HouseDoorFill, PeopleFill, PatchCheckFill, 
    ClipboardDataFill, GearFill, BoxArrowRight, List
} from 'react-bootstrap-icons';
import theme from '../../utils/theme';
import { logout } from '../../services/api'; // Assuming logout API function exists

const AdminLayout = () => {
    const navigate = useNavigate();
    const [showOffcanvas, setShowOffcanvas] = useState(false);

    const handleOffcanvasClose = () => setShowOffcanvas(false);
    const handleOffcanvasShow = () => setShowOffcanvas(true);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Admin logout failed:', error);
            // Optionally show an error message to the admin
        }
    };

    const sidebarStyles = {
        navLink: {
          color: theme.colors.text.white + 'cc', // Lighter white
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          textDecoration: 'none',
          transition: 'background-color 0.2s ease, color 0.2s ease',
        },
        navLinkActive: {
          backgroundColor: theme.colors.primary.main,
          color: theme.colors.text.white,
          fontWeight: 'bold',
        },
        navIcon: {
          marginRight: '15px',
          fontSize: '1.2rem',
        },
        contentLargeScreen: {
            marginLeft: '250px', // Same as fixed sidebar width
            padding: '20px',
            marginTop: '0', // Assuming header is outside or handled separately
        },
        contentSmallScreen: {
            padding: '20px',
            marginTop: '0',
        },
        fixedSidebar: { // Styles for the fixed sidebar on large screens
            marginTop: '56px', // Adjust if header is inside layout
        }
    };

    // Determine active link (simple implementation)
    const isActive = (path) => window.location.pathname === path || window.location.pathname.startsWith(path + '/');

    const navItems = [
        { path: '/admin', icon: <HouseDoorFill style={sidebarStyles.navIcon} />, text: 'Overview' },
        { path: '/admin/users', icon: <PeopleFill style={sidebarStyles.navIcon} />, text: 'Users' },
        { path: '/admin/verifications', icon: <PatchCheckFill style={sidebarStyles.navIcon} />, text: 'Verifications' },
        { path: '/admin/logs', icon: <ClipboardDataFill style={sidebarStyles.navIcon} />, text: 'Action Logs' },
        { path: '/admin/settings', icon: <GearFill style={sidebarStyles.navIcon} />, text: 'Settings' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <div style={sidebarStyles.sidebar}>
                <Nav className="flex-column">
                    {navItems.map((item, index) => (
                        <Nav.Item key={index}>
                            <Link 
                                to={item.path} 
                                style={{
                                    ...sidebarStyles.navLink,
                                    ...(isActive(item.path) ? sidebarStyles.navLinkActive : {})
                                }}
                                className={isActive(item.path) ? 'active' : ''}
                            >
                                {item.icon}
                                <span>{item.text}</span>
                            </Link>
                        </Nav.Item>
                    ))}
                    <Nav.Item style={{ marginTop: 'auto', marginBottom: '20px' }}>
                        <Nav.Link 
                            onClick={handleLogout}
                            style={{...sidebarStyles.navLink, cursor: 'pointer'}}
                        >
                            <BoxArrowRight style={sidebarStyles.navIcon} />
                            <span>Logout</span>
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
            </div>

            {/* Main Content Area */}
            <main style={sidebarStyles.content} className="flex-grow-1">
                {/* Render the matched child route component here */}
                <Outlet /> 
            </main>
        </div>
    );
};

export default AdminLayout; 