import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { 
  PersonFill, 
  BoxArrowInRight, 
  List, 
  Bell, 
  ChevronDown 
} from 'react-bootstrap-icons';
import { checkAuthStatus, logout } from '../services/api';
import NotificationBell from './NotificationBell';
import theme from '../utils/theme';

const Header = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check scroll position to add background on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
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
      
      // Clear any stored tokens or session information
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
      
      // Still clear state and storage even if API call fails
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      navigate('/login');
    }
  };

  // Determine if we're on the homepage
  const isHomePage = location.pathname === '/';

  // Custom NavLink component with hover effect
  const NavLink = ({ to, children, className }) => {
    const isActive = location.pathname === to;
    const [isHovered, setIsHovered] = useState(false);
    
    return (
      <Link 
        to={to} 
        className={`nav-link ${className || ''} ${isActive ? 'active' : ''}`}
        style={{
          padding: '0.5rem 1rem',
          fontWeight: 500,
          transition: 'color 0.3s ease',
          color: isHomePage && !scrolled && !isAuthenticated 
              ? theme.colors.white 
              : (isActive || isHovered ? theme.colors.primary.main : theme.colors.text.primary),
          borderBottom: isActive ? `2px solid ${theme.colors.primary.main}` : '2px solid transparent', 
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </Link>
    );
  };

  return (
    <Navbar 
      expand="lg" 
      fixed="top"
      className={`main-navbar ${scrolled || !isHomePage || isAuthenticated ? 'scrolled' : ''}`}
      variant={scrolled || !isHomePage || isAuthenticated ? 'light' : 'dark'}
      bg={scrolled || !isHomePage || isAuthenticated ? 'white' : 'transparent'}
    >
      <Container fluid="xl">
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center fw-bold">
          <img
            src={scrolled || !isHomePage || isAuthenticated ? "/assets/logo-primary.png" : "/assets/logo-white.png"} 
            width="30"
            height="30"
            className="d-inline-block align-top me-2"
            alt="VisitingVet Logo"
          />
          <span style={{ color: scrolled || !isHomePage || isAuthenticated ? theme.colors.primary.dark : theme.colors.white }}>
             VisitingVet
          </span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
           <List color={scrolled || !isHomePage || isAuthenticated ? theme.colors.text.primary : theme.colors.white} size={24} />
        </Navbar.Toggle>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <NavLink to="/" className="mx-lg-1">Home</NavLink>
            <NavLink to="/search-providers" className="mx-lg-1">Find a Vet</NavLink>
            <NavLink to="/about" className="mx-lg-1">About Us</NavLink>
            <NavLink to="/services" className="mx-lg-1">Services</NavLink>
            {/* Add Blog Link if implemented later */}
            {/* <NavLink to="/blog" className="mx-lg-1">Blog</NavLink> */}
            
            {loading ? (
              <div className="d-flex align-items-center">
                <NotificationBell />
                
                <Dropdown align="end" className="ms-2">
                  <Dropdown.Toggle 
                    as="div"
                    id="dropdown-basic"
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <div 
                      className="user-avatar d-flex align-items-center justify-content-center me-1"
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: scrolled || !isHomePage 
                          ? theme.colors.primary.light 
                          : 'rgba(255, 255, 255, 0.2)',
                        color: scrolled || !isHomePage 
                          ? 'white' 
                          : 'white',
                        marginRight: '6px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {user ? user.email.substring(0, 2).toUpperCase() : <PersonFill size={18} />}
                    </div>
                    <span 
                      className="d-none d-md-block"
                      style={{
                        color: scrolled || !isHomePage 
                          ? theme.colors.text.primary
                          : 'white',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        marginRight: '3px'
                      }}
                    >
                      {user ? user.email.split('@')[0] : 'Account'}
                    </span>
                    <ChevronDown 
                      size={14} 
                      style={{
                        color: scrolled || !isHomePage 
                          ? theme.colors.text.primary
                          : 'white',
                        opacity: 0.8
                      }}
                    />
                  </Dropdown.Toggle>
                  
                  <Dropdown.Menu 
                    style={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
                      padding: '0.5rem 0',
                      marginTop: '0.5rem',
                      minWidth: '220px'
                    }}
                  >
                    <div className="px-3 py-2 mb-1 border-bottom">
                      <div className="fw-semibold">{user ? user.email : 'User'}</div>
                      <div className="small text-muted">
                        {user && user.role === 'MVSProvider' && 'Veterinary Provider'}
                        {user && user.role === 'PetOwner' && 'Pet Owner'}
                        {user && user.role === 'Admin' && 'Administrator'}
                        {user && user.role === 'Clinic' && 'Veterinary Clinic'}
                      </div>
                    </div>
                    <Dropdown.Item 
                      as={Link} 
                      to="/dashboard"
                      className="d-flex align-items-center px-3 py-2"
                    >
                      <span className="me-2 icon-circle bg-primary-color">
                        <PersonFill size={14} color="white" />
                      </span>
                      Dashboard
                    </Dropdown.Item>

                    {user && user.role === 'MVSProvider' && (
                      <>
                        <Dropdown.Item 
                          as={Link} 
                          to="/provider-profile"
                          className="d-flex align-items-center px-3 py-2"
                        >
                          <span className="me-2 icon-circle bg-primary-color">
                            <PersonFill size={14} color="white" />
                          </span>
                          My Profile
                        </Dropdown.Item>
                        <Dropdown.Item 
                          as={Link} 
                          to="/provider-appointments"
                          className="d-flex align-items-center px-3 py-2"
                        >
                          <span className="me-2 icon-circle bg-primary-color">
                            <PersonFill size={14} color="white" />
                          </span>
                          Appointments
                        </Dropdown.Item>
                      </>
                    )}
                    
                    {user && user.role === 'PetOwner' && (
                      <>
                        <Dropdown.Item 
                          as={Link} 
                          to="/my-pets"
                          className="d-flex align-items-center px-3 py-2"
                        >
                          <span className="me-2 icon-circle bg-primary-color">
                            <PersonFill size={14} color="white" />
                          </span>
                          My Pets
                        </Dropdown.Item>
                        <Dropdown.Item 
                          as={Link} 
                          to="/my-appointments"
                          className="d-flex align-items-center px-3 py-2"
                        >
                          <span className="me-2 icon-circle bg-primary-color">
                            <PersonFill size={14} color="white" />
                          </span>
                          My Appointments
                        </Dropdown.Item>
                      </>
                    )}
                    
                    <Dropdown.Divider style={{ margin: '0.25rem 0' }}/>
                    
                    <Dropdown.Item 
                      onClick={handleLogout}
                      className="d-flex align-items-center px-3 py-2 text-danger"
                    >
                      <span className="me-2 icon-circle bg-danger">
                        <BoxArrowInRight size={14} color="white" />
                      </span>
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            ) : (
              <div className="d-flex align-items-center">
                <Button 
                  as={Link} 
                  to="/login" 
                  variant={scrolled || !isHomePage ? "outline-primary" : "outline-light"}
                  className="me-2"
                  style={{
                    borderRadius: '8px',
                    padding: '0.5rem 1.2rem',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease',
                    borderWidth: '2px',
                  }}
                >
                  Sign In
                </Button>
                <Button 
                  as={Link} 
                  to="/register" 
                  variant={scrolled || !isHomePage ? "primary" : "warning"}
                  style={{
                    borderRadius: '8px',
                    padding: '0.5rem 1.2rem',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease',
                    backgroundColor: scrolled || !isHomePage 
                      ? theme.colors.primary.main 
                      : theme.colors.accent.gold,
                    borderColor: scrolled || !isHomePage 
                      ? theme.colors.primary.main 
                      : theme.colors.accent.gold,
                  }}
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