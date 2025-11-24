# Chat Analytics Dashboard Testing Guide

## Overview
This guide provides step-by-step instructions for testing the Chat Analytics Dashboard feature.

## Prerequisites
1. Application is running (all containers started)
2. You have a user account (can be regular user or agent)
3. You have created at least one chat session with some messages

## Test Environment Setup

### 1. Verify Application is Running
```powershell
# Check all containers are running
docker-compose ps

# Check frontend logs
docker logs nextjs-frontend --tail 20

# Check backend logs
docker logs fastapi-backend --tail 20
```

### 2. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/v1

## Test Scenarios

### Test 1: Access Analytics Dashboard

**Steps:**
1. Log in to the application
2. Navigate to: `http://localhost:3000/knowledge-base/analytics`
3. **Expected Result:**
   - Dashboard page loads successfully
   - Header shows "Chat Analytics Dashboard"
   - Date range selector is visible (default: Last 30 days)
   - Refresh button is visible

**Verification:**
- ✅ Page loads without errors
- ✅ All UI elements are visible
- ✅ No console errors in browser DevTools

---

### Test 2: Dashboard with No Data

**Steps:**
1. If you have no chat sessions, the dashboard should still load
2. Check all metric cards
3. **Expected Result:**
   - All summary cards show `0` or `N/A`
   - "No articles referenced yet" message appears
   - "No topics tracked yet" message appears
   - Sessions trend chart may be empty or show no data

**Verification:**
- ✅ Dashboard handles empty state gracefully
- ✅ No errors thrown
- ✅ Placeholder messages are displayed

---

### Test 3: Create Test Chat Data

**Steps:**
1. Navigate to: `http://localhost:3000/knowledge-base/chat`
2. Click "Start New Chat"
3. Send at least 3-4 messages to the chatbot
   - Example: "How do I reset my password?"
   - Example: "What are your business hours?"
   - Example: "How do I create a ticket?"
4. Rate the session (if rating feature is available)
5. Optionally convert one chat to a ticket

**Verification:**
- ✅ Chat sessions are created
- ✅ Messages are saved
- ✅ Rating is recorded (if applicable)
- ✅ Ticket conversion works (if tested)

---

### Test 4: View Analytics with Data

**Steps:**
1. Navigate back to: `http://localhost:3000/knowledge-base/analytics`
2. Wait for data to load
3. **Expected Result:**
   - Summary cards show actual numbers:
     - Total Sessions: > 0
     - Total Messages: > 0
     - Conversion Rate: percentage
     - Avg Satisfaction: rating or N/A
   - Session Metrics card shows:
     - Active Sessions count
     - Avg Messages/Session
     - Avg Duration
     - Converted to Tickets count
   - Message Breakdown shows:
     - User Messages count
     - Assistant Messages count
     - Visual ratio bar
   - Conversion Stats shows:
     - Total Sessions
     - Converted count
     - Not Converted count
     - Progress bar

**Verification:**
- ✅ All metrics display correct values
- ✅ Numbers match actual chat data
- ✅ Visualizations render correctly

---

### Test 5: Sessions Trend Chart

**Steps:**
1. On the analytics dashboard, scroll to "Sessions Over Time" section
2. **Expected Result:**
   - Bar chart displays sessions by date
   - Each bar represents sessions created on that date
   - Hover over bars shows tooltip with date and count
   - Dates are displayed below bars

**Verification:**
- ✅ Chart renders correctly
- ✅ Bars are proportional to session counts
- ✅ Dates are readable
- ✅ Tooltips work on hover

---

### Test 6: Top Articles Section

