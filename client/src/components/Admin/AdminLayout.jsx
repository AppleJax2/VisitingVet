import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Container, Nav, Navbar, Offcanvas } from 'react-bootstrap';
import { 
    HouseDoorFill, PeopleFill, PatchCheckFill, 
    ClipboardDataFill, GearFill, BoxArrowRight 
} from 'react-bootstrap-icons';
import theme from '../../utils/theme';
import { logout } from '../../services/api'; // Assuming logout API function exists
import { useNavigate } from 'react-router-dom';

const AdminLayout = () => {
    const navigate = useNavigate();

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
        sidebar: {
          backgroundColor: theme.colors.primary.dark, 
          minHeight: 'calc(100vh - 56px)', // Adjust based on header height if header is outside layout
          color: theme.colors.text.white,
          paddingTop: '20px',
          position: 'fixed',
          top: 56, // Assuming header height is 56px
          left: 0,
          width: '250px',
          zIndex: 1020, // Below navbar
        },
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
        content: {
            marginLeft: '250px', // Same as sidebar width
            padding: '20px',
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