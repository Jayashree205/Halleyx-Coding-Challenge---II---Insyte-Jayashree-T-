import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Container, Row, Col, Button, Modal, Form, Table, Card, Badge, Dropdown, InputGroup, Alert } from 'react-bootstrap';
import OrderModal from '../components/OrderModal.jsx';

function OrderManagement({ user }) {
  const [orders, setOrders] = useState([]);
  const [dashboards, setDashboards] = useState([]);
  const [selectedDashboardId, setSelectedDashboardId] = useState('new');
  const [users, setUsers] = useState([]);
  const [show, setShow] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [formValidated, setFormValidated] = useState(false);
  const [searchCountry, setSearchCountry] = useState('');
  const [successAlert, setSuccessAlert] = useState(null);
  const [customProduct, setCustomProduct] = useState('');
  const [showCustomProductInput, setShowCustomProductInput] = useState(false);
  const [formData, setFormData] = useState({
    customer: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: { street: '', city: '', state: '', postalCode: '', country: '' },
    },
    order: { product: '', quantity: 1, unitPrice: 0, status: 'Pending', createdBy: user?.username || '', currency: 'USD' },
  });

  const [dashboardMode, setDashboardMode] = useState(null);

  useEffect(() => {
    const dm = sessionStorage.getItem('dashboardMode');
    if (dm) {
        setDashboardMode(dm);
        if (dm === 'create') {
            setSelectedDashboardId('new');
        }
    }
  }, []);

  const countriesList = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", 
    "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", 
    "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", 
    "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", 
    "Croatia", "Cuba", "Cyprus", "Czech Republic", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", 
    "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", 
    "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", 
    "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", 
    "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", 
    "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", 
    "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", 
    "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", 
    "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", 
    "Palau", "Palestine (observer)", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", 
    "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", 
    "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", 
    "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", 
    "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", 
    "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City (Holy See)", 
    "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
  ];

  const currencies = [
    { code: 'USD', symbol: '$', name: 'USA - Dollar' },
    { code: 'EUR', symbol: '€', name: 'Europe - Euro' },
    { code: 'GBP', symbol: '£', name: 'UK - Pound' },
    { code: 'INR', symbol: '₹', name: 'India - Rupee' },
    { code: 'JPY', symbol: '¥', name: 'Japan - Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canada - Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australia - Dollar' },
  ];

  const products = [
    "Honey", "Groceries", "Organic Eggs", "Fresh Milk", "Whole Wheat Bread", "Snacks Pack", "Vitamins", "Energy Drinks", 
    "Fiber Internet 300 Mbps", "5GUnlimited Mobile Plan", "Fiber Internet 1 Gbps", "Business Internet 500 Mbps", "VoIP Corporate Package", 
    "Make your own product"
  ];
  const statuses = ["Pending", "In Progress", "Completed"];

  useEffect(() => {
    fetchOrders();
    fetchUsers();
    fetchDashboards();
  }, []);

  useEffect(() => {
    // If a row is selected, ensure it is visible for the user.
    const selectedId = selectedOrderIds[0];
    if (selectedId) {
      const row = document.getElementById(`order-row-${selectedId}`);
      row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedOrderIds, orders]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders');
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchDashboards = async () => {
    try {
      const userId = user?._id || JSON.parse(sessionStorage.getItem('user'))?._id;
      const res = await axios.get(`/api/dashboards${userId ? `?userId=${userId}` : ''}`);
      setDashboards(res.data || []);
    } catch (err) {
      console.error("Error fetching dashboards:", err);
    }
  };

  const handleSubmit = async (e) => {
    const form = e.currentTarget;
    e.preventDefault();
    
    if (!formData.customer.email || !formData.customer.phone || form.checkValidity() === false) {
      e.stopPropagation();
      setFormValidated(true);
      return;
    }

    let finalProduct = formData.order.product;
    if (showCustomProductInput && customProduct) {
        finalProduct = customProduct;
    }

    const payload = { 
        ...formData, 
        order: { 
            ...formData.order, 
            product: finalProduct,
            totalAmount: formData.order.quantity * formData.order.unitPrice 
        } 
    };

    try {
      let result;
      if (editingOrder) {
        result = await axios.put(`/api/orders/${editingOrder._id}`, payload);
      } else {
        result = await axios.post('/api/orders', payload);
      }
      
      const orderId = result.data.data?._id || result.data._id || '0001';
      setSuccessAlert(`Nice work! Your new order "ORD-${orderId.substring(orderId.length - 4).toUpperCase()}" is now in the list!`);
      
      fetchOrders();
      setShow(false);
      resetForm();
      
      setTimeout(() => setSuccessAlert(null), 5000);
    } catch (err) { console.error("Error saving order:", err); }
  };

  const resetForm = () => {
    setFormData({
      customer: { firstName: '', lastName: '', email: '', phone: '', address: { street: '', city: '', state: '', postalCode: '', country: '' } },
      order: { product: '', quantity: 1, unitPrice: 0, status: 'Pending', createdBy: user?.username || '', currency: 'USD' },
    });
    setEditingOrder(null);
    setFormValidated(false);
    setSearchCountry('');
    setCustomProduct('');
    setShowCustomProductInput(false);
  };

  const handleProductChange = (e) => {
    const val = e.target.value;
    if (val === 'Make your own product') {
        setShowCustomProductInput(true);
    } else {
        setShowCustomProductInput(false);
    }
    setFormData({...formData, order: {...formData.order, product: val}});
  };

  const filteredCountries = useMemo(() => {
    return countriesList.filter(c => c.toLowerCase().includes(searchCountry.toLowerCase()));
  }, [searchCountry]);

  const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options = { month: 'short', day: '2-digit', year: 'numeric' };
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    return date.toLocaleDateString('en-US', options);
  };

  const getCurrencySymbol = (code) => currencies.find(c => c.code === code)?.symbol || '$';

  return (
    <Container className="py-5">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4 gap-3">
        <div>
          <h1 className="fw-bold mb-1">Customer Orders</h1>
          <p className="text-muted mb-0 small">View and manage customer orders and details. Select orders to add to your dashboard.</p>
        </div>

          {successAlert && (
              <Alert variant="success" className="mb-0 flex-grow-1 mx-lg-4 d-flex justify-content-between align-items-center py-2 px-3 border-0 transition-all shadow-sm mx-0 w-100" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>
                  <span className="small fw-medium">{successAlert}</span>
                  <Button variant="link" className="p-0 text-success text-decoration-none" onClick={() => setSuccessAlert(null)}>
                      <i className="bi bi-x-lg small font-weight-bold"></i>
                  </Button>
              </Alert>
          )}

          <div className="d-flex flex-wrap gap-2 w-100 w-lg-auto">
            <Button className="btn-success px-4 flex-grow-1 flex-md-grow-0" style={{ borderRadius: '8px' }} onClick={() => { resetForm(); setShow(true); }}>
              <i className="bi bi-plus-lg me-2"></i>Create order
            </Button>
            <Button
              variant="outline-primary"
              className="px-4 flex-grow-1 flex-md-grow-0"
              disabled={selectedOrderIds.length !== 1}
              onClick={() => {
                if (selectedOrderIds.length !== 1) return;
                const order = orders.find(o => o._id === selectedOrderIds[0]);
                if (order) {
                  setEditingOrder(order);
                  setFormData(order);
                  setShow(true);
                }
              }}
            >
              <i className="bi bi-pencil me-2"></i>Edit selected
            </Button>
            <Button
              variant="outline-danger"
              className="px-4"
              disabled={selectedOrderIds.length !== 1}
              onClick={async () => {
                if (selectedOrderIds.length !== 1) return;
                if (!window.confirm('Delete selected order?')) return;
                try {
                  await axios.delete(`/api/orders/${selectedOrderIds[0]}`);
                  setSelectedOrderIds([]);
                  fetchOrders();
                } catch (err) {
                  console.error('Error deleting order:', err);
                }
              }}
            >
              <i className="bi bi-trash me-2"></i>Delete selected
            </Button>
            <Dropdown className="px-0">
              <Dropdown.Toggle
                variant={dashboardMode === 'create' ? "success" : "outline-success"}
                className="px-4 fw-bold"
                disabled={selectedOrderIds.length === 0}
              >
                <i className={`bi ${dashboardMode === 'create' ? 'bi-plus-circle-fill' : 'bi-graph-up'} me-2`}></i>
                {dashboardMode === 'create' ? 'Add Order(s) to New Dashboard' : 'Add to Dashboard'} ({selectedOrderIds.length} selected)
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item disabled>Select target dashboard</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                  active={selectedDashboardId === 'new'}
                  onClick={() => setSelectedDashboardId('new')}
                >
                  + Create New Dashboard
                </Dropdown.Item>
                {dashboards.map(d => (
                  <Dropdown.Item
                    key={d._id}
                    active={selectedDashboardId === d._id}
                    onClick={() => setSelectedDashboardId(d._id)}
                  >
                    {d.name}
                  </Dropdown.Item>
                ))}
                <Dropdown.Divider />
                <Dropdown.Item
                  className="text-primary fw-bold"
                  onClick={() => {
                    const selectedIds = orders
                      .filter(o => selectedOrderIds.includes(o._id))
                      .map(o => o._id)
                      .filter(Boolean);
                    if (selectedIds.length === 0) return;

                    sessionStorage.setItem('dashboardOrderIds', Array.from(new Set(selectedIds)).join(','));
                    if (selectedDashboardId && selectedDashboardId !== 'new') {
                      sessionStorage.setItem('dashboardId', selectedDashboardId);
                    } else {
                      sessionStorage.removeItem('dashboardId');
                    }
                    
                    // Clear the mode after confirming
                    sessionStorage.removeItem('dashboardMode');
                    window.location.hash = '#/dashboard';
                  }}
                >
                  <i className="bi bi-check-circle-fill me-2"></i>
                  Confirm and Go to Dashboard
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            {dashboardMode === 'create' && selectedOrderIds.length > 0 && (
                <Button 
                    variant="success" 
                    className="px-4 fw-bold animate-pulse" 
                    style={{ borderRadius: '8px', boxShadow: '0 4px 15px rgba(25, 135, 84, 0.3)' }}
                    onClick={() => {
                        const selectedIds = orders
                          .filter(o => selectedOrderIds.includes(o._id))
                          .map(o => o._id)
                          .filter(Boolean);
                        
                        sessionStorage.setItem('dashboardOrderIds', Array.from(new Set(selectedIds)).join(','));
                        sessionStorage.removeItem('dashboardId');
                        sessionStorage.removeItem('dashboardMode');
                        window.location.hash = '#/dashboard';
                    }}
                >
                    <i className="bi bi-check-lg me-2"></i>
                    Finish & Create Dashboard
                </Button>
            )}
          </div>
        </div>

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-3">
          <div className="d-flex align-items-center gap-2 pb-2 text-primary border-bottom border-primary border-3 w-100 w-md-auto" style={{ fontSize: '0.9rem', fontWeight: '600' }}>
            <i className="bi bi-table"></i> Orders Table
          </div>
          <div className="position-relative w-100 search-container-mobile">
            <i className="bi bi-search position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}></i>
            <Form.Control type="text" placeholder="Search" className="ps-5 border-light bg-light bg-opacity-50 w-100" style={{ borderRadius: '20px' }} />
          </div>
        </div>

      <Card className="shadow-sm border-light" style={{ borderRadius: '4px' }}>
        <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <Table hover className="mb-0 align-middle" style={{ minWidth: '1800px' }}>
            <thead className="bg-light bg-opacity-50 border-bottom border-light">
                <tr>
                          <th className="py-3 px-4 fw-medium text-muted small text-nowrap">Select</th>
                    <th className="py-3 px-4 fw-medium text-muted small text-nowrap">S.no</th>
                    <th className="py-3 fw-medium text-muted small text-nowrap">Customer ID</th>
                    <th className="py-3 fw-medium text-muted small text-nowrap">Customer name</th>
                    <th className="py-3 fw-medium text-muted small text-nowrap">Email id</th>
                    <th className="py-3 fw-medium text-muted small text-nowrap">Phone number</th>
                    <th className="py-3 fw-medium text-muted small text-nowrap">Address</th>
                    <th className="py-3 fw-medium text-muted small text-nowrap">Order ID</th>
                    <th className="py-3 fw-medium text-muted small text-nowrap">Order date</th>
                    <th className="py-3 fw-medium text-muted small text-nowrap">Product(s)</th>
                    <th className="py-3 fw-medium text-muted small text-nowrap">Total Qty</th>
                    <th className="py-3 fw-medium text-muted small text-nowrap">Total Batches</th>
                    <th className="py-3 fw-medium text-muted small text-nowrap">Unit price</th>
                    <th className="py-3 fw-medium text-muted small text-nowrap">Total amount</th>
                    <th className="py-3 fw-medium text-muted small text-nowrap">Status</th>
                    <th className="py-3 fw-medium text-muted small text-nowrap">Created by</th>
                    <th className="py-3 text-center"><i className="bi bi-three-dots-vertical text-muted"></i></th>
                </tr>
            </thead>
            <tbody>
                {orders.map((order, idx) => (
                <tr
                  id={`order-row-${order._id}`}
                  key={order._id}
                    className={`border-bottom border-light ${selectedOrderIds.includes(order._id) ? 'bg-primary bg-opacity-10' : ''}`}
                >
                    <td className="px-4 text-center">
                      <Form.Check
                        type="checkbox"
                        name="selectedOrder"
                        checked={selectedOrderIds.includes(order._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOrderIds(prev => [...prev, order._id]);
                          } else {
                            setSelectedOrderIds(prev => prev.filter(id => id !== order._id));
                          }
                        }}
                      />
                    </td>
                    <td className="px-4 text-muted small">{idx + 1}</td>
                    <td className="text-muted small">CUST-{order._id.substring(order._id.length - 4).toUpperCase()}</td>
                    <td className="fw-medium small">{order.customer.firstName} {order.customer.lastName}</td>
                    <td className="text-muted small">{order.customer.email}</td>
                    <td className="text-muted small">{order.customer.phone}</td>
                    <td className="text-muted small text-truncate" style={{ maxWidth: '250px' }}>
                        {order.customer.address.street}, {order.customer.address.city}, {order.customer.address.country}
                    </td>
                    <td className="text-muted small">ORD-{order._id.substring(order._id.length - 4).toUpperCase()}</td>
                    <td className="text-muted small">{formatDate(order.createdAt, true)}</td>
                    <td className="fw-medium small py-2" style={{ minWidth: '150px' }}>
                      {order.order.items && order.order.items.length > 0 ? (
                        <div className="d-flex flex-column gap-1">
                          {order.order.items.map((i, idx) => (
                            <span key={idx} className="badge bg-light text-dark border text-start fw-normal text-wrap text-break" style={{ fontSize: '0.75rem' }}>
                              {i.quantity}x {i.product}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="badge bg-light text-dark border text-start fw-normal text-wrap text-break" style={{ fontSize: '0.75rem' }}>
                          {order.order.quantity}x {order.order.product}
                        </span>
                      )}
                    </td>
                    <td className="text-center small">
                      {order.order.items && order.order.items.length > 0 
                        ? order.order.items.reduce((acc, i) => acc + i.quantity, 0)
                        : order.order.quantity}
                    </td>
                    <td className="text-center small">
                      {order.order.items && order.order.items.length > 0 
                        ? order.order.items.reduce((acc, i) => acc + (i.batches || 1), 0)
                        : 1}
                    </td>
                    <td className="text-muted small">
                      {order.order.items && order.order.items.length > 1 
                        ? 'Varies' 
                        : `${getCurrencySymbol(order.order.currency)}${Number(order.order.items?.[0]?.unitPrice || order.order.unitPrice || 0).toFixed(2)}`}
                    </td>
                    <td className="text-muted small">{getCurrencySymbol(order.order.currency)}{Number(order.order.totalAmount || 0).toFixed(2)}</td>
                    <td>
                        <Badge 
                            bg={order.order.status === 'Completed' ? 'success' : order.order.status === 'In Progress' ? 'info' : 'warning'} 
                            className="px-3 py-1 fw-medium"
                            style={{ borderRadius: '20px', fontSize: '0.75rem' }}
                        >
                            {order.order.status}
                        </Badge>
                    </td>
                    <td className="text-muted small">{order.order.createdBy}</td>
                    <td className="px-3 text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="p-0"
                          title="Edit"
                          onClick={() => {
                            setSelectedOrderIds([order._id]);
                            setEditingOrder(order);
                            setFormData(order);
                            if (!products.filter(p => p !== "Make your own product").includes(order.order.product)) {
                                setShowCustomProductInput(true);
                                setCustomProduct(order.order.product);
                                setFormData(prev => ({...prev, order: {...prev.order, product: "Make your own product"}}));
                            } else {
                                setShowCustomProductInput(false);
                                setCustomProduct('');
                            }
                            setShow(true);
                          }}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="p-0"
                          title="Delete"
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this order?')) {
                              await axios.delete(`/api/orders/${order._id}`);
                              setSelectedOrderIds(prev => prev.filter(id => id !== order._id));
                              fetchOrders();
                            }
                          }}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </Table>
        </div>
      </Card>
      
      <div className="mt-3 text-end">
          <p className="text-muted small">This is a horizontal scroll. After scrolling, you can see additional content on the right-hand side. Please check.</p>
      </div>

      <OrderModal 
        show={show} 
        onHide={() => setShow(false)} 
        order={editingOrder} 
        onSuccess={(type) => {
            const orderId = editingOrder?._id || '0001';
            setSuccessAlert(`Nice work! Your order ${type === 'updated' ? 'update' : '"ORD-' + orderId.substring(orderId.length - 4).toUpperCase() + '"'} is now in the list!`);
            fetchOrders();
            setTimeout(() => setSuccessAlert(null), 5000);
        }}
        user={user}
        users={users}
      />
    </Container>
  );
}

export default OrderManagement;