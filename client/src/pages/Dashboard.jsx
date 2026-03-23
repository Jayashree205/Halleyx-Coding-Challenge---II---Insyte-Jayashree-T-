import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Responsive, useContainerWidth } from 'react-grid-layout';
import axios from 'axios';
import { Container, Row, Col, Button, Dropdown, Card, Badge, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Widget from '../components/Widget.jsx';
import DashboardConfigModal from '../components/DashboardConfigModal.jsx';
import OrderModal from '../components/OrderModal.jsx';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

function Dashboard() {
  const [dashboards, setDashboards] = useState([]);
  const [currentDashboard, setCurrentDashboard] = useState(null);
  const currentDashboardRef = React.useRef(null);
  const [data, setData] = useState({});
  const [filter, setFilter] = useState('all');
  const [customerEmailFilter, setCustomerEmailFilter] = useState('');
  const [dashboardOrderIds, setDashboardOrderIds] = useState([]);
  const [widgetDataMap, setWidgetDataMap] = useState({});
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configId, setConfigId] = useState('new');
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [selectedCustomerEmails, setSelectedCustomerEmails] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const { width, containerRef, mounted } = useContainerWidth();

  useEffect(() => {
    currentDashboardRef.current = currentDashboard;
  }, [currentDashboard]);

  const fetchData = useCallback(async () => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      const userIdStr = user?._id ? `&userId=${user._id}` : '';
      const orderIdsQuery = dashboardOrderIds?.length ? `&orderIds=${encodeURIComponent(dashboardOrderIds.join(','))}` : '';
      const customerQuery = !dashboardOrderIds?.length && customerEmailFilter ? `&customerEmail=${encodeURIComponent(customerEmailFilter)}` : '';
      const res = await axios.get(`/api/dashboards/data?filter=${filter}${orderIdsQuery}${customerQuery}${userIdStr}`);
      setData(res.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  }, [filter, customerEmailFilter, dashboardOrderIds]);

  const customerOptions = useMemo(() => {
    if (!data.orders || !Array.isArray(data.orders)) return [];
    const unique = {};
    data.orders.forEach(o => {
      if (o.customer?.email) {
        unique[o.customer.email] = `${o.customer.firstName || ''} ${o.customer.lastName || ''}`.trim() || o.customer.email;
      }
    });
    return Object.entries(unique).map(([email, name]) => ({ email, name }));
  }, [data.orders]);

  const loadWidgetDataForDashboard = useCallback(async (dashboard) => {
    if (!dashboard?.layout?.length) return;

    const filterQuery = filter && filter !== 'all' ? `&filter=${filter}` : '';
    const dataMap = {};
    await Promise.all(dashboard.layout.map(async (w) => {
      const ids = w?.config?.orderIds;
      if (Array.isArray(ids) && ids.length) {
        try {
          const user = JSON.parse(sessionStorage.getItem('user'));
          const userIdStr = user?._id ? `&userId=${user._id}` : '';
          const res = await axios.get(`/api/dashboards/data?orderIds=${encodeURIComponent(ids.join(','))}${filterQuery}${userIdStr}`);
          dataMap[w.id] = res.data;
        } catch (e) {
          console.error('Error loading widget order data for widget', w.id, e);
        }
      }
    }));

    setWidgetDataMap(prev => ({ ...prev, ...dataMap }));
  }, [filter]);

  const fetchDashboards = useCallback(async (preferredId) => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      const userIdStr = user?._id ? `?userId=${user._id}` : '';
      const res = await axios.get(`/api/dashboards${userIdStr}`);
      setDashboards(res.data || []);
      
      if (res.data && res.data.length > 0) {
        let nextDashboard = null;

        if (preferredId) {
          nextDashboard = res.data.find(d => d._id === preferredId);
        }

        if (!nextDashboard) {
          const current = currentDashboardRef.current;
          if (!current || !res.data.find(d => d._id === current._id)) {
            nextDashboard = res.data.find(d => d.name === 'Default') || res.data[0];
          } else {
            nextDashboard = res.data.find(d => d._id === current._id);
          }
        }

        setCurrentDashboard(nextDashboard);
        setCustomerEmailFilter(nextDashboard?.customerFilter || '');
        setDashboardOrderIds(nextDashboard?.orderIds || []);
        await loadWidgetDataForDashboard(nextDashboard);
      } else {
        setCurrentDashboard(null);
        setCustomerEmailFilter('');
        setDashboardOrderIds([]);
      }
    } catch (err) {
      console.error("Error fetching dashboards:", err);
    }
  }, [loadWidgetDataForDashboard]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user?._id) {
      navigate('/profile');
    }
  }, [navigate]);

  const addWidgetToDashboard = useCallback(async (dashboardId, orderIds) => {
    if (!dashboardId || !orderIds?.length) return;
    try {
      const dashRes = await axios.get(`/api/dashboards/${dashboardId}`);
      const dashboard = dashRes.data;
      if (!dashboard) return;

      const updatedOrderIds = Array.from(new Set([...(dashboard.orderIds || []), ...orderIds]));

      const updatedLayout = (dashboard.layout || []).map(w => ({
          ...w,
          config: { ...w.config, orderIds: updatedOrderIds }
      }));

      const res = await axios.post('/api/dashboards', {
        id: dashboardId,
        name: dashboard.name,
        layout: updatedLayout,
        userId: dashboard.userId,
        customerFilter: dashboard.customerFilter,
        orderIds: updatedOrderIds,
      });

      setCurrentDashboard(res.data);
      setDashboardOrderIds(updatedOrderIds);
      await loadWidgetDataForDashboard(res.data);
      fetchDashboards(res.data._id);
    } catch (err) {
      console.error('Error adding widget to dashboard:', err);
    }
  }, [fetchDashboards, loadWidgetDataForDashboard]);

  const refreshWidgetData = useCallback(async (widget) => {
    const ids = widget?.config?.orderIds;
    if (!Array.isArray(ids) || ids.length === 0) return;

    const filterQuery = filter && filter !== 'all' ? `&filter=${filter}` : '';
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      const userIdStr = user?._id ? `&userId=${user._id}` : '';
      const res = await axios.get(`/api/dashboards/data?orderIds=${encodeURIComponent(ids.join(','))}${filterQuery}${userIdStr}`);
      setWidgetDataMap(prev => ({ ...prev, [widget.id]: res.data }));
    } catch (err) {
      console.error('Error refreshing widget data:', err);
    }
  }, [filter]);

  const createDashboardForOrders = useCallback(async (orderIds) => {
    try {
      const ts = Date.now();
      const layout = [
        {
          id: `widget-kpi-1-${ts}`, type: 'kpi',
          config: { title: 'Total Orders', metric: 'order.items', aggregation: 'Count', format: 'Number', color: '#54bd95', orderIds, isConfigured: true, width: 3, height: 2 },
          grid: { i: `widget-kpi-1-${ts}`, x: 0, y: 0, w: 3, h: 2 }
        },
        {
          id: `widget-kpi-2-${ts}`, type: 'kpi',
          config: { title: 'Total Revenue', metric: 'order.totalAmount', aggregation: 'Sum', format: 'Currency', precision: 2, color: '#1976d2', orderIds, isConfigured: true, width: 3, height: 2 },
          grid: { i: `widget-kpi-2-${ts}`, x: 3, y: 0, w: 3, h: 2 }
        },
        {
          id: `widget-kpi-3-${ts}`, type: 'kpi',
          config: { title: 'Total Customers', metric: 'customer.email', aggregation: 'CountDistinct', format: 'Number', color: '#ef6c00', orderIds, isConfigured: true, width: 3, height: 2 },
          grid: { i: `widget-kpi-3-${ts}`, x: 6, y: 0, w: 3, h: 2 }
        },
        {
          id: `widget-kpi-4-${ts}`, type: 'kpi',
          config: { title: 'Total Sold Quantity', metric: 'order.quantity', aggregation: 'Sum', format: 'Number', color: '#e53935', orderIds, isConfigured: true, width: 3, height: 2 },
          grid: { i: `widget-kpi-4-${ts}`, x: 9, y: 0, w: 3, h: 2 }
        },
        {
          id: `widget-bar-${ts}`, type: 'bar',
          config: {
            title: 'Monthly Revenue',
            xAxis: 'order.product', yAxis: 'order.totalAmount',
            color: '#54bd95', showDataLabel: false, limit: 6,
            customColors: ['#54bd95', '#1976d2', '#ef6c00', '#e53935', '#8e24aa', '#f8c471'],
            orderIds,
            isConfigured: true, width: 7, height: 6
          },
          grid: { i: `widget-bar-${ts}`, x: 0, y: 2, w: 7, h: 6 }
        },
        {
          id: `widget-pie-${ts}`, type: 'pie',
          config: {
            title: 'Status overview',
            xAxis: 'order.status', yAxis: 'order.status',
            showLegend: true, showDataLabel: false, color: '#54bd95',
            customColors: ['#1976d2', '#f5b041', '#54bd95', '#e74c3c'],
            orderIds,
            isConfigured: true, width: 5, height: 6
          },
          grid: { i: `widget-pie-${ts}`, x: 7, y: 2, w: 5, h: 6 }
        },
        {
          id: `widget-table-${ts}`, type: 'table',
          config: {
            title: 'Pending orders',
            columns: ['_id', 'order.quantity', 'order.product', 'order.totalAmount'],
            pagination: 5, headerBg: '#f8f9fa', fontSize: 13,
            orderIds,
            showFilter: true,
            filters: [{ field: 'order.status', value: 'Pending' }],
            isConfigured: true, width: 12, height: 5
          },
          grid: { i: `widget-table-${ts}`, x: 0, y: 8, w: 12, h: 5 }
        }
      ];

      const res = await axios.post('/api/dashboards', {
        id: 'new',
        name: 'Selected Orders Dashboard',
        layout,
        userId: JSON.parse(sessionStorage.getItem('user'))?._id,
        orderIds,
      });

      setCurrentDashboard(res.data);
      setDashboardOrderIds(orderIds);

      // Make sure the newly created dashboard is selected and its data is loaded
      await fetchDashboards(res.data._id);
      
      const user = JSON.parse(sessionStorage.getItem('user'));
      const userIdStr = user?._id ? `&userId=${user._id}` : '';
      const orderQuery = orderIds.length ? `&orderIds=${encodeURIComponent(orderIds.join(','))}` : '';
      const dataRes = await axios.get(`/api/dashboards/data?filter=${filter}${orderQuery}${userIdStr}`);
      setData(dataRes.data);

      // Auto-open config modal so user can configure widgets
      setConfigId(res.data._id);
      setShowConfigModal(true);
    } catch (err) {
      console.error('Error creating dashboard for orders:', err);
    }
  }, [filter, fetchDashboards]);

  useEffect(() => {
    const pendingOrderIds = sessionStorage.getItem('dashboardOrderIds');
    const pendingDashboardId = sessionStorage.getItem('dashboardId');

    if (pendingOrderIds) {
      sessionStorage.removeItem('dashboardOrderIds');
      sessionStorage.removeItem('dashboardId');

      const ids = pendingOrderIds.split(',').map(i => i.trim()).filter(Boolean);
      if (ids.length) {
        if (pendingDashboardId) {
          addWidgetToDashboard(pendingDashboardId, ids);
          return;
        }

        createDashboardForOrders(ids);
        return;
      }
    }

    fetchDashboards();
  }, [addWidgetToDashboard, createDashboardForOrders, fetchDashboards]); // Initial load

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenConfig = (id = 'new') => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user?._id) {
        alert("Please set up your profile first to enable dashboard features.");
        navigate('/profile');
        return;
    }

    setConfigId(id);
    setShowConfigModal(true);
  };

  const handleCreateNewDashboard = () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user?._id) {
      alert("Please set up your profile first to enable dashboard features.");
      navigate('/profile');
      return;
    }

    // When clicking "Create New Dashboard" we move to the Orders page so the user can select orders first.
    sessionStorage.setItem('dashboardMode', 'create');
    sessionStorage.removeItem('dashboardId');
    window.location.hash = '#/orders';
  };

  const createDashboardForCustomers = useCallback(async (customerEmails) => {
    try {
      const ts = Date.now();
      const layout = [
        {
          id: `widget-kpi-1-${ts}`, type: 'kpi',
          config: { title: 'Total Orders', metric: 'order.items', aggregation: 'Count', format: 'Number', color: '#54bd95', customerFilters: customerEmails, isConfigured: true, width: 3, height: 2 },
          grid: { i: `widget-kpi-1-${ts}`, x: 0, y: 0, w: 3, h: 2 }
        },
        {
          id: `widget-kpi-2-${ts}`, type: 'kpi',
          config: { title: 'Total Revenue', metric: 'order.totalAmount', aggregation: 'Sum', format: 'Currency', precision: 2, color: '#1976d2', customerFilters: customerEmails, isConfigured: true, width: 3, height: 2 },
          grid: { i: `widget-kpi-2-${ts}`, x: 3, y: 0, w: 3, h: 2 }
        },
        {
          id: `widget-kpi-3-${ts}`, type: 'kpi',
          config: { title: 'Total Customers', metric: 'customer.email', aggregation: 'CountDistinct', format: 'Number', color: '#ef6c00', customerFilters: customerEmails, isConfigured: true, width: 3, height: 2 },
          grid: { i: `widget-kpi-3-${ts}`, x: 6, y: 0, w: 3, h: 2 }
        },
        {
          id: `widget-kpi-4-${ts}`, type: 'kpi',
          config: { title: 'Total Sold Quantity', metric: 'order.quantity', aggregation: 'Sum', format: 'Number', color: '#e53935', customerFilters: customerEmails, isConfigured: true, width: 3, height: 2 },
          grid: { i: `widget-kpi-4-${ts}`, x: 9, y: 0, w: 3, h: 2 }
        },
        {
          id: `widget-bar-${ts}`, type: 'bar',
          config: {
            title: 'Monthly Revenue',
            xAxis: 'order.product', yAxis: 'order.totalAmount',
            color: '#54bd95', showDataLabel: false, limit: 6,
            customColors: ['#54bd95', '#1976d2', '#ef6c00', '#e53935', '#8e24aa', '#f8c471'],
            customerFilters: customerEmails,
            isConfigured: true, width: 7, height: 6
          },
          grid: { i: `widget-bar-${ts}`, x: 0, y: 2, w: 7, h: 6 }
        },
        {
          id: `widget-pie-${ts}`, type: 'pie',
          config: {
            title: 'Status overview',
            xAxis: 'order.status', yAxis: 'order.status',
            showLegend: true, showDataLabel: false, color: '#54bd95',
            customColors: ['#1976d2', '#f5b041', '#54bd95', '#e74c3c'],
            customerFilters: customerEmails,
            isConfigured: true, width: 5, height: 6
          },
          grid: { i: `widget-pie-${ts}`, x: 7, y: 2, w: 5, h: 6 }
        },
        {
          id: `widget-table-${ts}`, type: 'table',
          config: {
            title: 'Pending orders',
            columns: ['_id', 'order.quantity', 'order.product', 'order.totalAmount'],
            pagination: 5, headerBg: '#f8f9fa', fontSize: 13,
            customerFilters: customerEmails,
            showFilter: true,
            filters: [{ field: 'order.status', value: 'Pending' }],
            isConfigured: true, width: 12, height: 5
          },
          grid: { i: `widget-table-${ts}`, x: 0, y: 8, w: 12, h: 5 }
        }
      ];

      const res = await axios.post('/api/dashboards', {
        id: 'new',
        name: 'Selected Customers Dashboard',
        layout,
        userId: JSON.parse(sessionStorage.getItem('user'))?._id,
        customerFilter: customerEmails.join(','),
        orderIds: []
      });

      setCurrentDashboard(res.data);
      setDashboardOrderIds([]);
      setCustomerEmailFilter(customerEmails.join(','));

      // Make sure the newly created dashboard is selected and its data is loaded
      await fetchDashboards(res.data._id);
      setShowCustomerPicker(false);
      setConfigId(res.data._id);
      setShowConfigModal(true);
    } catch (err) {
      console.error('Error creating dashboard for customers:', err);
    }
  }, [fetchDashboards, filter]);


  const navigateToOrders = (dashboardId) => {
    if (dashboardId) {
      sessionStorage.setItem('dashboardId', dashboardId);
    } else {
      sessionStorage.removeItem('dashboardId');
    }
    window.location.hash = '#/orders';
  };

  const handleSaveSuccess = (savedDashboard) => {
    fetchDashboards();
    setCurrentDashboard(savedDashboard);
    setCustomerEmailFilter(savedDashboard.customerFilter || '');
    setDashboardOrderIds(savedDashboard.orderIds || []);
  };

  const handleDeleteDashboard = async (dashboardId) => {
    if (!window.confirm('Delete this dashboard?')) return;
    try {
      await axios.delete(`/api/dashboards/${dashboardId}`);
      if (currentDashboard?._id === dashboardId) {
        setCurrentDashboard(null);
      }
      fetchDashboards();
    } catch (err) {
      console.error('Error deleting dashboard:', err);
      alert('Could not delete the dashboard.');
    }
  };

  const filterLabels = {
    all: 'All Time',
    today: 'Today',
    last7days: 'Last 7 Days',
    last30days: 'Last 30 Days',
    last90days: 'Last 90 Days'
  };

  const widgets = currentDashboard?.layout || [];

  return (
    <Container fluid className="py-3 py-md-5 px-2 px-md-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 mb-md-5 gap-2 gap-md-3">
        <div>
          <h1 className="fw-bold mb-1" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}>Analytics Dashboard</h1>
          <p className="text-muted mb-0" style={{ fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>Monitor your customer order performance and metrics.</p>
        </div>
        <div className="d-flex flex-wrap gap-2 gap-md-3 align-items-center w-100 w-md-auto justify-content-start justify-content-md-end mt-2 mt-md-0">
          <Dropdown className="flex-grow-1 flex-sm-grow-0">
            <Dropdown.Toggle variant="white" className="glass-card py-2 px-3 border-0 d-flex align-items-center gap-2 w-100 justify-content-between" style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', minHeight: '44px' }}>
              <span className="d-flex align-items-center gap-2">
                <i className="bi bi-calendar3 text-primary"></i>
                <span className="fw-medium d-none d-sm-inline">{filterLabels[filter]}</span>
                <span className="fw-medium d-sm-none">{filterLabels[filter].split(' ')[0]}</span>
              </span>
            </Dropdown.Toggle>
            <Dropdown.Menu className="shadow border-light w-100">
              {Object.entries(filterLabels).map(([key, label]) => (
                <Dropdown.Item key={key} onClick={() => setFilter(key)} className="py-2" style={{ fontSize: '0.9rem' }}>
                  {label}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <Button variant="outline-primary" className="py-2 px-3 px-md-4 flex-grow-1 flex-sm-grow-0" style={{ minHeight: '44px', fontSize: '0.85rem' }} onClick={() => navigateToOrders(currentDashboard?._id)}>
            <i className="bi bi-plus-circle me-2"></i>
            <span className="d-inline">Add Orders</span>
          </Button>
          <Button variant="primary" className="btn-premium py-2 px-3 px-md-4 flex-grow-1 flex-sm-grow-0" style={{ minHeight: '44px', fontSize: '0.85rem' }} onClick={() => handleOpenConfig(currentDashboard?._id || 'new')}>
            <i className="bi bi-gear-fill me-2"></i>
            <span className="d-none d-sm-inline">Configure</span>
            <span className="d-sm-none">Settings</span>
          </Button>
        </div>
      </div>

      {dashboards.length > 0 && (
        <div className="mb-4 mb-md-5 overflow-auto pb-2">
            <div className="d-flex gap-2 align-items-center mb-3">
                <h6 className="fw-bold mb-0 text-muted text-uppercase small" style={{ fontSize: '0.75rem' }}>Your Dashboards:</h6>
                <Button variant="link" className="p-0 text-primary small fw-bold text-decoration-none" style={{ fontSize: '0.85rem' }} onClick={handleCreateNewDashboard}>
                    <i className="bi bi-plus-lg me-1"></i>Create New
                </Button>
            </div>
            <div className="dashboard-tabs-scroll">
                {dashboards.map(d => (
                    <Card 
                        key={d._id} 
                        className={`glass-card border-0 py-2 px-3 px-md-4 cursor-pointer transition-all ${currentDashboard?._id === d._id ? 'bg-primary text-white shadow-lg' : 'hover-bg-light text-muted'}`}
                        style={{ cursor: 'pointer', minWidth: '120px' }}
                        onClick={() => setCurrentDashboard(d)}
                    >
                        <div className="d-flex justify-content-between align-items-center gap-1 gap-md-2">
                            <span className="fw-bold text-nowrap" style={{ fontSize: '0.85rem' }}>{d.name}</span>
                            <div className="d-flex align-items-center gap-1">
                                <Button 
                                    variant="link" 
                                    size="sm" 
                                    className="p-0 text-secondary" 
                                    title="Edit Dashboard"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenConfig(d._id);
                                    }}
                                    style={{ fontSize: '0.8rem' }}
                                >
                                    <i className="bi bi-pencil-fill"></i>
                                </Button>
                                {currentDashboard?._id === d._id && <i className="bi bi-check-circle-fill" style={{ fontSize: '0.8rem' }}></i>}
                                <Button 
                                    variant="link" 
                                    size="sm" 
                                    className="p-0 text-danger" 
                                    title="Delete Dashboard"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteDashboard(d._id);
                                    }}
                                    style={{ fontSize: '0.8rem' }}
                                >
                                    <i className="bi bi-trash-fill"></i>
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
      )}

      {!currentDashboard ? (
        <div className="text-center py-4 py-md-5 mt-4 mt-md-5">
          <div className="glass-card d-inline-block p-3 p-md-5 text-center">
            <i className="bi bi-bar-chart-line text-muted mb-3 mb-md-4 d-block" style={{ fontSize: 'clamp(2rem, 10vw, 4rem)' }}></i>
            <h3 className="fw-bold mb-2 mb-md-3" style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)' }}>Welcome! Create your first Dashboard</h3>
            <p className="text-muted mb-4 mb-md-4" style={{ fontSize: 'clamp(0.85rem, 2vw, 1rem)', maxWidth: '400px' }}>You haven't created any custom dashboards yet. Start by adding customer orders to generate insights.</p>
            <Button 
                className="btn-premium px-3 px-md-5 py-2 py-md-3" 
                onClick={() => navigateToOrders(currentDashboard?._id)}
                style={{ minHeight: '44px' }}
            >
               Add Customer Orders
            </Button>
          </div>
        </div>
      ) : widgets.length === 0 ? (
        <div className="text-center py-4 py-md-5 mt-4 mt-md-5">
          <div className="glass-card d-inline-block p-3 p-md-5 text-center">
            <i className="bi bi-grid-3x3-gap text-muted mb-3 mb-md-4 d-block" style={{ fontSize: 'clamp(2rem, 10vw, 4rem)' }}></i>
            <h3 className="fw-bold mb-2 mb-md-3" style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)' }}>Empty Dashboard</h3>
            <p className="text-muted mb-4" style={{ fontSize: 'clamp(0.85rem, 2vw, 1rem)', maxWidth: '400px' }}>This dashboard has no widgets. Add customer orders to generate insights and create charts.</p>
            <Button 
                className="btn-premium px-3 px-md-5 py-2 py-md-3" 
                onClick={() => navigateToOrders(currentDashboard?._id)}
                style={{ minHeight: '44px' }}
            >
               Add Customer Orders
            </Button>
          </div>
        </div>
      ) : (
        <div className="dashboard-grid-container" ref={containerRef}>
          {/* Grid Info Banner */}
          <div className="grid-info-banner">
            <span className="grid-info-badge" id="responsive-grid-info">
              <i className="bi bi-phone me-1"></i>
              <span className="d-none d-sm-inline">Responsive Grid:</span>
            </span>
            <span className="d-none d-sm-inline">Desktop: 12-column</span>
            <span className="d-none d-md-inline ms-1">• Tablet: 8-column</span>
            <span className="d-none d-lg-inline ms-1">• Mobile: 4-column</span>
            <span className="d-none d-xl-inline ms-1">• Auto-stacking enabled</span>
          </div>

          {mounted && (
            <Responsive
              className="layout"
              layouts={{ 
                lg: widgets.map(w => ({
                  ...w.grid,
                  i: w.id
                })),
                md: widgets.map((w, idx) => {
                  // Tablet: 8-column grid
                  const gridW = w.grid.w;
                  if (gridW > 8) {
                    return { ...w.grid, i: w.id, w: 8 };
                  }
                  return { ...w.grid, i: w.id };
                }),
                sm: widgets.map((w, idx) => {
                  // Mobile tablet: 4-column grid (2x2 layout)
                  const gridW = w.grid.w;
                  if (gridW > 4) {
                    return { ...w.grid, i: w.id, w: 2 };
                  }
                  return { ...w.grid, i: w.id };
                }),
                xs: widgets.map(w => ({
                  ...w.grid,
                  i: w.id,
                  w: 4, // Full width on mobile
                  h: w.grid.h || 5
                }))
              }}
              breakpoints={{ lg: 1200, md: 768, sm: 576, xs: 0 }}
              cols={{ lg: 12, md: 8, sm: 4, xs: 4 }}
              rowHeight={80}
              width={width}
              isDraggable={false}
              isResizable={false}
              preventCollision={false}
              compactType="vertical"
              verticalCompact={true}
              margin={[15, 15]}
              containerPadding={[0, 0]}
            >
              {widgets.map(w => (
                <div key={w.id} data-grid-cols={w.grid.w}>
                  <Widget 
                    widget={{
                        ...w,
                        onEditOrder: (order) => {
                            setEditingOrder(order);
                            setShowOrderModal(true);
                        }
                    }} 
                    data={widgetDataMap[w.id] || data} 
                    customerFilter={customerEmailFilter}
                    onRefresh={() => refreshWidgetData(w)}
                    isConfiguring={false} 
                  />
                </div>
              ))}
            </Responsive>
          )}
        </div>
      )}

      <DashboardConfigModal 
        show={showConfigModal} 
        onHide={() => setShowConfigModal(false)} 
        dashboardId={configId}
        dashboardOrderIds={dashboardOrderIds}
        onSaveSuccess={handleSaveSuccess}
      />

      <Modal show={showCustomerPicker} onHide={() => setShowCustomerPicker(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Select Customers for this Dashboard</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {customerOptions.length === 0 && (
            <div className="alert alert-warning mb-3">
              No customers available yet. Please add orders first, then create a dashboard.
            </div>
          )}

          <Form.Group className="mb-3">
            <Form.Label className="fw-medium">Search / Add Customer Email</Form.Label>
            <Form.Control
              type="text"
              placeholder="Type an email and press Enter"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const email = e.target.value.trim();
                  if (email && !selectedCustomerEmails.includes(email)) {
                    setSelectedCustomerEmails(prev => [...prev, email]);
                  }
                  e.target.value = '';
                }
              }}
            />
            <Form.Text className="text-muted">You can type an email or pick from the list below.</Form.Text>
          </Form.Group>

          {customerOptions.length > 0 && (
            <div className="mb-3">
              <div className="small fw-bold text-muted mb-2">Pick from existing customers</div>
              <div className="d-flex flex-wrap gap-2">
                {customerOptions.map(c => (
                  <button
                    key={c.email}
                    type="button"
                    className={`btn btn-sm ${selectedCustomerEmails.includes(c.email) ? 'btn-primary' : 'btn-outline-primary'} rounded-pill`}
                    onClick={() => {
                      setSelectedCustomerEmails(prev => {
                        if (prev.includes(c.email)) return prev.filter(e => e !== c.email);
                        return [...prev, c.email];
                      });
                    }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedCustomerEmails.length > 0 && (
            <div className="mb-3">
              <div className="small fw-bold text-muted mb-2">Selected customers</div>
              <div className="d-flex flex-wrap gap-2">
                {selectedCustomerEmails.map(email => (
                  <span key={email} className="badge bg-secondary bg-opacity-20 text-secondary d-flex align-items-center gap-2">
                    {email}
                    <button type="button" className="btn-close btn-close-white btn-sm" aria-label="Remove" onClick={() => setSelectedCustomerEmails(prev => prev.filter(e => e !== email))} />
                  </span>
                ))}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCustomerPicker(false)}>Cancel</Button>
          <Button
            variant="primary"
            onClick={() => {
              createDashboardForCustomers(selectedCustomerEmails);
            }}
            disabled={selectedCustomerEmails.length === 0}
          >
            Continue to Configure
          </Button>
        </Modal.Footer>
      </Modal>

      <OrderModal 
        show={showOrderModal}
        onHide={() => {
            setShowOrderModal(false);
            setEditingOrder(null);
        }}
        order={editingOrder}
        onSuccess={() => fetchData()}
        user={JSON.parse(sessionStorage.getItem('user'))}
        users={users}
      />
    </Container>
  );
}

export default Dashboard;