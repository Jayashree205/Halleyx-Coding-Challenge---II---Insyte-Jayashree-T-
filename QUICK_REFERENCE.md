# Responsive Grid - Quick Reference Card

## 📱 Device Breakpoints at a Glance

```
Mobile       │ Tablet       │ Desktop
────────────────────────────────────
< 576px      │ 576-767px    │ 768-1199px    │ ≥ 1200px
4-col        │ 4-col        │ 8-col         │ 12-col
Full-width   │ 2×2 grid     │ Multi-column  │ Flexible
```

---

## 🎯 Widget Width Cheatsheet

### **Desktop (12-column grid)**

| Width | Columns | Widgets/Row | Use Case |
|-------|---------|------------|----------|
| w: 12 | 12 | 1 | Full-width reports, main metrics |
| w: 6 | 6 | 2 | Complementary charts, side-by-side |
| w: 4 | 4 | 3 | Balanced KPI layout |
| w: 3 | 3 | 4 | Detailed metrics grid |

**Popular Configurations:**
```
[12]              → Single full-width widget
[4, 4, 4]         → Three equal widgets
[6, 6]            → Two equal widgets
[8, 4]            → Large + sidebar
[6, 3, 3]         → One main, two secondary
```

### **Tablet Auto-Conversion (768-1199px)**

```
Desktop  →  Tablet
  12     →    8  (full width)
  6      →    4  (half width)
  4      →    4  (same)
  3      →    2  (auto-scaled)
```

### **Mobile Auto-Stack (< 768px)**

```
All widgets → 4 columns (full width)
No changes needed - automatic!
```

---

## 🔧 Widget Configuration Template

```javascript
// In Database or Widget Manager
const widget = {
  id: "widget_1",
  title: "Sales Chart",
  type: "chart",
  grid: {
    x: 0,
    y: 0,
    w: 6,        // Desktop: 6 columns (50% width)
    h: 4,        // Height in grid units
    static: false // Allow resize/drag (disable on mobile)
  },
  config: {
    // Widget-specific options
  }
}
```

---

## 🎮 React Grid Layout Props

```jsx
<Responsive
  layouts={{
    lg: widgets,  // Desktop layout (≥1200px)
    md: widgets,  // Tablet layout (768-1199px)
    sm: widgets,  // Mobile tablet (576-767px)
    xs: widgets   // Mobile phone (<576px)
  }}
  breakpoints={{ lg: 1200, md: 768, sm: 576, xs: 0 }}
  cols={{ lg: 12, md: 8, sm: 4, xs: 4 }}
  rowHeight={80}
  margin={[15, 15]}  // [horizontal, vertical]
  verticalCompact={true}
  compactType="vertical"
/>
```

---

## 📐 Media Query Reference

### **CSS Responsive Classes**

```css
/* Desktop (1200px+) */
@media (min-width: 1200px) { /* 12-col styles */ }

/* Tablet (768-1199px) */
@media (min-width: 768px) and (max-width: 1199px) { /* 8-col styles */ }

/* Mobile Tablet (576-767px) */
@media (min-width: 576px) and (max-width: 767px) { /* 4-col styles */ }

/* Mobile Phone (<576px) */
@media (max-width: 575px) { /* Full-width styles */ }
```

### **Bootstrap Utility Classes**

```jsx
{/* Hide on mobile, show on desktop */}
<div className="d-none d-md-block">...</div>

{/* Full width on mobile, auto on desktop */}
<div className="w-100 w-md-auto">...</div>

{/* Stack vertical on mobile, horizontal on desktop */}
<div className="flex-column flex-md-row">...</div>
```

---

## ✅ Testing Checklist

- [ ] Desktop (1920×1080): 12-col grid, all widgets display
- [ ] Tablet (1024×768): 8-col grid, overflow handling works
- [ ] Mobile Tablet (768×600): 4-col grid, 2×2 layout
- [ ] Mobile Phone (375×667): Full-width stacking, no scroll
- [ ] Portrait ↔ Landscape: Layout reflows smoothly
- [ ] Touch: No dragging issues on mobile
- [ ] Scrolling: Smooth with no jank

---

## 🚨 Common Issues & Fixes

### **Issue: Widget not resizing on mobile**
```javascript
// ❌ Don't hardcode widths
width: '400px'

// ✅ Use responsive sizing
maxWidth: '100%'
width: 'calc(100% - 30px)'
```

### **Issue: Text too small on mobile**
```css
/* ❌ Fixed size */
font-size: 16px;

/* ✅ Responsive with clamp() */
font-size: clamp(14px, 2vw, 16px);
```

### **Issue: Widgets not stacking on mobile**
```javascript
// Ensure xs layout is defined
xs: widgets.map(w => ({
  ...w,
  w: 4,  // Full width on mobile
  h: w.h || 5
}))
```

### **Issue: Layout jumping on resize**
```javascript
// Use debounced resize listener
useEffect(() => {
  const timer = setTimeout(() => {
    // Recalculate layout
  }, 250);
  return () => clearTimeout(timer);
}, [width]);
```

---

## 📊 Height Unit Reference

```
h: 1  → ~80px   (small metric)
h: 2  → ~160px  (compact card)
h: 3  → ~240px  (normal widget)
h: 4  → ~320px  (medium chart)
h: 5  → ~400px  (large chart)
h: 6  → ~480px  (full screen chart)
```

---

## 🎨 Widget Best Practices

✅ **DO:**
- Use responsive widths (6, 4, 3 for desktop)
- Stack widgets vertically on mobile
- Use relative sizing (%, vw, clamp())
- Test at three breakpoints minimum
- Provide touch targets ≥ 44×44px

❌ **DON'T:**
- Use fixed pixel widths
- Assume desktop layout
- Put too many widgets in one row
- Force horizontal scroll on mobile
- Use tiny text (< 14px) without clamp()

---

## 🔍 Debugging Tips

### **Check current breakpoint:**
```javascript
// In component
const [currentBreakpoint, setCurrentBreakpoint] = useState('lg');

// Watch grid-info-banner for active breakpoint
```

### **Inspect grid in DevTools:**
```
F12 → Elements Tab
Find: .react-grid-layout or .dashboard-grid-container
Check: data-grid-cols attribute for current column count
```

### **Test responsive dimensions:**
```javascript
window.innerWidth  // Current viewport width
// 375 = mobile, 768 = tablet, 1200 = desktop
```

---

## 📚 File Locations

- **Grid Styles**: `client/src/index.css` (lines 650-1050)
- **Dashboard Component**: `client/src/pages/Dashboard.jsx`
- **Widget Component**: `client/src/components/Widget.jsx`
- **Full Guide**: `RESPONSIVE_GRID_GUIDE.md`

---

## 🎯 Quick Start: Add New Widget

```javascript
// 1. Define widget with responsive grid
const newWidget = {
  id: uniqueId(),
  title: 'New Widget',
  grid: {
    x: 0, y: 0,
    w: 6,  // Desktop: 50% (will auto-adjust on tablet/mobile)
    h: 4   // Height: 4 grid units
  }
}

// 2. Save to database
await saveWidget(newWidget);

// 3. On tablet/mobile: auto-converts
// w: 6 → 4 (tablet 50%) → 4 (mobile full-width)

// Done! Responsive automatically.
```

---

**Last Updated**: [Today's Date]  
**Version**: 1.0 - Responsive Grid System v1

