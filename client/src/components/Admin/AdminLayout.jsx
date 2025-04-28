import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Container, Nav, Navbar, Button, Offcanvas } from 'react-bootstrap';
import { 
    HouseDoorFill, PeopleFill, PatchCheckFill, 
    ClipboardDataFill, GearFill, BoxArrowRight,
    List, Bell, Person, Search
} from 'react-bootstrap-icons';
import theme from '../../utils/theme';
import { logout } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showSidebar, setShowSidebar] = useState(true);
    const [showOffcanvas, setShowOffcanvas] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Admin logout failed:', error);
        }
    };

    // Determine active link
    const isActive = (path) => 
        location.pathname === path || location.pathname.startsWith(path + '/');

    const navItems = [
        { path: '/admin', icon: <HouseDoorFill className="me-3 text-primary" />, text: 'Dashboard' },
        { path: '/admin/users', icon: <PeopleFill className="me-3 text-primary" />, text: 'Users' },
        { path: '/admin/verifications', icon: <PatchCheckFill className="me-3 text-primary" />, text: 'Verifications' },
        { path: '/admin/logs', icon: <ClipboardDataFill className="me-3 text-primary" />, text: 'Action Logs' },
        { path: '/admin/settings', icon: <GearFill className="me-3 text-primary" />, text: 'Settings' }
    ];

    // Get current page title
    const getCurrentPageTitle = () => {
        const currentItem = navItems.find(item => isActive(item.path));
        return currentItem ? currentItem.text : 'Admin';
    };

    const toggleSidebar = () => {
        setShowSidebar(!showSidebar);
    };

    return (
        <div className="d-flex">
            {/* Top Navbar */}
            <Navbar bg="white" expand={false} className="shadow-sm py-2 px-3 position-fixed top-0 w-100" style={{ zIndex: 1030, height: '56px' }}>
                <Container fluid className="px-0">
                    <div className="d-flex align-items-center">
                        <Button 
                            variant="outline-light" 
                            onClick={toggleSidebar}
                            className="border-0 d-none d-lg-block"
                        >
                            <List size={24} className="text-dark" />
                        </Button>
                        
                        <Button 
                            variant="outline-light" 
                            onClick={() => setShowOffcanvas(true)}
                            className="border-0 d-lg-none"
                        >
                            <List size={24} className="text-dark" />
                        </Button>
                        
                        <Navbar.Brand className="ms-2 fw-bold" as={Link} to="/admin">
                            <span style={{ color: theme.colors.primary.main }}>Visiting</span>
                            <span style={{ color: theme.colors.primary.dark }}>Vet</span>
                            <span className="ms-2 badge bg-primary">Admin</span>
                        </Navbar.Brand>
                    </div>

                    <div className="d-flex align-items-center">
                        <Button variant="outline-light" className="border-0 p-1 mx-1">
                            <Bell size={18} className="text-dark" />
                        </Button>
                        <Button variant="outline-light" className="border-0 p-1 mx-1">
                            <Person size={18} className="text-dark" />
                        </Button>
                    </div>
                </Container>
            </Navbar>

            {/* Sidebar for Desktop */}
            <div 
                className={`bg-dark text-white d-none d-lg-block position-fixed h-100 ${showSidebar ? '' : 'sidebar-collapsed'}`} 
                style={{ 
                    width: showSidebar ? '240px' : '70px', 
                    zIndex: 1020,
                    top: '56px',
                    transition: 'width 0.3s ease-in-out'
                }}
            >
                <div className="px-3 py-4">
                    <Nav className="flex-column">
                        {navItems.map((item, index) => (
                            <Nav.Item key={index}>
                                <Link 
                                    to={item.path} 
                                    className={`nav-link py-2 px-3 mb-2 rounded d-flex align-items-center ${isActive(item.path) ? 'active bg-primary text-white' : 'text-white-50'}`}
                                >
                                    <span>{item.icon}</span>
                                    <span className={showSidebar ? '' : 'd-none'}>{item.text}</span>
                                </Link>
                            </Nav.Item>
                        ))}

                        <hr className="my-3 bg-secondary" />
                        
                        <Nav.Item>
                            <Nav.Link 
                                onClick={handleLogout}
                                className="py-2 px-3 text-white-50 d-flex align-items-center"
                            >
                                <BoxArrowRight className="me-3 text-danger" />
                                <span className={showSidebar ? '' : 'd-none'}>Logout</span>
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                </div>
            </div>

            {/* Offcanvas Sidebar for Mobile */}
            <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="start" style={{ width: '240px' }}>
                <Offcanvas.Header closeButton className="bg-dark text-white border-bottom border-secondary">
                    <Offcanvas.Title>
                        <span className="fw-bold">
                            <span style={{ color: theme.colors.primary.main }}>Visiting</span>
                            <span style={{ color: '#fff' }}>Vet</span>
                        </span>
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="bg-dark text-white p-0">
                    <Nav className="flex-column">
                        {navItems.map((item, index) => (
                            <Nav.Item key={index}>
                                <Link 
                                    to={item.path} 
                                    className={`nav-link py-3 px-3 d-flex align-items-center ${isActive(item.path) ? 'active bg-primary text-white' : 'text-white-50'}`}
                                    onClick={() => setShowOffcanvas(false)}
                                >
                                    <span>{item.icon}</span>
                                    <span>{item.text}</span>
                                </Link>
                            </Nav.Item>
                        ))}
                        
                        <hr className="my-3 bg-secondary mx-3" />
                        
                        <Nav.Item>
                            <Nav.Link 
                                onClick={handleLogout}
                                className="py-3 px-3 text-white-50 d-flex align-items-center"
                            >
                                <BoxArrowRight className="me-3 text-danger" />
                                <span>Logout</span>
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Offcanvas.Body>
            </Offcanvas>

            {/* Main Content Area */}
            <main 
                className="flex-grow-1 bg-light" 
                style={{ 
                    marginLeft: showSidebar ? '240px' : '70px',
                    marginTop: '56px',
                    minHeight: 'calc(100vh - 56px)',
                    transition: 'margin-left 0.3s ease-in-out',
                    padding: '20px'
                }}
            >
                <div className="mb-4">
                    <h1 className="fs-4 mb-1">{getCurrentPageTitle()}</h1>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item"><Link to="/admin">Admin</Link></li>
                            {location.pathname !== '/admin' && (
                                <li className="breadcrumb-item active" aria-current="page">
                                    {getCurrentPageTitle()}
                                </li>
                            )}
                        </ol>
                    </nav>
                </div>
                
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout; 