import React from 'react';
import { Container, Row, Col, Button, Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import dashboardHero from '../assets/dashboard_hero.png';
import studioVisual from '../assets/studio_workspace.png';
import chart1 from '../assets/chart1.png';
import chart2 from '../assets/chart2.png';
import kpi from '../assets/kpi.png';
import collab from '../assets/collab.png';
import logo from '../assets/logo-transparent.png';

function Home({ onStartBuilding }) {
  const navigate = useNavigate();

  const galleryItems = [
    {
      src: chart1,
      title: 'Bar Charts',
      desc: [
        'Interactive bar charts that update in real time.',
        'Drill down by category, compare multiple series, and highlight trends.',
        'Perfect for KPIs and month-over-month analysis.'
      ]
    },
    {
      src: chart2,
      title: 'Line Analytics',
      desc: [
        'Smooth line charts with dynamic tooltips and annotations.',
        'Track changes over time with gradient highlight and markers.',
        'Supports multiple datasets and adaptive legends.'
      ]
    },
    {
      src: kpi,
      title: 'KPI Cards',
      desc: [
        'Instantly see key metrics with positive/negative trend indicators.',
        'Customizable goal targets and thresholds for each metric.',
        'Designed for high-impact dashboards and executive summaries.'
      ]
    },
    {
      src: collab,
      title: 'Collaboration',
      desc: [
        'Built-in sharing and team collaboration tools.',
        'Assign roles, comment on widgets, and lock layouts.',
        'Work together in real time without losing context.'
      ]
    },
    {
      src: dashboardHero,
      title: 'Dashboard View',
      desc: [
        'Full dashboard preview with responsive layout support.',
        'Drag-and-drop widgets and resizable panels.',
        'Perfect for deploying tailored analytics views.'
      ]
    },
    {
      src: studioVisual,
      title: 'Studio UI',
      desc: [
        'Modern editor UI with a clean workspace and tools. ',
        'Customize themes, templates, and widget behavior.',
        'Designed for usability and quick iterations.'
      ]
    }
  ];

  return (
    <div className="home-page overflow-hidden">
      {/* ===================================
          HERO SECTION - Main Landing
          =================================== */}
      <section className="hero-section-modern py-4 py-md-6 py-lg-8 d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <Container fluid className="px-3 px-md-4 px-lg-5">
          <Row className="align-items-center g-4 g-md-5 g-lg-6">
            {/* LEFT COLUMN: TEXT CONTENT */}
            <Col xs={12} lg={6} className="d-flex flex-column justify-content-center">
              {/* Badge */}
              <div className="badge-container mb-3 mb-md-4 d-flex align-items-center gap-2 px-3 py-2 w-fit" style={{
                display: 'inline-flex',
                background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.08) 0%, rgba(25, 118, 210, 0.05) 100%)',
                border: '1px solid rgba(46, 125, 50, 0.15)',
                borderRadius: '50px',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(46, 125, 50, 0.08)',
                width: 'fit-content'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.12) 0%, rgba(25, 118, 210, 0.08) 100%)',
                  border: '1px solid rgba(46, 125, 50, 0.15)',
                }}>
                  <img src={logo} alt="Logo" height="18" style={{ filter: 'drop-shadow(0 0 4px rgba(46, 125, 50, 0.2))' }} />
                </div>
                <span className="fw-600" style={{
                  fontSize: 'clamp(0.8rem, 1.5vw, 0.95rem)',
                  background: 'linear-gradient(135deg, #2e7d32 0%, #1976d2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Insyte Studio</span>
              </div>

              {/* Main Title */}
              <h1 className="hero-title mb-3 mb-md-4" style={{
                fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                fontWeight: '800',
                lineHeight: '1.1',
                letterSpacing: '-0.02em',
                color: '#1a1a1a'
              }}>
                Custom <span style={{
                  background: 'linear-gradient(135deg, #2e7d32 0%, #1976d2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Dashboard</span> Studio
              </h1>

              {/* Subtitle */}
              <p className="hero-subtitle mb-4 mb-md-6" style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                lineHeight: '1.6',
                color: '#666',
                maxWidth: '500px'
              }}>
                The ultimate visual analytics platform. Build personalized, real-time dashboards with drag-and-drop ease. No code required.
              </p>

              {/* CTA Buttons */}
              <div className="cta-buttons d-flex flex-column flex-sm-row gap-3 gap-md-4 mb-6 mb-md-8" style={{ width: '100%', maxWidth: '500px' }}>
                <Button 
                  onClick={() => navigate('/signup')}
                  className="btn-glow-primary"
                  style={{
                    padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                    fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
                    fontWeight: '600',
                    border: 'none',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                    color: 'white',
                    boxShadow: '0 10px 30px rgba(46, 125, 50, 0.2)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    flex: '1 1 auto'
                  }}
                >
                  Get Started Free
                </Button>
                
                <Button 
                  onClick={() => navigate('/login')}
                  className="btn-glow-secondary"
                  style={{
                    padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                    fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
                    fontWeight: '600',
                    border: '1.5px solid #2e7d32',
                    borderRadius: '12px',
                    background: 'transparent',
                    color: '#2e7d32',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    flex: '1 1 auto'
                  }}
                >
                  Sign In
                </Button>
              </div>

              {/* Stats Row */}
              <div className="stats-row d-flex flex-wrap gap-4 gap-md-5 mt-5" style={{ maxWidth: '450px' }}>
                <div className="stat-item d-flex flex-column">
                  <span className="fw-bold" style={{
                    fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                    color: '#2e7d32',
                    lineHeight: '1'
                  }}>10k+</span>
                  <span className="text-muted fw-500" style={{
                    fontSize: 'clamp(0.8rem, 1.5vw, 0.95rem)',
                    marginTop: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Active Users</span>
                </div>
                <div className="stat-item d-flex flex-column">
                  <span className="fw-bold" style={{
                    fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                    color: '#2e7d32',
                    lineHeight: '1'
                  }}>50+</span>
                  <span className="text-muted fw-500" style={{
                    fontSize: 'clamp(0.8rem, 1.5vw, 0.95rem)',
                    marginTop: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Widgets</span>
                </div>
                <div className="stat-item d-flex flex-column">
                  <span className="fw-bold" style={{
                    fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                    color: '#2e7d32',
                    lineHeight: '1'
                  }}>24/7</span>
                  <span className="text-muted fw-500" style={{
                    fontSize: 'clamp(0.8rem, 1.5vw, 0.95rem)',
                    marginTop: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Real-time</span>
                </div>
              </div>
            </Col>

            {/* RIGHT COLUMN: DASHBOARD PREVIEW */}
            <Col xs={12} lg={6} className="d-flex justify-content-center align-items-center mb-4 mb-md-5 mb-lg-0">
              <div className="dashboard-preview-container" style={{
                width: '100%',
                maxWidth: '600px',
                position: 'relative'
              }}>
                {/* Glow Background */}
                <div style={{
                  position: 'absolute',
                  inset: '-20px',
                  background: 'radial-gradient(circle at 30% 50%, rgba(46, 125, 50, 0.15) 0%, rgba(25, 118, 210, 0.08) 50%, transparent 100%)',
                  borderRadius: '2xl',
                  filter: 'blur(40px)',
                  zIndex: 0,
                  animation: 'floatGlow 6s ease-in-out infinite'
                }} />

                {/* Glass Card Container */}
                <div style={{
                  position: 'relative',
                  zIndex: 1,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(46, 125, 50, 0.1)',
                  borderRadius: '24px',
                  padding: '12px',
                  boxShadow: '0 20px 60px rgba(46, 125, 50, 0.12), inset 0 1px 2px rgba(255,255,255,0.8)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }} className="dashboard-card-hover">
                  <div style={{
                    borderRadius: '20px',
                    overflow: 'hidden',
                    background: '#f8f9fa'
                  }}>
                    <img 
                      src={dashboardHero} 
                      alt="Dashboard Preview" 
                      className="img-fluid"
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        minHeight: '300px',
                        objectFit: 'cover',
                        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    />
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ===================================
          FEATURES SECTION
          =================================== */}
      <section className="features-section-modern py-5 py-md-7 py-lg-8 bg-light">
        <Container fluid className="px-3 px-md-4 px-lg-5">
          <div className="text-center mb-5 mb-md-8">
            <h2 className="fw-bold mb-3 mb-md-4" style={{
              fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
              color: '#1a1a1a'
            }}>Why Choose Insyte Studio?</h2>
            <p className="text-muted mx-auto mb-0" style={{
              fontSize: 'clamp(1rem, 2vw, 1.15rem)',
              maxWidth: '600px',
              lineHeight: '1.6'
            }}>
              The most powerful and flexible dashboard builder in the industry.
            </p>
          </div>

          <Row className="g-3 g-md-4 g-lg-5">
            {[
              { 
                icon: 'bi-grid-3x3-gap-fill', 
                title: 'Responsive Grid', 
                desc: 'Adaptive 12/8/4-column grid system that reflows seamlessly across all devices.' 
              },
              { 
                icon: 'bi-lightning-fill', 
                title: 'Real-time Sync', 
                desc: 'Your data updates instantly across all connected devices and browsers.' 
              },
              { 
                icon: 'bi-palette-fill', 
                title: 'Custom Styling', 
                desc: 'Deeply customize every widget with your own colors, fonts, and layouts.' 
              },
              { 
                icon: 'bi-shield-lock-fill', 
                title: 'Enterprise Security', 
                desc: 'Bank-grade encryption and security ensures your data is always protected.' 
              }
            ].map((feature, i) => (
              <Col xs={12} sm={6} lg={3} key={i}>
                <div className="feature-card p-4 p-md-5 h-100" style={{
                  background: 'white',
                  border: '1px solid rgba(46, 125, 50, 0.1)',
                  borderRadius: '16px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.03) 0%, rgba(25, 118, 210, 0.02) 100%)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    zIndex: 0,
                    pointerEvents: 'none'
                  }} className="feature-card-glow" />
                  
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%)',
                      marginBottom: '1rem'
                    }}>
                      <i className={`bi ${feature.icon}`} style={{
                        fontSize: '1.5rem',
                        background: 'linear-gradient(135deg, #2e7d32 0%, #1976d2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }} />
                    </div>
                    <h5 className="fw-bold mb-2" style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}>
                      {feature.title}
                    </h5>
                    <p className="text-muted mb-0" style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1rem)' }}>
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ===================================
          GALLERY SECTION
          =================================== */}
      <section className="gallery-section-modern py-5 py-md-7 py-lg-8 bg-white">
        <Container fluid className="px-3 px-md-4 px-lg-5">
          <div className="text-center mb-5 mb-md-8">
            <h2 className="fw-bold mb-3 mb-md-4" style={{
              fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
              color: '#1a1a1a'
            }}>Studio Showcase</h2>
            <p className="text-muted mx-auto mb-0" style={{
              fontSize: 'clamp(1rem, 2vw, 1.15rem)',
              maxWidth: '600px'
            }}>
              Explore the diverse widgets and components available in Insyte Studio.
            </p>
          </div>

          <Row className="g-3 g-md-4">
            {galleryItems.map((img, i) => (
              <Col xs={6} md={4} key={i}>
                <OverlayTrigger
                  placement="top"
                  delay={{ show: 200, hide: 100 }}
                  overlay={
                    <Tooltip id={`tooltip-${i}`} style={{ maxWidth: '320px', fontSize: '0.85rem' }}>
                      {img.desc.map((line, idx) => (
                        <div key={idx}>{line}</div>
                      ))}
                    </Tooltip>
                  }
                >
                  <div className="gallery-item" style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(25, 118, 210, 0.03) 100%)',
                    border: '1px solid rgba(46, 125, 50, 0.1)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'visible'
                  }}>
                    <div style={{
                      position: 'relative',
                      height: '200px',
                      overflow: 'hidden',
                      borderRadius: '16px'
                    }}>
                      <img 
                        src={img.src} 
                        alt={img.title} 
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      />
                    </div>
                    <div style={{
                      padding: '1rem',
                      textAlign: 'center'
                    }}>
                      <p className="fw-bold text-muted mb-0" style={{
                        fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                        transition: 'color 0.3s ease'
                      }}>
                        {img.title}
                      </p>
                    </div>
                  </div>
                </OverlayTrigger>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ===================================
          CTA SECTION
          =================================== */}
      <section className="cta-section-modern py-5 py-md-7 py-lg-8">
        <Container fluid className="px-3 px-md-4 px-lg-5">
          <div className="cta-content p-5 p-md-7 p-lg-8 rounded-4" style={{
            background: 'linear-gradient(135deg, #2e7d32 0%, #1976d2 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(46, 125, 50, 0.2)'
          }}>
            {/* Animated background */}
            <div style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.05,
              background: 'radial-gradient(circle at 20% 80%, white 0%, transparent 50%)',
              pointerEvents: 'none',
              animation: 'floatBubble 8s ease-in-out infinite'
            }} />
            
            <Row className="align-items-center g-4 position-relative z-1">
              <Col xs={12} md={7}>
                <h2 className="fw-bold mb-3 mb-md-4" style={{
                  fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
                  color: 'white'
                }}>
                  Ready to build your dashboard?
                </h2>
                <p className="mb-4 mb-md-0" style={{
                  fontSize: 'clamp(1rem, 2vw, 1.15rem)',
                  color: 'rgba(255,255,255,0.9)',
                  lineHeight: '1.6'
                }}>
                  Join thousands of data-driven teams building custom dashboards with Insyte Studio.
                </p>
              </Col>
              <Col xs={12} md={5} className="d-flex gap-3 gap-md-4">
                <Button 
                  onClick={() => navigate('/signup')}
                  className="w-100"
                  style={{
                    padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                    fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
                    fontWeight: '600',
                    background: 'white',
                    color: '#2e7d32',
                    border: 'none',
                    borderRadius: '12px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer'
                  }}
                >
                  Get Started
                </Button>
                <Button 
                  onClick={() => navigate('/login')}
                  className="w-100"
                  style={{
                    padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                    fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
                    fontWeight: '600',
                    background: 'transparent',
                    color: 'white',
                    border: '1.5px solid white',
                    borderRadius: '12px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer'
                  }}
                >
                  Sign In
                </Button>
              </Col>
            </Row>
          </div>
        </Container>
      </section>

      {/* ===================================
          FOOTER
          =================================== */}
      <footer className="py-5 py-md-6 border-top bg-light">
        <Container fluid className="px-3 px-md-4 px-lg-5">
          <Row className="g-4 g-md-5 mb-4 mb-md-5">
            <Col xs={12} md={5}>
              <h5 className="fw-bold text-primary mb-2 mb-md-3" style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}>
                Insyte
              </h5>
              <p className="text-muted small" style={{ 
                maxWidth: '300px',
                fontSize: 'clamp(0.9rem, 1.5vw, 1rem)',
                lineHeight: '1.6'
              }}>
                Empowering teams with visual data intelligence. The future of dashboard building is here.
              </p>
            </Col>
            <Col xs={6} md={3}>
              <h6 className="fw-bold text-uppercase mb-3" style={{ fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)', letterSpacing: '0.05em' }}>
                Product
              </h6>
              <ul className="list-unstyled">
                <li className="mb-2" style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1rem)' }}>
                  <a href="#" className="text-muted text-decoration-none hover-text-primary">Features</a>
                </li>
                <li className="mb-2" style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1rem)' }}>
                  <a href="#" className="text-muted text-decoration-none hover-text-primary">Templates</a>
                </li>
                <li style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1rem)' }}>
                  <a href="#" className="text-muted text-decoration-none hover-text-primary">Pricing</a>
                </li>
              </ul>
            </Col>
            <Col xs={6} md={3}>
              <h6 className="fw-bold text-uppercase mb-3" style={{ fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)', letterSpacing: '0.05em' }}>
                Company
              </h6>
              <ul className="list-unstyled">
                <li className="mb-2" style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1rem)' }}>
                  <a href="#" className="text-muted text-decoration-none hover-text-primary">About</a>
                </li>
                <li className="mb-2" style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1rem)' }}>
                  <a href="#" className="text-muted text-decoration-none hover-text-primary">Blog</a>
                </li>
                <li style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1rem)' }}>
                  <a href="#" className="text-muted text-decoration-none hover-text-primary">Contact</a>
                </li>
              </ul>
            </Col>
          </Row>
          <hr className="my-0 border-light" />
          <div className="mt-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 gap-md-4">
            <small className="text-muted" style={{ fontSize: '0.85rem' }}>
              © 2026 Insyte Studio. All rights reserved.
            </small>
            <div className="d-flex gap-3 gap-md-4">
              <a href="#" className="text-muted text-decoration-none hover-text-primary transition-all">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="#" className="text-muted text-decoration-none hover-text-primary transition-all">
                <i className="bi bi-linkedin"></i>
              </a>
              <a href="#" className="text-muted text-decoration-none hover-text-primary transition-all">
                <i className="bi bi-github"></i>
              </a>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
export default Home;
