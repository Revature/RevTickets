# Analytics Buttons Testing Guide

## Overview
This guide provides testing steps to verify that analytics buttons are correctly displayed and functional in the header sections of all three pages.

## Test Pages
1. **My Tickets** (`/tickets`)
2. **Knowledge Base** (`/knowledge-base`)
3. **KB Chat** (`/knowledge-base/chat`)

## Prerequisites
- Application is running (all containers started)
- User is logged in
- Browser DevTools available (F12)

## Test Scenarios

### Test 1: My Tickets Page - Analytics Button

**Steps:**
1. Navigate to: `http://localhost:3000/tickets`
2. Look at the page header section (top of the page)
3. **Expected Result:**
   - Header shows "My Tickets" title on the left
   - Analytics button with BarChart3 icon is visible on the right side of header
   - Button text says "Analytics"
   - Button is blue colored

**Verification:**
- ✅ Button is visible in header
- ✅ Button has icon (BarChart3)
- ✅ Button text is "Analytics"
- ✅ Button is positioned correctly (right side of header)

**Click Test:**
1. Click the Analytics button
2. **Expected Result:**
   - Page navigates to `/knowledge-base/analytics`
   - Analytics dashboard loads
   - No logout occurs

**Verification:**
- ✅ Navigation works correctly
- ✅ Analytics page loads
- ✅ User remains logged in

---

### Test 2: Knowledge Base Page - Analytics Button

**Steps:**
1. Navigate to: `http://localhost:3000/knowledge-base`
2. Look at the page header section
3. **Expected Result:**
   - Header shows "Knowledge Base" title on the left
   - Analytics button is visible in the header buttons area
   - If user is an agent: "New Article" button is also visible
   - Analytics button appears before "New Article" button (if agent)
   - Button has BarChart3 icon and "Analytics" text

**Verification:**
- ✅ Button is visible in header
- ✅ Button has icon (BarChart3)
- ✅ Button text is "Analytics"
- ✅ Button positioning is correct (before "New Article" for agents)

**Click Test:**
1. Click the Analytics button
2. **Expected Result:**
   - Page navigates to `/knowledge-base/analytics`
   - Analytics dashboard loads
   - No logout occurs

**Verification:**
- ✅ Navigation works correctly
- ✅ Analytics page loads
- ✅ User remains logged in

---

### Test 3: KB Chat Page - Analytics Button

**Steps:**
1. Navigate to: `http://localhost:3000/knowledge-base/chat`
2. Look at the page header section (newly added header)
3. **Expected Result:**
   - Header section is visible at the top
   - Header shows "Knowledge Base Chat" title on the left
   - Subtitle: "Get instant answers from our knowledge base using AI"
   - Analytics button is visible on the right side of header
   - Button has BarChart3 icon and "Analytics" text

**Verification:**
- ✅ Header section exists
- ✅ Title and subtitle are displayed
- ✅ Analytics button is visible in header
- ✅ Button has icon (BarChart3)
- ✅ Button text is "Analytics"

**Click Test:**
1. Click the Analytics button
2. **Expected Result:**
   - Page navigates to `/knowledge-base/analytics`
   - Analytics dashboard loads
   - No logout occurs

**Verification:**
- ✅ Navigation works correctly
- ✅ Analytics page loads
- ✅ User remains logged in

---

### Test 4: Analytics Page - No Logout Issue

**Steps:**
1. Navigate directly to: `http://localhost:3000/knowledge-base/analytics`
2. Wait for page to load
3. **Expected Result:**
   - Analytics dashboard loads
   - User remains logged in
   - No redirect to login page
   - Dashboard shows analytics data (or empty state if no data)

**Verification:**
- ✅ Page loads without logging out
- ✅ User stays authenticated
- ✅ Analytics dashboard displays correctly
- ✅ No console errors related to authentication

**Error Handling Test:**
1. If API call fails (simulate by stopping backend temporarily)
2. **Expected Result:**
   - Error message displays: "Failed to load analytics"
   - Retry button is available
   - User is NOT logged out
   - User can retry or navigate away

**Verification:**
- ✅ Error handling works gracefully
- ✅ No automatic logout on API errors
- ✅ User can retry or navigate

---

### Test 5: Visual Consistency

**Steps:**
1. Navigate through all three pages:
   - `/tickets`
   - `/knowledge-base`
   - `/knowledge-base/chat`
