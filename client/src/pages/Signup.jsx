import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form } from 'react-bootstrap';
import axios from 'axios';

function Signup({ onSignup }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    try {
      const response = await axios.post('/api/users/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      onSignup(response.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred during signup');
    }
  };

  return (
    <div className="auth-wrapper d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f2fd 0%, #f0f7f4 100%)' }}>
      <Container fluid className="px-3 px-md-0">
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={5} className="w-100">
            <div className="glass-card p-4 p-md-5 hover-shadow transition-all">
              <div className="text-center mb-4 mb-md-5">
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                  <i className="bi bi-person-plus text-primary fs-3"></i>
                </div>
                <h2 className="fw-bold mb-1" style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}>Create Account</h2>
                <p className="text-muted mb-0" style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Join Insyte Studio and build your first dashboard.</p>
              </div>
              {error && <div className="alert alert-danger py-2 small mb-4">{error}</div>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3 mb-md-4">
                  <Form.Label className="fw-medium">Full Name</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Enter your name" 
                    className="py-2 py-md-3 px-3 px-md-4 border-light shadow-sm"
                    style={{ borderRadius: '12px', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    required 
                  />
                </Form.Group>
                <Form.Group className="mb-3 mb-md-4">
                  <Form.Label className="fw-medium">Email Address</Form.Label>
                  <Form.Control 
                    type="email" 
                    placeholder="name@example.com" 
                    className="py-2 py-md-3 px-3 px-md-4 border-light shadow-sm"
                    style={{ borderRadius: '12px', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required 
                  />
                </Form.Group>
                <Form.Group className="mb-3 mb-md-4">
                  <Form.Label className="fw-medium">Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="Create a strong password" 
                    className="py-2 py-md-3 px-3 px-md-4 border-light shadow-sm"
                    style={{ borderRadius: '12px', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required 
                  />
                </Form.Group>
                <Form.Group className="mb-4 mb-md-5">
                  <Form.Label className="fw-medium">Confirm Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="Repeat your password" 
                    className="py-2 py-md-3 px-3 px-md-4 border-light shadow-sm"
                    style={{ borderRadius: '12px', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    required 
                  />
                </Form.Group>
                <button type="submit" className="btn-premium w-100 py-2 py-md-3 fs-6 mb-4" style={{ minHeight: '44px' }}>
                  Create Account
                </button>
              </Form>
              <div className="text-center">
                <p className="text-muted mb-0" style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>
                  Already have an account? <span className="text-primary fw-bold cursor-pointer hover-lift d-inline-block" style={{ cursor: 'pointer' }} onClick={() => navigate('/login')}>Log In</span>
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Signup;
