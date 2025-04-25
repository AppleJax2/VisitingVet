import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { checkAuthStatus, logout } from '../services/api';
import NotificationBell from './NotificationBell';
import theme from '../utils/theme';

const Header = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await checkAuthStatus();
        if (data && data.success) {
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [location.pathname]);
  
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  // Custom styles using our theme
  const styles = {
    navbar: {
      background: `linear-gradient(to right, ${theme.colors.primary.main}, ${theme.colors.primary.dark})`,
      boxShadow: theme.shadows.sm,
    },
    brand: {
      color: theme.colors.text.white,
      fontFamily: theme.fonts.heading,
      fontWeight: 'bold',
      fontSize: '1.5rem',
    },
    navLink: {
      color: theme.colors.text.white,
      fontSize: '1rem',
      fontFamily: theme.fonts.body,
      margin: '0 10px',
      transition: 'all 0.3s ease',
    },
    navLinkHover: {
      color: theme.colors.accent.gold,
      textDecoration: 'none',
    },
    activeNavLink: {
      color: theme.colors.accent.gold,
      fontWeight: 'bold',
    },
    ctaButton: {
      backgroundColor: theme.colors.secondary.main,
      borderColor: theme.colors.secondary.main,
      color: theme.colors.text.white,
      fontWeight: 'bold',
      '&:hover': {
        backgroundColor: theme.colors.secondary.dark,
        borderColor: theme.colors.secondary.dark,
      },
    },
    altButton: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.text.white,
      color: theme.colors.text.white,
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      },
    },
    dropdown: {
      backgroundColor: theme.colors.background.white,
      border: 'none',
      borderRadius: theme.borderRadius.md,
      boxShadow: theme.shadows.md,
    },
    dropdownItem: {
      color: theme.colors.text.primary,
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: theme.colors.background.light,
        color: theme.colors.primary.main,
      },
    },
  };

  // Custom NavLink component with hover effect
  const NavLink = ({ to, children, className }) => {
    const isActive = location.pathname === to;
    const [isHovered, setIsHovered] = useState(false);
    
    return (
      <Nav.Link 
        as={Link} 
        to={to}
        className={className}
        style={{
          ...styles.navLink,
          ...(isActive ? styles.activeNavLink : {}),
          ...(isHovered ? styles.navLinkHover : {})
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </Nav.Link>
    );
  };

  return (
    <Navbar expand="lg" className="py-3" style={styles.navbar}>
      <Container>
        <Navbar.Brand as={Link} to="/" style={styles.brand}>
          VisitingVet
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <NavLink to="/search-providers">Find a Vet</NavLink>
            
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard">Dashboard</NavLink>
                
                {user && user.role === 'MVSProvider' && (
                  <>
                    <NavLink to="/provider-profile">My Profile</NavLink>
                    <NavLink to="/provider-appointments">Appointments</NavLink>
                  </>
                )}
                
                {user && user.role === 'PetOwner' && (
                  <NavLink to="/my-appointments">My Appointments</NavLink>
                )}
                
                <div className="d-flex align-items-center ms-3">
                  <NotificationBell />
                  
                  <Dropdown align="end" className="ms-3">
                    <Dropdown.Toggle 
                      variant="outline-light" 
                      id="dropdown-basic"
                      size="sm"
                    >
                      {user ? user.email.split('@')[0] : 'Account'}
                    </Dropdown.Toggle>
                    
                    <Dropdown.Menu style={styles.dropdown}>
                      <Dropdown.Item 
                        as={Link} 
                        to="/dashboard"
                        style={styles.dropdownItem}
                      >
                        Dashboard
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item 
                        onClick={handleLogout}
                        style={styles.dropdownItem}
                      >
                        Logout
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </>
            ) : (
              <div className="d-flex align-items-center ms-3">
                <Button 
                  as={Link} 
                  to="/login" 
                  variant="outline-light"
                  className="me-2"
                  style={styles.altButton}
                >
                  Login
                </Button>
                <Button 
                  as={Link} 
                  to="/register" 
                  style={styles.ctaButton}
                >
                  Register
                </Button>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header; 