2. Compare analytics buttons on each page
3. **Expected Result:**
   - All buttons have same styling (blue color)
   - All buttons have same icon (BarChart3)
   - All buttons have same text ("Analytics")
   - All buttons are consistently positioned (right side of header)

**Verification:**
- ✅ Consistent styling across all pages
- ✅ Consistent icon usage
- ✅ Consistent positioning
- ✅ Professional appearance

---

### Test 6: Responsive Design

**Steps:**
1. Open any of the three pages with analytics button
2. Resize browser window to mobile size (375px width)
3. **Expected Result:**
   - Analytics button remains visible
   - Button is still clickable
   - Button text/icon doesn't overflow
   - Layout adapts appropriately

**Verification:**
- ✅ Button works on mobile view
- ✅ No layout issues
- ✅ Button remains accessible

---

### Test 7: Multiple Navigation Paths

**Steps:**
1. Start from My Tickets page
2. Click Analytics button → Should go to analytics
3. Navigate back to Knowledge Base page
4. Click Analytics button → Should go to analytics
5. Navigate back to KB Chat page
6. Click Analytics button → Should go to analytics
7. **Expected Result:**
   - All navigation paths work correctly
   - No errors occur
   - User remains logged in throughout

**Verification:**
- ✅ All navigation paths work
- ✅ No navigation errors
- ✅ Consistent behavior

---

## Browser Console Check

**Steps:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to each page with analytics button
4. Click analytics buttons
5. **Expected Result:**
   - No errors in console
   - No warnings about missing components
   - No authentication errors
   - No navigation errors

**Verification:**
- ✅ No console errors
- ✅ No warnings
- ✅ Clean console output

---

## Checklist Summary

### My Tickets Page
- [ ] Analytics button visible in header
- [ ] Button has BarChart3 icon
- [ ] Button text says "Analytics"
- [ ] Button navigates to analytics page
- [ ] No logout occurs

### Knowledge Base Page
- [ ] Analytics button visible in header
- [ ] Button has BarChart3 icon
- [ ] Button text says "Analytics"
- [ ] Button positioned correctly (before "New Article" for agents)
- [ ] Button navigates to analytics page
- [ ] No logout occurs

### KB Chat Page
- [ ] Header section exists
- [ ] Analytics button visible in header
- [ ] Button has BarChart3 icon
- [ ] Button text says "Analytics"
- [ ] Button navigates to analytics page
- [ ] No logout occurs

### Analytics Page
- [ ] Page loads without logging out
- [ ] Dashboard displays correctly
- [ ] Error handling works (if API fails)
- [ ] No automatic logout on errors

### General
- [ ] Consistent styling across all pages
- [ ] Responsive design works
- [ ] No console errors
- [ ] All navigation paths work

---

## Troubleshooting

### Issue: Analytics button not visible
**Solution:**
1. Check browser console for errors
2. Verify page is fully loaded
3. Check if user is logged in
4. Hard refresh page (Ctrl+F5)

### Issue: Button doesn't navigate
**Solution:**
1. Check browser console for JavaScript errors
2. Verify router is working: `router.push('/knowledge-base/analytics')`
3. Check if analytics page route exists

### Issue: Logout occurs when clicking button
**Solution:**
1. Check API client error handling
2. Verify authentication token is valid
3. Check backend logs for 401 errors
4. Verify ProtectedRoute is working correctly

### Issue: Button styling looks wrong
**Solution:**
1. Check if Flowbite React Button component is imported
2. Verify Tailwind CSS is loading
3. Check for CSS conflicts
4. Verify icon import from lucide-react

---

## Expected Code Locations

### My Tickets Page
- File: `frontend/app/tickets/page.tsx`
- Button location: Header section, right side
- Import: `BarChart3` from `lucide-react`

### Knowledge Base Page
- File: `frontend/app/knowledge-base/page.tsx`
- Button location: Header buttons area, before "New Article"
- Import: `BarChart3` from `lucide-react`

### KB Chat Page
- File: `frontend/app/knowledge-base/chat/page.tsx`
- Button location: New header section, right side
- Import: `BarChart3` from `lucide-react`

---

## Notes

- All analytics buttons use the same icon (BarChart3) for consistency
- All buttons navigate to `/knowledge-base/analytics`
- Buttons are styled with Flowbite React Button component
- Buttons use `color="blue"` and `size="sm"` for consistency
- Navigation uses Next.js `router.push()` for client-side routing
- Analytics page has improved error handling to prevent logout

