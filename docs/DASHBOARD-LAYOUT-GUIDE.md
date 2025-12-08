# 🎨 Dashboard Layout System Documentation

## Overview

A professional SaaS-style dashboard layout with a responsive sidebar navigation, top navbar, and clean content area.

## Architecture

```
frontend/
├── components/
│   └── dashboard/
│       ├── Sidebar.tsx         # Left navigation sidebar
│       ├── Navbar.tsx          # Top navbar with user menu
│       ├── DashboardLayout.tsx # Main layout wrapper
│       └── index.ts            # Export barrel
└── app/
    └── dashboard/
        ├── layout.tsx          # Server component wrapper
        ├── page.tsx            # Dashboard overview
        ├── upload/             # Upload section
        ├── widget/             # Widget settings
        ├── usage/              # Usage stats
        └── profile/            # User profile
```

## Components

### 1. **Sidebar.tsx** (Client Component)

**Features:**
- ✅ Fixed left sidebar (desktop) / Slide-out drawer (mobile)
- ✅ Active route highlighting using `usePathname()`
- ✅ Icons for each navigation item
- ✅ Smooth transitions and animations
- ✅ Brand logo at top
- ✅ System status indicator at bottom
- ✅ Responsive overlay for mobile

**Navigation Items:**
```typescript
- Dashboard → /dashboard
- Upload Data → /dashboard/upload
- Widget Settings → /dashboard/widget
- Chat → /dashboard/chat
- Usage → /dashboard/usage
- Profile & API Key → /dashboard/profile
```

**Styling:**
- Background: `bg-gray-900`
- Text: `text-gray-100`
- Active link: `bg-gray-800 text-white font-semibold`
- Hover: `hover:bg-gray-700`
- Width: `w-64` (256px)

### 2. **Navbar.tsx** (Client Component)

**Features:**
- ✅ Sticky top navigation bar
- ✅ Mobile hamburger menu button
- ✅ User dropdown menu
- ✅ Displays user name and email
- ✅ Logout functionality with toast notifications
- ✅ Profile link
- ✅ Responsive design

**User Menu Items:**
- Profile & API Key
- Log out (clears session and redirects to `/sign-in`)

**Styling:**
- Background: `bg-white`
- Height: `h-16` (64px)
- Border: `border-b border-gray-200`
- Sticky: `sticky top-0 z-30`

### 3. **DashboardLayout.tsx** (Client Component)

**Features:**
- ✅ Combines Sidebar and Navbar
- ✅ Manages sidebar open/close state
- ✅ Full-height layout with overflow handling
- ✅ Responsive main content area

**Layout Structure:**
```jsx
<div className="flex h-screen overflow-hidden bg-gray-50">
  <Sidebar />
  <div className="flex flex-1 flex-col overflow-hidden">
    <Navbar />
    <main className="flex-1 overflow-y-auto">
      {children}
    </main>
  </div>
</div>
```

### 4. **layout.tsx** (Server Component)

**Features:**
- ✅ Server-side authentication check
- ✅ Redirects to `/sign-in` if not authenticated
- ✅ Passes user data to client components
- ✅ Sets page metadata

## Responsive Behavior

### Desktop (≥ 1024px)
- Sidebar: Fixed, always visible on left
- Navbar: Full width, shows page title
- Content: Flows to the right of sidebar
- Layout: `lg:translate-x-0 lg:static`

### Tablet (768px - 1023px)
- Sidebar: Overlay drawer (hidden by default)
- Navbar: Shows hamburger menu
- Content: Full width
- User menu: Dropdown with email

### Mobile (< 768px)
- Sidebar: Full-screen overlay when open
- Navbar: Compact, shows hamburger only
- Content: Full width with padding
- User menu: Icon only, email in dropdown

## Usage

### Adding a New Dashboard Page

1. **Create the page:**
```typescript
// app/dashboard/my-page/page.tsx
export default function MyPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Page</h1>
      {/* Your content */}
    </div>
  )
}
```

2. **Add to sidebar navigation:**
```typescript
// components/dashboard/Sidebar.tsx
const navigation: NavItem[] = [
  // ... existing items
  { name: 'My Page', href: '/dashboard/my-page', icon: IconStar },
]
```

3. **The layout automatically wraps your page!**

### Accessing User Data

User data is available through the Navbar component and can be accessed via:

```typescript
const session = await auth({ cookieStore })
const user = session?.user
```

## Styling Guide

### Color Palette

**Sidebar:**
- Background: `#111827` (gray-900)
- Text: `#F9FAFB` (gray-100)
- Active: `#1F2937` (gray-800)
- Hover: `#374151` (gray-700)
- Accent: `#4F46E5` (indigo-600)

**Navbar:**
- Background: `#FFFFFF` (white)
- Text: `#111827` (gray-900)
- Border: `#E5E7EB` (gray-200)

**Content Area:**
- Background: `#F9FAFB` (gray-50)
- Cards: `bg-white` with `border-gray-200`

### Common Patterns

**Page Header:**
```tsx
<div>
  <h1 className="text-3xl font-bold text-gray-900">Page Title</h1>
  <p className="mt-2 text-gray-600">Description</p>
</div>
```

**Content Card:**
```tsx
<div className="bg-white rounded-lg border border-gray-200 p-6">
  {/* Card content */}
</div>
```

**Grid Layout:**
```tsx
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
  {/* Grid items */}
</div>
```

## Icons

Icons are imported from `@/components/ui/icons`:

```typescript
import {
  IconMessage,    // Chat/messaging
  IconArrowDown,  // Download/upload
  IconUser,       // User/profile
  IconCopy,       // Copy/widget
  IconRefresh,    // Refresh/stats
  IconSidebar,    // Dashboard/menu
} from '@/components/ui/icons'
```

## Navigation Flow

```
User visits /dashboard
  ↓
layout.tsx checks auth
  ↓ (authenticated)
DashboardLayout renders
  ↓
Sidebar shows on left
Navbar shows on top
page.tsx content renders
  ↓
User clicks nav item
  ↓
Next.js client-side navigation
  ↓
New page renders (no reload!)
Active route highlighted
```

## Authentication

**Protected Routes:**
- All `/dashboard/*` routes require authentication
- Check happens in `app/dashboard/layout.tsx`
- Unauthenticated users redirected to `/sign-in`

**Logout Flow:**
1. User clicks "Log out" in navbar dropdown
2. `supabase.auth.signOut()` called
3. Local storage cleared
4. Toast notification shown
5. Redirect to `/sign-in`

## Mobile UX

### Opening Sidebar
1. User taps hamburger menu in navbar
2. `onMenuClick()` triggered
3. `setSidebarOpen(true)` updates state
4. Sidebar slides in from left
5. Dark overlay appears

### Closing Sidebar
1. User taps:
   - Close button (X) in sidebar header
   - Dark overlay
   - Any navigation link
2. `onClose()` or `setSidebarOpen(false)` called
3. Sidebar slides out to left
4. Overlay fades out

## Performance

**Optimizations:**
- ✅ Client components only where needed (interactivity)
- ✅ Server components for static content (layout.tsx)
- ✅ CSS transitions (no JavaScript animations)
- ✅ Lazy loading with Next.js automatic code splitting
- ✅ No unnecessary re-renders (proper state management)

## Accessibility

**Features:**
- ✅ Semantic HTML (`<nav>`, `<aside>`, `<main>`)
- ✅ ARIA labels for icon buttons
- ✅ Keyboard navigation support
- ✅ Focus management for modals/dropdowns
- ✅ High contrast text (WCAG AA compliant)
- ✅ Screen reader friendly

## Troubleshooting

### Sidebar not showing
**Check:**
1. Is `lg:translate-x-0` in Sidebar component?
2. Is sidebar state managed correctly?
3. Are breakpoints correct in `tailwind.config.js`?

### Active route not highlighting
**Check:**
1. Is `usePathname()` returning correct path?
2. Is comparison logic correct in Sidebar?
3. Are hrefs matching exactly?

### User menu not working
**Check:**
1. Is user data passed from layout to DashboardLayout?
2. Is dropdown state managed correctly?
3. Are click handlers attached?

### Mobile menu not opening
**Check:**
1. Is `onMenuClick` prop passed to Navbar?
2. Is `setSidebarOpen` working?
3. Is `z-index` correct for overlay?

## Future Enhancements

**Potential additions:**
- [ ] Breadcrumbs for nested routes
- [ ] Search bar in navbar
- [ ] Notifications bell icon
- [ ] Dark mode toggle
- [ ] Keyboard shortcuts
- [ ] Collapsible sidebar option
- [ ] Multi-tenant switcher
- [ ] Recent activity widget
- [ ] Help/documentation link
- [ ] Settings cogwheel icon

## Examples

### Custom Dashboard Card

```tsx
function DashboardCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  )
}
```

### Action Button

```tsx
<button className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
  <IconPlus className="h-4 w-4" />
  Add New
</button>
```

### Empty State

```tsx
<div className="text-center py-12">
  <IconDocument className="mx-auto h-12 w-12 text-gray-400" />
  <h3 className="mt-2 text-sm font-semibold text-gray-900">No documents</h3>
  <p className="mt-1 text-sm text-gray-500">Get started by uploading a document.</p>
  <div className="mt-6">
    <button className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
      <IconPlus className="h-4 w-4" />
      Upload Document
    </button>
  </div>
</div>
```

---

## Summary

The new dashboard layout provides:
- ✅ Professional SaaS appearance
- ✅ Fully responsive design
- ✅ Easy navigation for all features
- ✅ Clean, maintainable code structure
- ✅ Great user experience on all devices
- ✅ Built with modern Next.js 15 patterns

**Ready to use!** All dashboard pages automatically inherit this layout. 🎉

