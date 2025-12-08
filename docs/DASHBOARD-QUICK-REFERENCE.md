# 🚀 Dashboard Layout - Quick Reference

## File Structure

```
frontend/
├── components/dashboard/
│   ├── Sidebar.tsx          # Left nav sidebar
│   ├── Navbar.tsx           # Top navbar with user menu
│   ├── DashboardLayout.tsx  # Wrapper component
│   └── index.ts             # Exports
└── app/dashboard/
    ├── layout.tsx           # Auth check + layout wrapper
    ├── page.tsx             # Dashboard overview
    ├── upload/page.tsx      # Upload documents
    ├── widget/page.tsx      # Widget settings
    ├── usage/page.tsx       # Usage stats
    └── profile/page.tsx     # User profile
```

## Quick Commands

### Create New Dashboard Page

```bash
# 1. Create page file
touch frontend/app/dashboard/my-feature/page.tsx

# 2. Add content (page auto-inherits layout)
```

```typescript
// app/dashboard/my-feature/page.tsx
export default function MyFeaturePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Feature</h1>
      {/* Your content here */}
    </div>
  )
}
```

### Add to Sidebar

```typescript
// components/dashboard/Sidebar.tsx
import { IconStar } from '@/components/ui/icons'

const navigation: NavItem[] = [
  // ... existing items
  { name: 'My Feature', href: '/dashboard/my-feature', icon: IconStar },
]
```

## Common Patterns

### Page Header
```tsx
<div>
  <h1 className="text-3xl font-bold text-gray-900">Page Title</h1>
  <p className="mt-2 text-gray-600">Description text</p>
</div>
```

### Content Card
```tsx
<div className="bg-white rounded-lg border border-gray-200 p-6">
  <h2 className="text-xl font-semibold text-gray-900 mb-4">Card Title</h2>
  {/* Card content */}
</div>
```

### Grid Layout
```tsx
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
  {items.map(item => (
    <div key={item.id}>{/* Item */}</div>
  ))}
</div>
```

### Action Button
```tsx
<button className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
  <IconPlus className="h-4 w-4" />
  Add New
</button>
```

### Empty State
```tsx
<div className="text-center py-12">
  <IconDocument className="mx-auto h-12 w-12 text-gray-400" />
  <h3 className="mt-2 text-sm font-semibold text-gray-900">No items</h3>
  <p className="mt-1 text-sm text-gray-500">Get started by adding an item.</p>
</div>
```

## Tailwind Classes

### Layout
- Container: `space-y-6`
- Grid: `grid gap-6 sm:grid-cols-2 lg:grid-cols-3`
- Flex: `flex items-center justify-between`

### Typography
- H1: `text-3xl font-bold text-gray-900`
- H2: `text-xl font-semibold text-gray-900`
- H3: `text-lg font-medium text-gray-900`
- Body: `text-gray-600`
- Caption: `text-sm text-gray-500`

### Cards
- Base: `bg-white rounded-lg border border-gray-200 p-6`
- Hover: `hover:shadow-md transition-shadow`
- Gradient: `bg-gradient-to-r from-indigo-500 to-purple-600`

### Buttons
- Primary: `bg-indigo-600 text-white hover:bg-indigo-700`
- Secondary: `bg-gray-100 text-gray-900 hover:bg-gray-200`
- Danger: `bg-red-600 text-white hover:bg-red-700`
- Ghost: `text-gray-700 hover:bg-gray-100`

### Icons
- Small: `h-4 w-4`
- Medium: `h-5 w-5`
- Large: `h-6 w-6`

## Available Icons

```typescript
import {
  IconMessage,    // Chat
  IconArrowDown,  // Download/Upload
  IconUser,       // User/Profile
  IconCopy,       // Copy/Widget
  IconRefresh,    // Refresh/Stats
  IconSidebar,    // Dashboard/Menu
  IconPlus,       // Add
  IconTrash,      // Delete
  IconEdit,       // Edit
  IconCheck,      // Success
} from '@/components/ui/icons'
```

## Color Palette

```css
/* Sidebar */
bg-gray-900    /* Background */
text-gray-100  /* Text */
bg-gray-800    /* Active */
bg-gray-700    /* Hover */
text-indigo-400 /* Icon active */

/* Content */
bg-gray-50     /* Page background */
bg-white       /* Cards */
border-gray-200 /* Borders */
text-gray-900  /* Headings */
text-gray-600  /* Body text */
text-gray-500  /* Captions */

/* Accent */
bg-indigo-600  /* Primary buttons */
text-indigo-600 /* Links */
bg-indigo-50   /* Light accent bg */
```

## Navigation Items

Current routes in sidebar:
- `/dashboard` - Dashboard Overview
- `/dashboard/upload` - Upload Data
- `/dashboard/widget` - Widget Settings
- `/dashboard/chat` - Chat Interface
- `/dashboard/usage` - Usage Stats
- `/dashboard/profile` - Profile & API Key

## Responsive Breakpoints

```css
sm:  /* ≥ 640px  - Small tablets */
md:  /* ≥ 768px  - Tablets */
lg:  /* ≥ 1024px - Desktops */
xl:  /* ≥ 1280px - Large desktops */
2xl: /* ≥ 1536px - Extra large */
```

## State Management

### Sidebar State
```typescript
const [sidebarOpen, setSidebarOpen] = useState(false)

// Open
setSidebarOpen(true)

// Close
setSidebarOpen(false)

// Toggle
setSidebarOpen(!sidebarOpen)
```

### User Dropdown
```typescript
const [isDropdownOpen, setIsDropdownOpen] = useState(false)

// Toggle
setIsDropdownOpen(!isDropdownOpen)

// Close
setIsDropdownOpen(false)
```

## Testing

### Test Pages

1. **Desktop (≥ 1024px)**
   - Sidebar: Should be fixed on left
   - Content: Should have left margin
   - Navbar: Should show page title

2. **Tablet (768px - 1023px)**
   - Sidebar: Should be hidden, overlay when opened
   - Hamburger: Should be visible
   - Content: Should be full width

3. **Mobile (< 768px)**
   - Sidebar: Should be full-screen overlay
   - Navbar: Should be compact
   - Content: Should have proper padding

### Browser DevTools

```
Desktop: 1440 x 900
Tablet:  768 x 1024
Mobile:  375 x 667
```

## Troubleshooting

### Issue: Sidebar not visible on mobile
**Solution:** Check `isOpen` prop is passed correctly

### Issue: Active route not highlighted
**Solution:** Verify `usePathname()` returns correct path

### Issue: User data not showing
**Solution:** Check user prop is passed from layout.tsx

### Issue: Logout not working
**Solution:** Verify Supabase client is initialized

## Quick Checks

✅ Auth check in layout.tsx  
✅ User data passed to DashboardLayout  
✅ Sidebar navigation items updated  
✅ Icons imported correctly  
✅ Responsive classes added  
✅ Active route logic correct  
✅ Logout functionality working  

---

**Need more help?** Check `docs/DASHBOARD-LAYOUT-GUIDE.md` for detailed documentation.

