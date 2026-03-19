import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form } from 'react-bootstrap';
import axios from 'axios';

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/users/login', formData);
      onLogin(response.data);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      if (msg === 'Invalid credentials' || msg.includes('not found')) {
        setError(
          <>
            User not found. Would you like to <span className="text-decoration-underline fw-bold" style={{ cursor: 'pointer' }} onClick={() => navigate('/signup')}>Sign Up</span> instead?
          </>
        );
      } else {
        setError(msg);
      }
    }
  };

  return (
    <div className="auth-wrapper d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f7f4 0%, #e3f2fd 100%)' }}>
      <Container fluid className="px-3 px-md-0">
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={5} className="w-100">
            <div className="glass-card p-4 p-md-5 hover-shadow transition-all" style={{ maxWidth: '480px', margin: '0 auto', width: '100%' }}>
              <div className="text-center mb-4 mb-md-5">
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                  <i className="bi bi-shield-lock text-primary fs-3"></i>
                </div>
                <h2 className="fw-bold mb-1" style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}>Welcome back</h2>
                <p className="text-muted mb-0" style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Log in to your Insyte account to continue.</p>
              </div>
              {error && <div className="alert alert-danger py-2 small mb-4">{error}</div>}
              <Form onSubmit={handleSubmit}>
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
                <Form.Group className="mb-4 mb-md-5">
                  <Form.Label className="fw-medium">Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="Enter your password" 
                    className="py-2 py-md-3 px-3 px-md-4 border-light shadow-sm"
                    style={{ borderRadius: '12px', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required 
                  />
                </Form.Group>
                <button type="submit" className="btn-premium w-100 py-2 py-md-3 fs-6 mb-4" style={{ minHeight: '44px' }}>
                  Log In
                </button>
              </Form>
              <div className="text-center">
                <p className="text-muted mb-0" style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>
                  Don't have an account? <span className="text-primary fw-bold cursor-pointer hover-lift d-inline-block" style={{ cursor: 'pointer' }} onClick={() => navigate('/signup')}>Sign Up</span>
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Login;