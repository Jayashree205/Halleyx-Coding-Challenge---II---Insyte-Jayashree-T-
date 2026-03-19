import React, { useState } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo-transparent.png';

function NavbarComponent({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    onLogout();
    setExpanded(false);
    navigate('/');
  };

  const handleNavClick = (path) => {
    navigate(path);
    setExpanded(false);
  };

  return (
    <Navbar bg="white" expand="lg" className="py-2 py-md-3 shadow-sm sticky-top border-bottom border-light" expanded={expanded} onToggle={(v) => setExpanded(v)}>
      <Container fluid className="px-2 px-md-3">
        <Navbar.Brand 
          href="/" 
          className="fw-bold text-primary d-flex align-items-center gap-2 gap-md-3 flex-shrink-0 logo-brand"
          onClick={(e) => { 
            e.preventDefault(); 
            handleNavClick('/dashboard');
          }}
          style={{ minWidth: 'fit-content' }}
        >
          <div className="logo-container" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%)',
            border: '1.5px solid rgba(46, 125, 50, 0.2)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <img 
              src={logo} 
              alt="Insyte Logo" 
              height="28" 
              className="d-inline-block"
              style={{ filter: 'drop-shadow(0 0 8px rgba(46, 125, 50, 0.3))' }}
            />
          </div>
          <span className="d-none d-sm-inline" style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            fontWeight: '700',
            letterSpacing: '-0.5px'
          }}>Insyte</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 shadow-none" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto my-2 my-lg-0 bg-light rounded-pill px-3 py-1 w-100 w-lg-auto">
            <Nav.Link 
              onClick={() => handleNavClick(user ? '/dashboard' : '/')} 
              className={`px-3 px-md-4 py-2 py-md-0 rounded-pill fw-medium transition-all text-center ${location.pathname === '/dashboard' || location.pathname === '/' ? 'bg-primary text-white shadow-sm' : 'text-muted hover-lift'}`}
              style={{ fontSize: '0.95rem' }}
            >
              {user ? 'Dashboard' : 'Home'}
            </Nav.Link>
            {user && (
              <Nav.Link 
                onClick={() => handleNavClick('/orders')} 
                className={`px-3 px-md-4 py-2 py-md-0 rounded-pill fw-medium transition-all text-center ${location.pathname === '/orders' ? 'bg-primary text-white shadow-sm' : 'text-muted hover-lift'}`}
                style={{ fontSize: '0.95rem' }}
              >
                Orders
              </Nav.Link>
            )}
          </Nav>
          
          <div className="d-flex flex-column flex-lg-row align-items-center gap-2 gap-md-3 mt-3 mt-lg-0 w-100 w-lg-auto justify-content-center justify-content-lg-end">
            {user ? (
              <>
                {/* Profile Section - Hidden on Mobile */}
                <div 
                  className="d-none d-md-flex align-items-center gap-2 cursor-pointer hover-lift transition-all p-2 rounded" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleNavClick('/profile')}
                  role="button"
                  tabIndex="0"
                >
                  <div className="bg-primary bg-opacity-10 p-2 rounded-circle" style={{ minWidth: '36px' }}>
                    <i className="bi bi-person-fill text-primary"></i>
                  </div>
                  <div className="d-flex flex-column text-start" style={{ minWidth: '0' }}>
                    <span className="fw-bold text-secondary small lh-1" style={{ fontSize: '0.8rem' }}>{user.username}</span>
                    <span className="text-muted" style={{ fontSize: '0.65rem' }}>{user.jobTitle || 'User'}</span>
                  </div>
                </div>
                
                {/* Mobile Profile Icon */}
                <Button 
                  variant="light" 
                  className="d-md-none rounded-circle p-2" 
                  onClick={() => handleNavClick('/profile')}
                  title="Profile"
                  style={{ minWidth: '44px', minHeight: '44px' }}
                >
                  <i className="bi bi-person-fill text-primary fs-5"></i>
                </Button>
                
                {/* Logout Button */}
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  className="rounded-pill px-2 py-1 hover-lift w-md-auto"
                  onClick={handleLogout}
                  style={{ minHeight: '36px', maxWidth: '140px' }}
                >
                  <i className="bi bi-box-arrow-right me-1"></i>
                  <span className="d-none d-sm-inline">Logout</span>
                </Button>
              </>
            ) : (
              <div className="d-flex flex-column flex-md-row gap-2 w-100 w-md-auto">
                <Button 
                  variant="link" 
                  className="text-secondary text-decoration-none fw-bold" 
                  onClick={() => handleNavClick('/login')}
                  style={{ minHeight: '44px' }}
                >
                  Log In
                </Button>
                <Button 
                  variant="primary" 
                  className="btn-premium rounded-pill px-4 w-100 w-md-auto" 
                  onClick={() => handleNavClick('/signup')}
                  style={{ minHeight: '44px' }}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarComponent;