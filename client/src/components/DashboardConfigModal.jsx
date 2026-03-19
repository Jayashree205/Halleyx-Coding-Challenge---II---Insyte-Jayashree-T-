import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Row, Col, Button, Card, Offcanvas, Form } from 'react-bootstrap';
import { Responsive, useContainerWidth } from 'react-grid-layout';
import axios from 'axios';
import Widget from './Widget.jsx';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

function DashboardConfigModal({ show, onHide, dashboardId, dashboardOrderIds = [], onSaveSuccess }) {
  const [widgets, setWidgets] = useState([]);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [dashboardData, setDashboardData] = useState({});
  const [dashboardName, setDashboardName] = useState('');
  const [selectedCustomerField, setSelectedCustomerField] = useState('customer.firstName');
  const [selectedCustomerEmail, setSelectedCustomerEmail] = useState('');
  const { width, containerRef, mounted } = useContainerWidth();

  const userString = sessionStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const [expandedCats, setExpandedCats] = useState(['Charts', 'Tables', 'KPIs']);

  const getFieldLabel = (value) => orderDataFields.find(f => f.value === value)?.label || value;

  const customerOptions = useMemo(() => {
    if (!dashboardData.orders || !Array.isArray(dashboardData.orders)) return [];
    const unique = {};
    dashboardData.orders.forEach(o => {
      const email = o?.customer?.email;
      if (!email) return;
      unique[email] = `${o.customer.firstName || ''} ${o.customer.lastName || ''}`.trim() || email;
    });
    return Object.entries(unique).map(([email, name]) => ({ email, name }));
  }, [dashboardData.orders]);

  const filteredDashboardData = useMemo(() => {
    if (!dashboardData.orders || !Array.isArray(dashboardData.orders)) return dashboardData;
    if (!selectedCustomerEmail) return dashboardData;
    return {
      ...dashboardData,
      orders: dashboardData.orders.filter(o => o?.customer?.email === selectedCustomerEmail),
    };
  }, [dashboardData, selectedCustomerEmail]);

  const toggleCat = (cat) => {
    setExpandedCats(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const widgetTypes = [
    { type: 'bar', label: 'Bar Chart', icon: 'bi-bar-chart-line', category: 'Charts' },
    { type: 'line', label: 'Line Chart', icon: 'bi-graph-up', category: 'Charts' },
    { type: 'pie', label: 'Pie Chart', icon: 'bi-pie-chart', category: 'Charts' },
    { type: 'area', label: 'Area Chart', icon: 'bi-graph-up-arrow', category: 'Charts' },
    { type: 'scatter', label: 'Scatter Plot', icon: 'bi-dot', category: 'Charts' },
    { type: 'table', label: 'Table', icon: 'bi-table', category: 'Tables' },
    { type: 'kpi', label: 'KPI Value', icon: 'bi-card-heading', category: 'KPIs' },
  ];

  const orderDataFields = [
    { value: 'customer._id', label: 'Customer ID' },
    { value: 'customer.firstName', label: 'Customer name' },
    { value: 'customer.email', label: 'Email id' },
    { value: 'customer.phone', label: 'Phone number' },
    { value: 'customer.address.city', label: 'Address' },
    { value: '_id', label: 'Order ID' },
    { value: 'createdAt', label: 'Order date' },
    { value: 'order.product', label: 'Product' },
    { value: 'order.quantity', label: 'Quantity' },
    { value: 'order.unitPrice', label: 'Unit price' },
    { value: 'order.totalAmount', label: 'Total amount' },
    { value: 'order.status', label: 'Status' },
    { value: 'order.createdBy', label: 'Created by' }
  ];

  useEffect(() => {
    if (show) {
      fetchDashboard();
      fetchData();
    }
  }, [show, dashboardId]);

  const fetchDashboard = async () => {
    if (!dashboardId || dashboardId === 'new') {
      // Start with empty dashboard - no predefined widgets
      setWidgets([]);
      setDashboardName('New Dashboard');
      return;
    }
    try {
      const res = await axios.get(`/api/dashboards/${dashboardId}`);
      if (res.data) {
        setWidgets(res.data.layout || []);
        setDashboardName(res.data.name || 'New Dashboard');
        setSelectedCustomerEmail(res.data.customerFilter || '');

        const firstChart = (res.data.layout || []).find(w => ['bar', 'line', 'area', 'scatter', 'pie'].includes(w.type));
        if (firstChart?.config?.xAxis) {
          setSelectedCustomerField(firstChart.config.xAxis);
        }
      }
    } catch (err) {
      console.error("Error fetching dashboard:", err);
    }
  };

  const fetchData = async () => {
    try {
      const orderQuery = dashboardOrderIds?.length ? `?orderIds=${encodeURIComponent(dashboardOrderIds.join(','))}` : '';
      const res = await axios.get(`/api/dashboards/data${orderQuery}`);
      setDashboardData(res.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const onAddWidget = (type) => {
    const widgetId = `widget-${Date.now()}`;
    const customerLabel = getFieldLabel(selectedCustomerField);

    const defaultConfig = {
      title: 'Untitled',
      description: '',
      width: type === 'kpi' ? 2 : type === 'pie' || type === 'table' ? 4 : 5,
      height: type === 'kpi' ? 2 : type === 'pie' || type === 'table' ? 4 : 5,
      metric: 'order.totalAmount',
      aggregation: 'Sum',
      format: 'Number',
      precision: 0,
      xAxis: selectedCustomerField,
      yAxis: 'order.totalAmount',
      color: '#54bd95',
      limit: 5,
      customColors: ['#54bd95', '#1976d2', '#ef6c00', '#e53935', '#8e24aa'],
      showDataLabel: false,
      showLegend: true,
      columns: [selectedCustomerField, 'order.product', 'order.totalAmount'],
      sortBy: 'Order date',
      pagination: 5,
      showFilter: false,
      fontSize: 14,
      headerBg: '#54bd95'
    };

    const newWidget = {
      id: widgetId,
      type,
      config: {
        ...defaultConfig,
        title: type === 'kpi' ? 'KPI' : `Orders by ${customerLabel}`,
        description: type === 'kpi' ? '' : `Group orders by ${customerLabel} to see trends in your customer data.`,
        xAxis: type === 'kpi' ? defaultConfig.xAxis : selectedCustomerField,
        yAxis: type === 'kpi' ? defaultConfig.yAxis : 'order.totalAmount',
        isConfigured: false
      },
      grid: {
        i: widgetId,
        x: (widgets.length * 2) % 12,
        y: Infinity,
        w: defaultConfig.width,
        h: defaultConfig.height,
      }
    };
    setWidgets([...widgets, newWidget]);
    openSettings(newWidget);
  };

  const onRemoveWidget = (widgetId) => {
    if (window.confirm("Remove this widget?")) {
      setWidgets(widgets.filter(w => w.id !== widgetId));
    }
  };

  const onLayoutChange = (newLayout) => {
    const updated = widgets.map(w => {
      const item = newLayout.find(l => l.i === w.id);
      if (item) {
        return {
          ...w,
          grid: item,
          config: { ...w.config, width: item.w, height: item.h }
        };
      }
      return w;
    });
    setWidgets(updated);

    if (selectedWidget) {
      const selectedItem = newLayout.find(l => l.i === selectedWidget.id);
      if (selectedItem && (selectedItem.w !== selectedWidget.config.width || selectedItem.h !== selectedWidget.config.height)) {
        setSelectedWidget(prev => ({
          ...prev,
          config: { ...prev.config, width: selectedItem.w, height: selectedItem.h }
        }));
      }
    }
  };

  const handleSave = async () => {
    try {
      const res = await axios.post('/api/dashboards', {
        id: dashboardId === 'new' ? 'new' : dashboardId,
        name: dashboardName,
        layout: widgets,
        userId: user?._id,
        customerFilter: selectedCustomerEmail,
        orderIds: dashboardOrderIds
      });
      alert("Dashboard configuration saved!");
      onSaveSuccess(res.data);
      onHide();
    } catch (err) {
      console.error("Error saving dashboard:", err);
    }
  };

  const openSettings = (widget) => {
    setSelectedWidget(widget);
    setShowSettings(true);
  };

  const updateWidgetConfig = (config) => {
    const updated = widgets.map(w => {
      if (w.id === selectedWidget.id) {
        const gridUpdate = { ...w.grid };
        if (config.width && config.width !== w.grid.w) gridUpdate.w = config.width;
        if (config.height && config.height !== w.grid.h) gridUpdate.h = config.height;
        return { ...w, config, grid: gridUpdate };
      }
      return w;
    });
    setWidgets(updated);
    setSelectedWidget({ ...selectedWidget, config });
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" fullscreen="lg-down" centered scrollable>
      <Modal.Header closeButton className="bg-white border-bottom py-3 px-4">
        <Modal.Title className="d-flex align-items-center gap-3">
          <div>
            <h4 className="fw-bold mb-0">Configuring Dashboard</h4>
            <small className="text-muted d-block" style={{ fontSize: '0.8rem' }}>Drag and drop widgets to build your view</small>
          </div>
          <div className="ms-3 d-flex align-items-center bg-light rounded-pill px-3 py-1 border border-primary border-opacity-25 shadow-sm">
            <i className="bi bi-pencil-square text-primary me-2 ms-1 small"></i>
            <Form.Control
              type="text"
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              placeholder="Dashboard Name"
              className="border-0 bg-transparent fw-bold p-0 shadow-none text-primary"
              style={{ width: '250px', fontSize: '1rem' }}
            />
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-light p-0 position-relative">
        <div className="d-flex flex-column flex-lg-row" style={{ minHeight: '80vh' }}>
          {/* Sidebar */}
          <div className="bg-white border-bottom border-lg-end border-lg-bottom-0 p-3 config-sidebar" style={{ flexShrink: 0 }}>
            <h6 className="fw-bold mb-2 text-uppercase small text-muted">Build Your Dashboard</h6>
            <p className="small text-muted mb-3">Step 1: Add widgets below. Step 2: Select which customer detail to group by. Step 3: Save and share.</p>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold small text-uppercase text-muted">Customer Detail</Form.Label>
              <Form.Select
                size="sm"
                value={selectedCustomerField}
                onChange={(e) => setSelectedCustomerField(e.target.value)}
                className="bg-light border-0"
              >
                {orderDataFields.filter(f => f.value.startsWith('customer.')).map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted small">Charts will group data by this customer value when added.</Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold small text-uppercase text-muted">Customer Filter</Form.Label>
              <Form.Select
                size="sm"
                value={selectedCustomerEmail || ''}
                onChange={(e) => setSelectedCustomerEmail(e.target.value)}
                className="bg-light border-0"
              >
                <option value="">All customers</option>
                {customerOptions.map(c => (
                  <option key={c.email} value={c.email}>
                    {c.name ? `${c.name} (${c.email})` : c.email}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted small">Show orders only for this customer when previewing widgets.</Form.Text>
            </Form.Group>

            <h6 className="fw-bold mb-3 text-uppercase small text-muted">Widget Library</h6>
            <div className="overflow-auto" style={{ maxHeight: 'calc(80vh - 100px)' }}>
              {['Charts', 'Tables', 'KPIs'].map(cat => (
                <div key={cat} className="mb-3">
                  <div
                    className="d-flex justify-content-between align-items-center cursor-pointer p-2 rounded hover-bg-light"
                    onClick={() => toggleCat(cat)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="text-uppercase small fw-bold text-muted">{cat}</span>
                    <i className={`bi bi-chevron-${expandedCats.includes(cat) ? 'down' : 'right'} small`}></i>
                  </div>
                  {expandedCats.includes(cat) && (
                    <div className="d-flex flex-column gap-2 mt-2 ps-2">
                      {widgetTypes.filter(w => w.category === cat).map(w => (
                        <div
                          key={w.type}
                          className="p-3 bg-white rounded shadow-sm border border-light d-flex align-items-center gap-3 cursor-pointer hover-shadow transition-all"
                          style={{ cursor: 'pointer' }}
                          onClick={() => onAddWidget(w.type)}
                        >
                          <i className={`bi ${w.icon} text-primary fs-5`}></i>
                          <span className="small fw-medium">{w.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-grow-1 p-4 overflow-auto position-relative" style={{ maxHeight: '80vh', backgroundColor: '#f8f9fa' }}>
            <div className={`dashboard-canvas rounded-4 border-2 border-dashed ${widgets.length === 0 ? 'border-primary border-opacity-25' : 'border-transparent'} p-3`} style={{ minHeight: '100%', background: '#fff', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)' }} ref={containerRef}>
              {mounted && (
                <Responsive
                  className="layout"
                  layouts={{ lg: widgets.map(w => w.grid) }}
                  breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                  cols={{ lg: 12, md: 8, sm: 4, xs: 4, xxs: 4 }}
                  rowHeight={100}
                  width={width}
                  onLayoutChange={onLayoutChange}
                  draggableHandle=".widget-drag-handle"
                >
                  {widgets.map(w => (
                    <div key={w.id} className={`glass-card overflow-hidden transition-all ${selectedWidget?.id === w.id ? 'ring-primary' : ''}`} style={{ outline: selectedWidget?.id === w.id ? '2px solid #54bd95' : 'none', borderRadius: '12px' }}>
                      <Widget
                        widget={w}
                        data={filteredDashboardData}
                        isConfiguring={true}
                        onRemove={() => onRemoveWidget(w.id)}
                        onSettings={() => openSettings(w)}
                      />
                    </div>
                  ))}
                </Responsive>
              )}
              {widgets.length === 0 && (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 py-5 opacity-50">
                  <div className="bg-light rounded-circle p-4 mb-3">
                    <i className="bi bi-plus-circle display-4 text-primary"></i>
                  </div>
                  <h4 className="fw-bold">Your Dashboard is Empty</h4>
                  <p className="text-muted">Click widgets from the library on the left to start building</p>
                </div>
              )}
            </div>
          </div>

          {/* Integrated Settings Panel (Replacing Offcanvas) */}
          {showSettings && selectedWidget && (
            <div className="bg-white border-start p-4 shadow-lg animate-slide-in config-settings-panel" style={{ flexShrink: 0, maxHeight: '80vh', zIndex: 10 }}>
              <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                <h5 className="fw-bold mb-0">Widget Settings</h5>
                <Button variant="link" className="text-muted p-0" onClick={() => setShowSettings(false)}>
                  <i className="bi bi-x-lg"></i>
                </Button>
              </div>

              {(!selectedWidget.config.customerFilters || selectedWidget.config.customerFilters.length === 0) && (
                <div className="alert alert-info py-2 px-3 mb-4 small">
                  Select the customer(s) you want to target from the list below before configuring the widget. This ensures the widget only shows data for those customers.
                </div>
              )}

              <Form>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold small text-uppercase text-muted">Widget Title</Form.Label>
                  <div className="d-flex align-items-center gap-2">
                    <Form.Control
                      type="text"
                      className="bg-light border-0 py-2"
                      value={selectedWidget.config.title}
                      onChange={(e) => updateWidgetConfig({ ...selectedWidget.config, title: e.target.value })}
                    />
                    <div className="bg-primary bg-opacity-10 p-2 rounded shadow-sm">
                      <i className={`bi ${widgetTypes.find(t => t.type === selectedWidget.type)?.icon} text-primary`}></i>
                    </div>
                  </div>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold small text-uppercase text-muted">Widget Type</Form.Label>
                  <Form.Control
                    type="text"
                    disabled
                    readOnly
                    className="bg-light border-0 py-2"
                    value={widgetTypes.find(t => t.type === selectedWidget.type)?.label || selectedWidget.type}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold small text-uppercase text-muted">Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    className="bg-light border-0"
                    placeholder="Optional widget description..."
                    value={selectedWidget.config.description || ''}
                    onChange={(e) => updateWidgetConfig({ ...selectedWidget.config, description: e.target.value })}
                  />
                </Form.Group>

                {/* Ask for target customers first */}
                <div className="p-3 rounded-4 bg-light bg-opacity-50 border border-light mb-4">
                  <h6 className="fw-bold mb-3 small text-uppercase">Target Customers</h6>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium small text-primary">Select customers to include (leave blank for all)</Form.Label>
                    <Form.Select
                      size="sm"
                      multiple
                      style={{ height: '80px' }}
                      value={selectedWidget.config.customerFilters || []}
                      onChange={(e) => {
                        const selectedOpts = Array.from(e.target.selectedOptions).map(opt => opt.value);
                        updateWidgetConfig({ ...selectedWidget.config, customerFilters: selectedOpts });
                      }}
                    >
                      {customerOptions.map(c => (
                        <option key={c.email} value={c.email}>{c.name}</option>
                      ))}
                    </Form.Select>
                    <Form.Text className="text-muted small" style={{ fontSize: '0.7rem' }}>Hold Ctrl/Cmd to select multiple.</Form.Text>
                  </Form.Group>
                </div>

                <Row className="mb-4">
                  <Col>
                    <Form.Label className="fw-bold small text-uppercase text-muted">Width (Desktop Columns)</Form.Label>
                    <Form.Control
                      type="number" min="1" max="12"
                      className="bg-light border-0"
                      value={selectedWidget.config.width}
                      onChange={(e) => updateWidgetConfig({ ...selectedWidget.config, width: parseInt(e.target.value) })}
                    />
                    <Form.Text className="text-muted small d-block mt-2">
                      Desktop: {Math.round((selectedWidget.config.width / 12) * 100)}% width
                    </Form.Text>
                  </Col>
                  <Col>
                    <Form.Label className="fw-bold small text-uppercase text-muted">Height</Form.Label>
                    <Form.Control
                      type="number" min="1"
                      className="bg-light border-0"
                      value={selectedWidget.config.height}
                      onChange={(e) => updateWidgetConfig({ ...selectedWidget.config, height: parseInt(e.target.value) })}
                    />
                  </Col>
                </Row>

                {/* Responsive Grid Preview */}
                <div className="p-3 rounded-3 bg-primary bg-opacity-5 border border-primary border-opacity-25 mb-4">
                  <h6 className="fw-bold small text-uppercase text-primary mb-3">📱 Responsive Grid Preview</h6>
                  <div className="d-flex flex-column gap-2">
                    {/* Desktop */}
                    <div>
                      <div className="small fw-bold text-muted mb-1">Desktop (≥1200px): 12-column grid</div>
                      <div className="bg-white rounded p-2 border border-light" style={{ height: '40px', display: 'flex', alignItems: 'center' }}>
                        <div
                          className="bg-primary bg-opacity-25 rounded"
                          style={{
                            width: `${(selectedWidget.config.width / 12) * 100}%`,
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <span className="text-primary small fw-bold">{Math.round((selectedWidget.config.width / 12) * 100)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Tablet */}
                    <div>
                      <div className="small fw-bold text-muted mb-1">Tablet (768-1199px): 8-column grid</div>
                      <div className="bg-white rounded p-2 border border-light" style={{ height: '40px', display: 'flex', alignItems: 'center' }}>
                        <div
                          className={selectedWidget.config.width > 8 ? 'bg-warning bg-opacity-25' : 'bg-success bg-opacity-25'}
                          style={{
                            width: `${Math.min(selectedWidget.config.width, 8) / 8 * 100}%`,
                            height: '100%',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <span className={selectedWidget.config.width > 8 ? 'text-warning small fw-bold' : 'text-success small fw-bold'}>
                            {Math.min(selectedWidget.config.width, 8)} cols
                          </span>
                        </div>
                      </div>
                      {selectedWidget.config.width > 8 && (
                        <small className="text-warning fw-medium d-block mt-1">
                          ⚠️ Widget 8 columns: Will auto-resize to full width (8 cols) on tablet
                        </small>
                      )}
                    </div>

                    {/* Mobile */}
                    <div>
                      <div className="small fw-bold text-muted mb-1">Mobile (&lt;768px): 4-column grid</div>
                      <div className="bg-white rounded p-2 border border-light" style={{ height: '40px', display: 'flex', alignItems: 'center' }}>
                        <div
                          className="bg-info bg-opacity-25"
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <span className="text-info small fw-bold">100% (Full Width)</span>
                        </div>
                      </div>
                      <small className="text-info fw-medium d-block mt-1">
                        ℹ️ All widgets display full-width on mobile, stacked vertically
                      </small>
                    </div>
                  </div>

                  {/* Width Recommendations */}
                  <div className="mt-3 pt-3 border-top border-primary border-opacity-25">
                    <div className="small fw-bold text-muted mb-2">📌 Width Recommendations:</div>
                    <div className="d-flex flex-wrap gap-2">
                      {[
                        { w: 12, label: '12 (Full)', desc: 'Reports, Main KPI' },
                        { w: 6, label: '6 (Half)', desc: '2 per row' },
                        { w: 4, label: '4 (Third)', desc: '3 per row' },
                        { w: 3, label: '3 (Quarter)', desc: '4 per row' }
                      ].map(opt => (
                        <button
                          key={opt.w}
                          type="button"
                          className={`btn btn-sm rounded-pill ${selectedWidget.config.width === opt.w ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => updateWidgetConfig({ ...selectedWidget.config, width: opt.w })}
                          title={opt.desc}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>


                <div className="d-flex gap-2">
                  <Button variant="primary" className="flex-grow-1 shadow-sm rounded-pill" onClick={() => {
                    updateWidgetConfig({ ...selectedWidget.config, isConfigured: true });
                    setShowSettings(false);
                  }}>
                    Apply & Generate Chart
                  </Button>
                </div>
              </Form>
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer className="bg-white border-top py-3 px-4">
        <Button variant="outline-light" className="text-muted px-4" onClick={onHide}>Cancel</Button>
        <Button className="btn-premium px-4" onClick={handleSave}>Save Dashboard</Button>
      </Modal.Footer>

    </Modal>
  );
}

export default DashboardConfigModal;
