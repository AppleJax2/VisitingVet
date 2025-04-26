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
      <Nav.Link 
        as={Link} 
        to={to}
        className={`nav-link-custom mx-1 px-3 py-2 ${className || ''}`}
        style={{
          color: isHomePage && !scrolled ? '#ffffff' : theme.colors.text.primary,
          fontWeight: isActive ? '600' : '500',
          position: 'relative',
          opacity: isActive ? 1 : 0.9,
          transition: 'all 0.3s ease',
          borderRadius: '6px',
          ...(isHovered && {
            background: isHomePage && !scrolled 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(87, 126, 70, 0.05)',
            color: isHomePage && !scrolled ? theme.colors.accent.gold : theme.colors.primary.main,
          }),
          ...(isActive && {
            color: isHomePage && !scrolled ? theme.colors.accent.gold : theme.colors.primary.main,
          })
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
        {isActive && (
          <span 
            style={{ 
              position: 'absolute', 
              bottom: '0', 
              left: '50%', 
              width: '20px', 
              height: '2px', 
              background: isHomePage && !scrolled ? theme.colors.accent.gold : theme.colors.primary.main,
              transform: 'translateX(-50%)',
              borderRadius: '10px',
              transition: 'all 0.3s ease'
            }} 
          />
        )}
      </Nav.Link>
    );
  };

  return (
    <Navbar 
      expand="lg" 
      fixed="top" 
      className={`py-3 transition-all ${scrolled || !isHomePage ? 'navbar-scrolled' : 'navbar-transparent'}`}
      style={{
        background: scrolled || !isHomePage 
          ? 'rgba(255, 255, 255, 0.95)' 
          : 'transparent',
        boxShadow: scrolled || !isHomePage 
          ? '0 4px 20px rgba(0, 0, 0, 0.08)' 
          : 'none',
        backdropFilter: scrolled || !isHomePage 
          ? 'blur(10px)' 
          : 'none',
        transition: 'all 0.3s ease',
        zIndex: 1030,
      }}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <span 
            style={{
              fontFamily: theme.fonts.heading,
              fontWeight: 'bold',
              fontSize: '1.5rem',
              color: scrolled || !isHomePage ? theme.colors.primary.main : '#fff',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <svg 
              width="30" 
              height="30" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="me-2"
              style={{
                color: scrolled || !isHomePage ? theme.colors.primary.main : theme.colors.accent.gold,
              }}
            >
              <path d="M14 10h.01M10 14h.01M8.5 8.5h.01M18.5 8.5h.01M18.5 14.5h.01M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0z"/>
              <path d="M7 15.5c1 1 3.2 2 5.5 2s4-.5 5.5-2"/>
            </svg>
            VisitingVet
          </span>
        </Navbar.Brand>
        
        <Navbar.Toggle 
          aria-controls="basic-navbar-nav" 
          className="border-0 shadow-none" 
          style={{ 
            color: scrolled || !isHomePage ? theme.colors.primary.main : '#fff',
          }}
        >
          <List size={28} />
        </Navbar.Toggle>
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/search-providers">Find a Vet</NavLink>
            <NavLink to="/about">About Us</NavLink>
            <NavLink to="/services">Services</NavLink>
          </Nav>
          
          <Nav className="ms-auto">
            {isAuthenticated ? (
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