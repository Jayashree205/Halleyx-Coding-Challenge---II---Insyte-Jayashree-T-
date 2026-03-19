import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Profile({ user, onUpdateProfile }) {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    jobTitle: user?.jobTitle || 'Full Stack Engineer',
    bio: user?.bio || 'Building custom dashboard solutions with precision and style.',
    company: user?.company || 'Insyte Studio',
    location: user?.location || 'San Francisco, CA'
  });
  const [dashboards, setDashboards] = useState([]);
  const [showStatus, setShowStatus] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchDashboards = React.useCallback(async () => {
    try {
      const response = await axios.get(`/api/dashboards?userId=${user._id}`);
      setDashboards(response.data);
    } catch (err) {
      console.error("Failed to fetch dashboards", err);
    }
  }, [user?._id]);

  useEffect(() => {
    if (user?._id) {
      fetchDashboards();
    }
  }, [user?._id, fetchDashboards]);

  const isFirstSetup = !user?._id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put('/api/users/profile', formData);
      onUpdateProfile(response.data);
      setShowStatus(true);
      setError('');
      setTimeout(() => setShowStatus(false), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleDeleteDashboard = async (id) => {
    if (window.confirm('Are you sure you want to delete this dashboard?')) {
      try {
        await axios.delete(`/api/dashboards/${id}`);
        setDashboards(dashboards.filter(d => d._id !== id));
        // Add a temp success message
        setShowStatus(true);
        setTimeout(() => setShowStatus(false), 3000);
      } catch (err) {
        setError('Failed to delete dashboard');
      }
    }
  };

  const handleCreateDashboard = () => {
    navigate('/dashboard/configure/new');
  };

  return (
    <div className="profile-page min-vh-100 py-5" style={{ background: 'linear-gradient(135deg, #f8faff 0%, #eef2f7 100%)' }}>
      <Container>
        <Row className="justify-content-center">
          <Col lg={10}>
            {/* Header Section */}
            <div className="d-flex align-items-center justify-content-between mb-5 animate-fade-in">
              <div className="d-flex align-items-center gap-4">
                <div className="profile-avatar-wrapper shadow-lg rounded-circle overflow-hidden bg-white p-1" style={{ width: '100px', height: '100px' }}>
                  <div className="bg-primary h-100 w-100 rounded-circle d-flex align-items-center justify-content-center">
                    <i className="bi bi-person text-white fs-1"></i>
                  </div>
                </div>
                <div>
                  <h1 className="fw-bold mb-1 text-dark">Profile Settings</h1>
                  <p className="text-muted mb-0">Manage your account and personalized dashboards</p>
                </div>
              </div>
              <Button 
                onClick={handleCreateDashboard} 
                className="btn-premium px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
                disabled={!user?._id}
              >
                <i className="bi bi-plus-lg"></i> New Dashboard
              </Button>
            </div>

            {showStatus && (
              <Alert variant="success" className="glass-card border-success text-success mb-4 animate-slide-up">
                {user?._id ? 'Profile saved! You are now connected to MongoDB and can manage dashboards.' : 'Setup complete! Initializing your workspace...'}
              </Alert>
            )}
            {error && <Alert variant="danger" className="glass-card border-danger text-danger mb-4 animate-slide-up font-monospace small">{error}</Alert>}

            <Row>
              <Col lg={7}>
                <Form onSubmit={handleSubmit}>
                  <Card className="glass-card border-0 p-4 mb-4 shadow-sm hover-lift transition-all">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-primary-soft p-2 rounded-3">
                        <i className="bi bi-person-lines-fill text-primary fs-5"></i>
                      </div>
                      <h5 className="fw-bold mb-0">Personal Information</h5>
                    </div>
                    
                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Label className="small fw-bold text-muted">FULL NAME</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={formData.username}
                          onChange={(e) => setFormData({...formData, username: e.target.value})}
                          className="premium-input"
                          placeholder="John Doe"
                        />
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Label className="small fw-bold text-muted">EMAIL ADDRESS</Form.Label>
                        <Form.Control 
                          type="email" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="premium-input"
                          placeholder="john@example.com"
                        />
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Label className="small fw-bold text-muted">JOB TITLE</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={formData.jobTitle}
                          onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                          className="premium-input"
                          placeholder="Lead Designer"
                        />
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Label className="small fw-bold text-muted">COMPANY</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={formData.company}
                          onChange={(e) => setFormData({...formData, company: e.target.value})}
                          className="premium-input"
                          placeholder="Tech Corp"
                        />
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold text-muted">BIO</Form.Label>
                      <Form.Control 
                        as="textarea" 
                        rows={3} 
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        className="premium-input"
                        placeholder="Short description about you..."
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold text-muted">LOCATION</Form.Label>
                      <Form.Control 
                        type="text" 
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="premium-input"
                        placeholder="City, Country"
                      />
                    </Form.Group>

                    <div className="d-flex justify-content-end mt-4">
                      <Button type="submit" className="btn-premium px-5 py-2 fw-bold shadow-sm">
                        {isFirstSetup ? 'Save & Initialize Studio' : 'Update Global Profile'}
                      </Button>
                    </div>
                  </Card>
                </Form>
              </Col>

              <Col lg={5}>
                <Card className="glass-card border-0 p-4 shadow-sm hover-lift transition-all sticky-top" style={{ top: '100px' }}>
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center gap-2">
                      <div className="bg-secondary-soft p-2 rounded-3">
                        <i className="bi bi-grid-1x2-fill text-secondary fs-5"></i>
                      </div>
                      <h5 className="fw-bold mb-0">My Dashboards</h5>
                    </div>
                    <Badge bg="light" text="dark" className="rounded-pill px-3 py-2 border shadow-sm">
                      {dashboards.length} Active
                    </Badge>
                  </div>

                    <div className="dashboard-list d-flex flex-column gap-3 overflow-auto" style={{ maxHeight: '500px' }}>
                      {!user?._id ? (
                        <div className="text-center py-5 bg-light rounded-4 border-dashed border-primary">
                          <i className="bi bi-shield-lock display-4 text-primary mb-3 d-block"></i>
                          <h6 className="fw-bold">Profile Setup Required</h6>
                          <p className="text-muted small px-3">Please save your profile information first to enable dashboard management.</p>
                          <Button variant="primary" size="sm" className="rounded-pill px-4" onClick={() => document.querySelector('form').scrollIntoView({ behavior: 'smooth' })}>
                            Update Profile Above
                          </Button>
                        </div>
                      ) : dashboards.length === 0 ? (
                        <div className="text-center py-5 bg-light rounded-4 border-dashed">
                          <i className="bi bi-layout-text-window-reverse display-4 text-muted mb-3 d-block"></i>
                          <p className="text-muted mb-3">No dashboards found</p>
                          <Button variant="outline-primary" size="sm" onClick={handleCreateDashboard} className="rounded-pill px-4">
                            Create Your First
                          </Button>
                        </div>
                      ) : (
                        dashboards.map((db) => (
                          <div key={db._id} className="dashboard-item-card p-3 rounded-4 bg-white border shadow-sm transition-all hover-shadow d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-3">
                              <div className="dashboard-icon bg-light rounded-3 p-2 text-primary">
                                <i className="bi bi-window-sidebar fs-4"></i>
                              </div>
                              <div>
                                <h6 className="fw-bold mb-0 text-dark">{db.name || 'Untitled Dashboard'}</h6>
                                <div className="d-flex align-items-center gap-2 mt-1">
                                  <small className="text-muted">{db.layout?.length || 0} {db.layout?.length === 1 ? 'Widget' : 'Widgets'}</small>
                                  <span className="text-light-gray opacity-25">•</span>
                                  <small className="text-muted">
                                    <i className="bi bi-clock-history me-1"></i>
                                    {db.updatedAt ? new Date(db.updatedAt).toLocaleDateString() : (db.createdAt ? new Date(db.createdAt).toLocaleDateString() : 'Just now')}
                                  </small>
                                </div>
                              </div>
                            </div>
                            <div className="d-flex gap-2">
                              <Button 
                                variant="light" 
                                size="sm" 
                                onClick={() => navigate(`/dashboard/configure/${db._id}`)}
                                className="rounded-circle p-2 shadow-sm"
                                title="Edit"
                              >
                                <i className="bi bi-pencil text-primary"></i>
                              </Button>
                              <Button 
                                variant="light" 
                                size="sm" 
                                onClick={() => handleDeleteDashboard(db._id)}
                                className="rounded-circle p-2 shadow-sm"
                                title="Delete"
                              >
                                <i className="bi bi-trash text-danger"></i>
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>

      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.4) !important;
        }
        .premium-input {
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 12px;
          padding: 10px 15px;
          transition: all 0.3s ease;
        }
        .premium-input:focus {
          background: white;
          border-color: #54bd95;
          box-shadow: 0 0 0 4px rgba(84, 189, 149, 0.1);
        }
        .bg-primary-soft { background: rgba(84, 189, 149, 0.1); }
        .bg-secondary-soft { background: rgba(108, 117, 125, 0.1); }
        .hover-lift:hover { transform: translateY(-5px); }
        .dashboard-item-card:hover {
          border-color: #54bd95;
          background: #f8fffb;
        }
        .animate-fade-in { animation: fadeIn 0.8s ease-out; }
        .animate-slide-up { animation: slideUp 0.6s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

export default Profile;