**Steps:**
1. Scroll to "Most Referenced Articles" section
2. **Expected Result:**
   - List of articles that were referenced in chat responses
   - Each article shows:
     - Rank number (#1, #2, etc.)
     - Article title
     - Reference count badge
   - Articles are sorted by reference count (highest first)

**Verification:**
- ✅ Articles are displayed correctly
- ✅ Reference counts are accurate
- ✅ Ranking is correct
- ✅ If no articles referenced, shows "No articles referenced yet"

---

### Test 7: Top Topics Section

**Steps:**
1. Scroll to "Top Topics Discussed" section
2. **Expected Result:**
   - List of topics that were discussed in chats
   - Each topic shows:
     - Rank number (#1, #2, etc.)
     - Topic name
     - Count badge
   - Topics are sorted by count (highest first)

**Verification:**
- ✅ Topics are displayed correctly
- ✅ Counts are accurate
- ✅ Ranking is correct
- ✅ If no topics tracked, shows "No topics tracked yet"

---

### Test 8: Date Range Filtering

**Steps:**
1. Use the date range selector dropdown (top right)
2. Select "Last 7 days"
3. Click "Refresh" button
4. **Expected Result:**
   - Dashboard reloads with data from last 7 days only
   - All metrics update to reflect the new date range
   - Sessions trend chart shows only last 7 days

5. Repeat with:
   - "Last 30 days"
   - "Last 90 days"
   - "Last year"

**Verification:**
- ✅ Date range selector works
- ✅ Data updates correctly for each range
- ✅ Metrics reflect the selected time period
- ✅ No errors occur when changing ranges

---

### Test 9: Refresh Functionality

**Steps:**
1. Create a new chat session with messages
2. Navigate to analytics dashboard
3. Note the current "Total Sessions" count
4. Create another chat session
5. Click "Refresh" button on analytics dashboard
6. **Expected Result:**
   - Dashboard reloads data
   - "Total Sessions" count increases by 1
   - All metrics update to reflect new data

**Verification:**
- ✅ Refresh button works
- ✅ Data is fetched fresh from API
- ✅ Metrics update correctly

---

### Test 10: Error Handling

**Steps:**
1. Stop the backend container: `docker stop fastapi-backend`
2. Navigate to analytics dashboard
3. **Expected Result:**
   - Error message displays: "Failed to load analytics"
   - Retry button is visible
   - No crash or blank page

4. Restart backend: `docker start fastapi-backend`
5. Click "Retry" button
6. **Expected Result:**
   - Dashboard loads successfully after retry

**Verification:**
- ✅ Error handling works gracefully
- ✅ User-friendly error messages
- ✅ Retry functionality works

---

### Test 11: Responsive Design

**Steps:**
1. Open analytics dashboard in browser
2. Resize browser window to mobile size (375px width)
3. **Expected Result:**
   - All cards stack vertically
   - Charts remain readable
   - Text doesn't overflow
   - Buttons remain accessible

4. Test on tablet size (768px width)
5. **Expected Result:**
   - Layout adapts appropriately
   - Grid columns adjust

**Verification:**
- ✅ Dashboard is responsive
- ✅ All elements are accessible on mobile
- ✅ No horizontal scrolling required

---

### Test 12: API Endpoint Testing

**Steps:**
1. Get your auth token from browser localStorage or login response
2. Test API endpoint directly:
```powershell
# Replace YOUR_TOKEN with actual token
$token = "YOUR_TOKEN"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Test with default 30 days
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/kb-chat/analytics" -Headers $headers -Method Get

# Test with 7 days
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/kb-chat/analytics?days=7" -Headers $headers -Method Get
```

**Expected Result:**
- API returns JSON with analytics data
- Structure matches expected format:
```json
{
  "summary": {
    "total_sessions": 0,
    "total_messages": 0,
    "active_sessions": 0,
    "converted_sessions": 0,
    "avg_messages_per_session": 0,
    "conversion_rate": 0,
    "avg_satisfaction_rating": 0,
    "avg_session_duration_minutes": 0,
    "user_messages": 0,
    "assistant_messages": 0
  },
  "top_articles": [],
  "sessions_trend": [],
  "top_topics": [],
  "date_range": {
    "start_date": "...",
    "end_date": "...",
    "days": 30
  }
}
```

**Verification:**
- ✅ API returns correct structure
- ✅ All fields are present
- ✅ Date range parameter works
- ✅ Authentication is required

---

## Performance Testing

### Test 13: Load Time

**Steps:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to analytics dashboard
4. **Expected Result:**
   - API call completes within 2-3 seconds
   - Page renders within 1 second after data loads
   - No unnecessary API calls

**Verification:**
- ✅ Dashboard loads quickly
- ✅ No performance issues
- ✅ Efficient data fetching

---

## Edge Cases

### Test 14: Very Large Dataset

**Steps:**
1. Create many chat sessions (if possible, use script or seed data)
2. Navigate to analytics dashboard
3. **Expected Result:**
   - Dashboard still loads successfully
   - Performance remains acceptable
   - All metrics calculate correctly

**Verification:**
- ✅ Handles large datasets
- ✅ No timeout errors
- ✅ Calculations are accurate

---

### Test 15: Concurrent Users

**Steps:**
1. Open analytics dashboard in multiple browser tabs
2. Refresh all tabs simultaneously
3. **Expected Result:**
   - All tabs load successfully
   - No race conditions
   - Data consistency maintained

**Verification:**
- ✅ Multiple concurrent requests work
- ✅ No data corruption
- ✅ Backend handles load properly

---

## Browser Compatibility

### Test 16: Cross-Browser Testing

**Steps:**
1. Test analytics dashboard in:
   - Chrome/Edge (Chromium)
   - Firefox
   - Safari (if on Mac)
2. **Expected Result:**
   - Dashboard works in all browsers
   - Visualizations render correctly
   - No browser-specific errors

**Verification:**
- ✅ Cross-browser compatibility
- ✅ Consistent appearance
- ✅ All features work

---

## Security Testing

### Test 17: Authentication

**Steps:**
1. Log out of the application
2. Try to access: `http://localhost:3000/knowledge-base/analytics`
3. **Expected Result:**
   - Redirected to login page
   - Cannot access dashboard without authentication

**Verification:**
- ✅ Authentication is enforced
- ✅ Unauthorized access is prevented

---

### Test 18: User Data Isolation

**Steps:**
1. Log in as User A
2. Create chat sessions as User A
3. Note analytics data
4. Log out and log in as User B
5. Check analytics dashboard
6. **Expected Result:**
   - User B only sees their own analytics
   - User B's data is different from User A's
   - No data leakage between users

**Verification:**
- ✅ Data isolation works correctly
- ✅ Users only see their own analytics
- ✅ No security vulnerabilities

---

## Checklist Summary

- [ ] Dashboard page loads successfully
- [ ] Empty state handled gracefully
- [ ] Summary cards display correct metrics
- [ ] Session metrics are accurate
- [ ] Message breakdown shows correct ratio
- [ ] Conversion stats are correct
- [ ] Sessions trend chart renders
- [ ] Top articles list displays correctly
- [ ] Top topics list displays correctly
- [ ] Date range filtering works
- [ ] Refresh button works
- [ ] Error handling works
- [ ] Responsive design works
- [ ] API endpoint returns correct data
- [ ] Performance is acceptable
- [ ] Cross-browser compatibility
- [ ] Authentication is enforced
- [ ] User data isolation works

---

## Troubleshooting

### Issue: Dashboard shows "Failed to load analytics"
**Solution:**
1. Check backend container is running: `docker ps`
2. Check backend logs: `docker logs fastapi-backend --tail 50`
3. Verify API endpoint: `curl http://localhost:8000/api/v1/kb-chat/analytics`
4. Check authentication token is valid

### Issue: All metrics show 0
**Solution:**
1. Verify chat sessions exist in database
2. Check date range includes when sessions were created
3. Verify sessions have messages
4. Check backend logs for errors

### Issue: Charts not rendering
**Solution:**
1. Check browser console for JavaScript errors
2. Verify CSS is loading correctly
3. Check if browser supports required features
4. Try hard refresh (Ctrl+F5)

### Issue: Slow loading
**Solution:**
1. Check database performance
2. Verify indexes exist on chat collections
3. Check network latency
4. Review backend query performance

---

## Notes

- Analytics data is calculated in real-time from the database
- Date ranges are based on UTC timezone
- Empty states are handled gracefully
- The dashboard is read-only (no data modification)
- All metrics are calculated server-side for accuracy

