import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup, Card } from 'react-bootstrap';
import axios from 'axios';

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
  "Fiber Internet 300 Mbps", "5GUnlimited Mobile Plan", "Fiber Internet 1 Gbps", "Business Internet 500 Mbps", "VoIP Corporate Package"
];
const statuses = ["Pending", "In Progress", "Completed"];

function OrderModal({ show, onHide, order, onSuccess, user, users }) {
  const [formValidated, setFormValidated] = useState(false);
  const [searchCountry, setSearchCountry] = useState('');
  const [formData, setFormData] = useState({
    customer: {
      firstName: '', lastName: '', email: '', phone: '', 
      address: { street: '', city: '', state: '', postalCode: '', country: '' },
    },
    order: { 
      items: [{ product: '', quantity: 1, unitPrice: 0, batches: 1 }], 
      status: 'Pending', createdBy: '', currency: 'USD' 
    },
  });

  useEffect(() => {
    if (order) {
      let migratedOrder = { ...order };
      // Migrate legacy product format to items array
      if (!migratedOrder.order.items || migratedOrder.order.items.length === 0) {
        migratedOrder.order.items = [{
          product: migratedOrder.order.product || '',
          quantity: migratedOrder.order.quantity || 1,
          unitPrice: migratedOrder.order.unitPrice || 0,
          batches: 1
        }];
      }
      setFormData(migratedOrder);
    } else {
      setFormData({
        customer: { firstName: '', lastName: '', email: '', phone: '', address: { street: '', city: '', state: '', postalCode: '', country: '' } },
        order: { items: [{ product: '', quantity: 1, unitPrice: 0, batches: 1 }], status: 'Pending', createdBy: user?.username || '', currency: 'USD' },
      });
    }
    setFormValidated(false);
  }, [order, user]);

  const handleSubmit = async (e) => {
    const form = e.currentTarget;
    e.preventDefault();
    if (!formData.customer.email || !formData.customer.phone || form.checkValidity() === false) {
      e.stopPropagation();
      setFormValidated(true);
      return;
    }

    // Process items to add totalAmount
    const processedItems = formData.order.items.map(item => {
        const qty = parseInt(item.quantity) || 1;
        const btc = parseInt(item.batches) || 1;
        const price = parseFloat(item.unitPrice) || 0;
        return {
            ...item,
            quantity: qty,
            batches: btc,
            unitPrice: price,
            totalAmount: qty * price
        };
    });

    const payload = { 
        ...formData, 
        userId: user?._id || JSON.parse(sessionStorage.getItem('user'))?._id,
        order: { 
            ...formData.order, 
            items: processedItems,
            totalAmount: processedItems.reduce((acc, item) => acc + item.totalAmount, 0)
        } 
    };

    try {
      if (order?._id) {
        await axios.put(`/api/orders/${order._id}`, payload);
      } else {
        await axios.post('/api/orders', payload);
      }
      onSuccess(order?._id ? 'updated' : 'created');
      onHide();
    } catch (err) { console.error("Error saving order:", err); }
  };

  const filteredCountries = useMemo(() => {
    return countriesList.filter(c => c.toLowerCase().includes(searchCountry.toLowerCase()));
  }, [searchCountry]);

  const getCurrencySymbol = (code) => currencies.find(c => c.code === code)?.symbol || '$';

  const updateItem = (index, field, value) => {
    const newItems = [...formData.order.items];
    newItems[index][field] = value;
    setFormData({...formData, order: {...formData.order, items: newItems}});
  };

  const addItem = () => {
    const newItems = [...formData.order.items, { product: '', quantity: 1, unitPrice: 0, batches: 1 }];
    setFormData({...formData, order: {...formData.order, items: newItems}});
  };

  const removeItem = (index) => {
    const newItems = formData.order.items.filter((_, i) => i !== index);
    setFormData({...formData, order: {...formData.order, items: newItems}});
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered backdrop="static" style={{ zIndex: 1056 }}>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold fs-4 ms-2">{order ? 'Edit Order' : 'Create order'}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4 p-lg-5">
        <Form noValidate validated={formValidated} onSubmit={handleSubmit}>
          <Row className="g-4">
            <Col lg={12}>
              <h5 className="fw-bold mb-4">Customer Information</h5>
              <Row className="g-3 mb-4">
                <Col md={6}>
                  <Form.Label className="small fw-bold text-muted">First name *</Form.Label>
                  <Form.Control required type="text" placeholder="First name" value={formData.customer.firstName} onChange={(e) => setFormData({...formData, customer: {...formData.customer, firstName: e.target.value}})} />
                </Col>
                <Col md={6}>
                  <Form.Label className="small fw-bold text-muted">Last name *</Form.Label>
                  <Form.Control required type="text" placeholder="Last name" value={formData.customer.lastName} onChange={(e) => setFormData({...formData, customer: {...formData.customer, lastName: e.target.value}})} />
                </Col>
                <Col md={6}>
                  <Form.Label className="small fw-bold text-muted">Email id *</Form.Label>
                  <Form.Control required type="email" placeholder="Email id" value={formData.customer.email} onChange={(e) => setFormData({...formData, customer: {...formData.customer, email: e.target.value}})} />
                </Col>
                <Col md={6}>
                  <Form.Label className="small fw-bold text-muted">Phone number *</Form.Label>
                  <Form.Control required type="text" placeholder="Phone number" value={formData.customer.phone} onChange={(e) => setFormData({...formData, customer: {...formData.customer, phone: e.target.value}})} />
                </Col>
                <Col md={12}>
                  <Form.Label className="small fw-bold text-muted">Street Address</Form.Label>
                  <Form.Control type="text" placeholder="Street Address" value={formData.customer.address.street} onChange={(e) => setFormData({...formData, customer: {...formData.customer, address: {...formData.customer.address, street: e.target.value}}})} />
                </Col>
                <Col md={3}>
                  <Form.Label className="small fw-bold text-muted">City</Form.Label>
                  <Form.Control type="text" placeholder="City" value={formData.customer.address.city} onChange={(e) => setFormData({...formData, customer: {...formData.customer, address: {...formData.customer.address, city: e.target.value}}})} />
                </Col>
                <Col md={3}>
                  <Form.Label className="small fw-bold text-muted">State / Province</Form.Label>
                  <Form.Control type="text" placeholder="State / Province" value={formData.customer.address.state} onChange={(e) => setFormData({...formData, customer: {...formData.customer, address: {...formData.customer.address, state: e.target.value}}})} />
                </Col>
                <Col md={3}>
                  <Form.Label className="small fw-bold text-muted">Postal code</Form.Label>
                  <Form.Control type="text" placeholder="Postal code" value={formData.customer.address.postalCode} onChange={(e) => setFormData({...formData, customer: {...formData.customer, address: {...formData.customer.address, postalCode: e.target.value}}})} />
                </Col>
                <Col md={3}>
                  <Form.Label className="small fw-bold text-muted">Country</Form.Label>
                  <div className="position-relative">
                    <Form.Control 
                      type="text" 
                      placeholder="Select Country" 
                      value={searchCountry || formData.customer.address.country} 
                      onChange={(e) => {
                        setSearchCountry(e.target.value);
                        setFormData({...formData, customer: {...formData.customer, address: {...formData.customer.address, country: e.target.value}}});
                      }}
                      onFocus={() => setSearchCountry('')}
                    />
                    {searchCountry !== null && filteredCountries.length > 0 && searchCountry.length > 0 && (
                      <Card className="position-absolute w-100 shadow-lg border-light z-3 mt-1 overflow-auto" style={{ maxHeight: '200px' }}>
                        {filteredCountries.map(c => (
                          <div key={c} className="px-3 py-2 cursor-pointer hover-bg-light" onClick={() => {
                            setFormData({...formData, customer: {...formData.customer, address: {...formData.customer.address, country: c}}});
                            setSearchCountry('');
                          }}>{c}</div>
                        ))}
                      </Card>
                    )}
                  </div>
                </Col>
              </Row>
            </Col>

            <hr className="my-2 border-light" />

            <Col lg={12}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">Order Information</h5>
                <div className="d-flex align-items-center gap-2">
                  <Form.Label className="small fw-bold text-muted mb-0">Currency:</Form.Label>
                  <Form.Select size="sm" className="bg-light border-0" style={{ maxWidth: '100px' }} value={formData.order.currency} onChange={(e) => setFormData({...formData, order: {...formData.order, currency: e.target.value}})}>
                      {currencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                  </Form.Select>
                </div>
              </div>

              {formData.order.items.map((item, index) => (
                  <Card key={index} className="p-3 mb-3 border-light bg-light bg-opacity-25 shadow-sm">
                    <div className="d-flex justify-content-between mb-2">
                       <h6 className="fw-bold text-muted mb-0">Product #{index + 1}</h6>
                       {formData.order.items.length > 1 && (
                         <Button variant="link" className="text-danger p-0 h-auto text-decoration-none" onClick={() => removeItem(index)}>
                            <i className="bi bi-trash"></i> Remove
                         </Button>
                       )}
                    </div>
                    <Row className="g-3">
                      <Col md={12}>
                        <Form.Label className="small fw-bold text-muted">Choose product *</Form.Label>
                        <Form.Control 
                          list={`product-options-${index}`} 
                          required 
                          placeholder="Select or type a product"
                          value={item.product} 
                          onChange={(e) => updateItem(index, 'product', e.target.value)} 
                        />
                        <datalist id={`product-options-${index}`}>
                          {products.map(p => <option key={p} value={p} />)}
                        </datalist>
                      </Col>
                      <Col md={3}>
                        <Form.Label className="small fw-bold text-muted">Quantity *</Form.Label>
                        <Form.Control required type="number" min="1" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} />
                      </Col>
                      <Col md={3}>
                        <Form.Label className="small fw-bold text-muted">Batches *</Form.Label>
                        <Form.Control required type="number" min="1" value={item.batches} onChange={(e) => updateItem(index, 'batches', e.target.value)} />
                      </Col>
                      <Col md={3}>
                        <Form.Label className="small fw-bold text-muted">Unit price *</Form.Label>
                        <InputGroup>
                            <InputGroup.Text className="bg-light border-end-0 text-muted">{getCurrencySymbol(formData.order.currency)}</InputGroup.Text>
                            <Form.Control required type="number" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(index, 'unitPrice', e.target.value)} />
                        </InputGroup>
                      </Col>
                      <Col md={3}>
                        <Form.Label className="small fw-bold text-muted">Item Total</Form.Label>
                        <Form.Control disabled value={`${getCurrencySymbol(formData.order.currency)} ${((parseFloat(item.quantity)||0) * (parseFloat(item.unitPrice)||0)).toFixed(2)}`} />
                      </Col>
                    </Row>
                  </Card>
              ))}

              <Button variant="outline-primary" size="sm" onClick={addItem} className="mb-4">
                  <i className="bi bi-plus-lg me-1"></i> Add Another Product
              </Button>

              <Row className="g-3 mt-2">
                <Col md={4}>
                  <Form.Label className="small fw-bold text-muted">Order Total</Form.Label>
                  <Form.Control disabled className="fw-bold text-success" 
                    value={`${getCurrencySymbol(formData.order.currency)} ${formData.order.items.reduce((acc, item) => acc + ((parseFloat(item.quantity)||0) * (parseFloat(item.unitPrice)||0)), 0).toFixed(2)}`} 
                  />
                </Col>
                <Col md={4}>
                  <Form.Label className="small fw-bold text-muted">Status *</Form.Label>
                  <Form.Select required value={formData.order.status} onChange={(e) => setFormData({...formData, order: {...formData.order, status: e.target.value}})}>
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Label className="small fw-bold text-muted">Created by *</Form.Label>
                  <Form.Select required value={formData.order.createdBy} onChange={(e) => setFormData({...formData, order: {...formData.order, createdBy: e.target.value}})}>
                    <option value="">Select Creator</option>
                    {users?.map(u => <option key={u._id} value={u.username}>{u.username}</option>)}
                  </Form.Select>
                </Col>
              </Row>

              <div className="d-flex justify-content-end gap-3 mt-5 border-top pt-4">
                <Button variant="outline-light" className="text-muted px-4" onClick={onHide}>Cancel</Button>
                <Button type="submit" className="btn-success px-5">{order ? 'Update Order' : 'Submit Order'}</Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default OrderModal;
