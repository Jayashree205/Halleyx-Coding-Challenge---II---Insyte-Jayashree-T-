import React, { useMemo, useState } from 'react';
import { Card, Button, Table as RBTable, Form } from 'react-bootstrap';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, ScatterChart, Scatter, PieChart, Pie, Cell, LabelList 
} from 'recharts';

const COLORS = ['#2e7d32', '#1976d2', '#ef6c00', '#2e7d32', '#1976d2', '#ef6c00'];

function Widget({ widget, data, isConfiguring, onRemove, onSettings, customerFilter, onRefresh }) {
  const { type, config } = widget;

  // Helper for nested property access
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  const [localCustomerFilter, setLocalCustomerFilter] = useState('');

  const flattenedOrders = useMemo(() => {
    if (!data.orders || !Array.isArray(data.orders)) return [];
    const flattened = [];
    data.orders.forEach(o => {
      // Apply local filter if set, otherwise config filters
      if (localCustomerFilter) {
        if (o.customer?.email !== localCustomerFilter) return;
      } else if (config.customerFilters && config.customerFilters.length > 0) {
        if (!config.customerFilters.includes(o.customer?.email)) return;
      }
      
      if (o.order.items && o.order.items.length > 0) {
        o.order.items.forEach(item => {
          flattened.push({
            ...o,
            order: {
              ...o.order,
              product: item.product,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalAmount: item.totalAmount,
              batches: item.batches || 1,
            }
          });
        });
      } else {
        flattened.push({
           ...o, 
           order: {
              ...o.order,
              batches: 1
           } 
        });
      }
    });
    return flattened;
  }, [data.orders, localCustomerFilter]);

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

  const processedData = useMemo(() => {
    if (flattenedOrders.length === 0) return [];
    
    // For KPI
    if (type === 'kpi') {
      const values = flattenedOrders.map(o => getNestedValue(o, config.metric));
      
      let result = 0;
      if (config.aggregation === 'Sum') result = values.reduce((a, b) => a + (parseFloat(b) || 0), 0);
      else if (config.aggregation === 'Average') result = values.length ? values.reduce((a, b) => a + (parseFloat(b) || 0), 0) / values.length : 0;
      else if (config.aggregation === 'Count') result = values.length;
      else if (config.aggregation === 'CountDistinct') result = new Set(values.filter(v => v !== undefined && v !== null && v !== '')).size;
      
      return result;
    }

    // For Charts
    if (['bar', 'line', 'area', 'scatter'].includes(type) || type === 'pie') {
      const grouped = flattenedOrders.reduce((acc, o) => {
        const xVal = getNestedValue(o, config.xAxis) || 'Other';
        const rawYVal = getNestedValue(o, config.yAxis);
        const yVal = parseFloat(rawYVal) || 0;
        
        if (!acc[xVal]) acc[xVal] = 0;
        
        // Default to summation for other charts unless yAxis is the same as xAxis (then count)
        if (config.xAxis === config.yAxis) {
          acc[xVal] += 1;
        } else {
          acc[xVal] += yVal;
        }
        return acc;
      }, {});
      
      let result = Object.entries(grouped).map(([name, value]) => ({ name, value }));
      
      if (config.limit && config.limit > 0) {
        result.sort((a,b) => b.value - a.value);
        result = result.slice(0, config.limit);
      }
      return result;
    }

    // For Table
    if (type === 'table') {
      let result = flattenedOrders;
      if (config.showFilter && config.filters && config.filters.length > 0) {
        result = result.filter(o => {
          return config.filters.every(f => {
            if (!f.value) return true;
            const val = getNestedValue(o, f.field);
            return String(val).toLowerCase().includes(f.value.toLowerCase());
          });
        });
      }

      // Add Sorting logic
      if (config.sortBy) {
        result = [...result].sort((a, b) => {
          if (config.sortBy === 'Ascending') {
            const valA = getNestedValue(a, config.columns && config.columns.length > 0 ? config.columns[0] : 'createdAt') || '';
            const valB = getNestedValue(b, config.columns && config.columns.length > 0 ? config.columns[0] : 'createdAt') || '';
            return valA > valB ? 1 : -1;
          } else if (config.sortBy === 'Descending') {
            const valA = getNestedValue(a, config.columns && config.columns.length > 0 ? config.columns[0] : 'createdAt') || '';
            const valB = getNestedValue(b, config.columns && config.columns.length > 0 ? config.columns[0] : 'createdAt') || '';
            return valA < valB ? 1 : -1;
          } else if (config.sortBy === 'Order date') {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          return 0;
        });
      }

      return result;
    }

    return [];
  }, [flattenedOrders, type, config, widget.id]);

  const renderContent = () => {
    if (config.isConfigured === false) {
      return (
        <div className="d-flex flex-column align-items-center justify-content-center h-100 bg-light rounded-4 text-muted p-4">
          <i className="bi bi-gear fs-2 mb-2"></i>
          <p className="small fw-medium mb-0 text-center text-primary">
            Chart not yet developed. Please configure widget settings (chart type, parameters, differences) and click 'Apply' to generate the chart.
          </p>
        </div>
      );
    }

    if (!processedData || (Array.isArray(processedData) && processedData.length === 0)) {
      return (
        <div className="d-flex flex-column align-items-center justify-content-center h-100 bg-light rounded-4 text-muted p-4">
          <i className="bi bi-database-exclamation fs-2 mb-2"></i>
          <p className="small fw-medium mb-2 text-center">
            No orders found for the selected {config.xAxis?.split('.').pop() || 'criteria'}.
          </p>
          {customerFilter && (
            <p className="small text-muted mb-3 text-center">
              Filtering by customer(s): {customerFilter.split(',').join(', ')}
            </p>
          )}
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => { window.location.hash = '#/orders'; }}
            >
              Add customer orders
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={handleRefresh}
            >
              Refresh widget
            </button>
          </div>
        </div>
      );
    }

    switch (type) {
      case 'kpi':
        const currencyCode = flattenedOrders[0]?.order?.currency || 'USD';
        const currencySymbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥', CAD: 'C$', AUD: 'A$' };
        const currencySymbol = currencySymbols[currencyCode] || '$';

        return (
          <div className="d-flex flex-column justify-content-center align-items-center h-100 py-3">
            <h1 className="fw-bold text-primary mb-1">
              {config.format === 'Currency' ? currencySymbol : ''}
              {typeof processedData === 'number' ? processedData.toLocaleString(undefined, { minimumFractionDigits: config.precision, maximumFractionDigits: config.precision }) : processedData}
            </h1>
            <small className="text-muted text-uppercase fw-bold">{config.aggregation} of {config.metric?.split('.').pop()}</small>
          </div>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <Tooltip cursor={{ fill: '#f8faf9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {processedData.map((entry, index) => {
                  const color = (config.customColors && config.customColors[index]) || config.color || '#54bd95';
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
                {config.showDataLabel && <LabelList dataKey="value" position="top" style={{ fontSize: '10px', fill: '#666' }} />}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="value" stroke={(config.customColors && config.customColors[0]) || config.color || '#54bd95'} strokeWidth={3} dot={{ r: 4, fill: (config.customColors && config.customColors[0]) || config.color || '#54bd95' }} activeDot={{ r: 6 }}>
                {config.showDataLabel && <LabelList dataKey="value" position="top" offset={10} style={{ fontSize: '10px', fill: '#666' }} />}
              </Line>
            </LineChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={processedData}>
              <defs>
                <linearGradient id={`colorArea-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={config.color || '#54bd95'} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={config.color || '#54bd95'} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="value" stroke={(config.customColors && config.customColors[0]) || config.color || '#54bd95'} fillOpacity={1} fill={`url(#colorArea-${widget.id})`} strokeWidth={3}>
                {config.showDataLabel && <LabelList dataKey="value" position="top" style={{ fontSize: '10px', fill: '#666' }} />}
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis type="category" dataKey="name" name="category" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <YAxis type="number" dataKey="value" name="value" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Scatter name="Data" data={processedData} fill={(config.customColors && config.customColors[0]) || config.color || '#54bd95'}>
                {config.showDataLabel && <LabelList dataKey="value" position="top" style={{ fontSize: '10px', fill: '#666' }} />}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={processedData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
              >
                {processedData.map((entry, index) => {
                  const color = (config.customColors && config.customColors[index]) || config.color || COLORS[index % COLORS.length];
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
                {config.showDataLabel && <LabelList dataKey="name" position="outside" style={{ fontSize: '10px' }} />}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              {config.showLegend && <Legend verticalAlign="bottom" height={36} />}
            </PieChart>
          </ResponsiveContainer>
        );
      case 'table':
        return (
          <div className="overflow-auto h-100 shadow-sm rounded border border-light">
            <RBTable striped hover size="sm" className="mb-0" style={{ fontSize: `${config.fontSize || 14}px` }}>
              <thead className="sticky-top" style={{ backgroundColor: config.headerBg || '#54bd95', color: 'white' }}>
                <tr>
                  {config.columns.map((col, idx) => (
                    <th key={idx} className="small fw-bold border-0 py-2 px-3">
                      {col.split('.').pop().replace(/([A-Z])/g, ' $1').trim()}
                    </th>
                  ))}
                  {!isConfiguring && <th className="small fw-bold border-0 py-2 px-3 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {processedData.slice(0, config.pagination || 5).map((o, i) => (
                  <tr key={i}>
                    {config.columns.map((col, idx) => {
                      const val = getNestedValue(o, col);
                      return (
                        <td key={idx} className="small py-2 px-3 border-light opacity-75">
                          {typeof val === 'number' && col.toLowerCase().includes('amount') ? (() => {
                            const currencySymbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥', CAD: 'C$', AUD: 'A$' };
                            const currencyCode = o?.order?.currency || 'INR';
                            const currencySymbol = currencySymbols[currencyCode] || '₹';
                            return `${currencySymbol}${val.toFixed(2)}`;
                          })() : val}
                        </td>
                      );
                    })}
                    {!isConfiguring && (
                      <td className="text-center py-2 px-3 border-light">
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="p-0 text-primary" 
                          onClick={() => widget.onEditOrder && widget.onEditOrder(o)}
                        >
                          <i className="bi bi-pencil-square"></i>
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </RBTable>
          </div>
        );
      default:
        return <div className="d-flex align-items-center justify-content-center h-100 text-muted">Widget Not Configured</div>;
    }
  };

  return (
    <Card className={`h-100 border-0 shadow-sm transition-all widget-container ${isConfiguring ? 'configuring' : ''}`}>
      <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          {isConfiguring && <i className="bi bi-grid-3x3-gap text-muted widget-drag-handle cursor-move" style={{ cursor: 'move' }}></i>}
          <h6 className="fw-bold mb-0 text-truncate" style={{ maxWidth: '150px' }}>{config.title || 'Untitled'}</h6>
        </div>
        <div className="d-flex align-items-center gap-2">
          {!isConfiguring && (
            <div className="d-flex align-items-center gap-2">
              <Form.Select 
                size="sm" 
                className="bg-light border-0 py-1 pe-4" 
                style={{ fontSize: '0.75rem', width: 'auto' }}
                value={localCustomerFilter || ''}
                onChange={(e) => setLocalCustomerFilter(e.target.value)}
              >
                <option value="">All Customers</option>
                {customerOptions.map(c => (
                  <option key={c.email} value={c.email}>{c.name}</option>
                ))}
              </Form.Select>
              <Button variant="link" size="sm" className="p-1 text-muted" onClick={handleRefresh} title="Refresh Widget">
                <i className="bi bi-arrow-clockwise"></i>
              </Button>
            </div>
          )}
          {isConfiguring && (
            <div className="widget-actions transition-all d-flex gap-2">
              <Button variant="light" size="sm" className="p-2 d-flex align-items-center justify-content-center" style={{ minWidth: '44px', minHeight: '44px' }} onClick={onSettings} title="Settings">
                <i className="bi bi-gear-fill text-muted"></i>
              </Button>
              <Button variant="light" size="sm" className="p-2 d-flex align-items-center justify-content-center" style={{ minWidth: '44px', minHeight: '44px' }} onClick={onRemove} title="Remove">
                <i className="bi bi-trash-fill text-danger"></i>
              </Button>
            </div>
          )}
        </div>
      </Card.Header>
      <Card.Body className="pt-0 pb-3 ps-3 pe-3 overflow-hidden">
        {config.description && <p className="small text-muted mb-3 text-truncate">{config.description}</p>}
        <div style={{ height: type === 'kpi' ? 'auto' : '200px' }}>
          {renderContent()}
        </div>
      </Card.Body>
    </Card>
  );
}

export default Widget;