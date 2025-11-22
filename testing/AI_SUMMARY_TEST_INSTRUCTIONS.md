# AI Ticket Summary Feature - Test Instructions

## Overview
This document provides comprehensive test instructions for validating the AI Ticket Summary feature enhancements in the ticket details page.

## Prerequisites
1. **Application Running**: Ensure the frontend and backend are running
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000

2. **User Access**: You need an **Agent** account to test AI summary features
   - Agent credentials (from seed data):
     - Email: `sarah.wilson@company.com` / Password: `password123`
     - Email: `david.brown@company.com` / Password: `password123`
     - Email: `lisa.davis@company.com` / Password: `password123`

3. **Test Ticket**: Have at least one ticket with comments for testing
   - Create a ticket or use existing ticket with multiple comments
   - Ticket should be assigned to an agent (not closed)

---

## Test Cases

### Test Case 1: Generate Summary Button - Initial Generation

**Objective**: Verify the "Generate Summary" button works correctly for first-time generation.

**Steps**:
1. Log in as an agent user
2. Navigate to a ticket detail page (`/tickets/[id]`)
3. Ensure the ticket is not closed
4. Locate the "AI Ticket Summary" section (purple-bordered box)
5. Click the "Generate Summary" button (orange button with sparkles icon)

**Expected Results**:
- ✅ Button text changes to "Generating..." with a spinning loader
- ✅ Button becomes disabled during generation
- ✅ Loading state appears with:
  - Large spinning purple circle
  - Text: "AI is analyzing the ticket conversation..."
  - Subtext: "This may take a few moments"
- ✅ After completion (5-30 seconds):
  - Summary appears in a white card
  - Summary text is displayed
  - Timestamp shows when it was generated
  - Word count and character count are displayed
  - "Available" badge appears in the header

**Validation Checklist**:
- [ ] Button shows loading state correctly
- [ ] Loading message is clear and informative
- [ ] Summary appears after generation completes
- [ ] Summary content is relevant to the ticket
- [ ] Timestamp is accurate
- [ ] Metadata (word/character count) is displayed

---

### Test Case 2: Summary Display Component

**Objective**: Verify the summary display component shows all information correctly.

**Steps**:
1. Generate a summary (follow Test Case 1)
2. Review the summary display card

**Expected Results**:
- ✅ Card has white background (dark mode: gray-800)
- ✅ Header shows:
  - Green checkmark icon
  - "Summary Generated" text
  - Timestamp on the right side
- ✅ Summary text is displayed in readable format
- ✅ Footer shows:
  - Word count and character count on the left
  - "Refresh" and "Hide" buttons on the right

**Validation Checklist**:
- [ ] Summary card layout is correct
- [ ] Header information is complete
- [ ] Summary text is formatted properly
- [ ] Timestamp format is correct (e.g., "Nov 21, 2025 at 12:34 PM")
- [ ] Word/character counts are accurate
- [ ] All buttons are visible and functional

---

### Test Case 3: Loading States - Initial Generation

**Objective**: Verify loading states work correctly during initial summary generation.

**Steps**:
1. Navigate to a ticket without a summary
2. Click "Generate Summary"
3. Observe the loading state

**Expected Results**:
- ✅ Large spinner (10x10) with purple border
- ✅ Loading message: "AI is analyzing the ticket conversation..."
- ✅ Subtext: "This may take a few moments"
- ✅ No summary card visible during loading
- ✅ Button remains disabled

**Validation Checklist**:
- [ ] Spinner animation is smooth
- [ ] Loading messages are clear
- [ ] UI doesn't flicker or jump
- [ ] Button state is correct

---

### Test Case 4: Loading States - Refresh

**Objective**: Verify loading states work correctly when refreshing an existing summary.

**Steps**:
1. Ensure a summary already exists (generate one if needed)
2. Click the "Refresh" button (circular arrow icon in header)
3. Observe the refresh loading state

**Expected Results**:
- ✅ Summary card becomes semi-transparent (opacity-75)
- ✅ Refresh icon spins
- ✅ Text: "Refreshing summary..."
- ✅ Original summary remains visible but dimmed
- ✅ Refresh button is disabled

**Validation Checklist**:
- [ ] Refresh state is visually distinct from initial generation
- [ ] Original summary remains visible
- [ ] Spinner animation works
- [ ] Button states are correct

---

### Test Case 5: Summary Refresh Functionality

**Objective**: Verify the refresh functionality regenerates the summary correctly.

**Steps**:
1. Generate a summary and note the timestamp
2. Add a new comment to the ticket
3. Click the "Refresh" button
4. Wait for refresh to complete

**Expected Results**:
- ✅ Summary is regenerated with new content
- ✅ Timestamp updates to current time
- ✅ New summary reflects the added comment
- ✅ Summary card updates smoothly
- ✅ No errors occur

**Alternative Test**:
1. Generate a summary
2. Click "Regenerate Summary" button (main orange button)
3. Verify it works the same as refresh

**Validation Checklist**:
- [ ] Summary updates correctly
- [ ] Timestamp updates
- [ ] Content reflects latest ticket state
- [ ] No duplicate summaries appear
- [ ] Ticket data refreshes correctly

---

### Test Case 6: Hide Summary Functionality

**Objective**: Verify users can hide the summary display.

**Steps**:
1. Ensure a summary is generated and visible
2. Click the "Hide" button (eye-off icon) in the summary footer
3. Observe the UI changes

**Expected Results**:
- ✅ Summary card disappears
- ✅ Indicator card appears showing:
  - Brain icon
  - Text: "Summary is available but hidden"
  - "Show Summary" button
- ✅ Header still shows "Available" badge
- ✅ Generate/Refresh buttons remain visible

**Validation Checklist**:
- [ ] Summary hides correctly
- [ ] Indicator card appears
- [ ] "Show Summary" button is visible
- [ ] Other controls remain accessible

---

### Test Case 7: Show Summary Functionality

**Objective**: Verify users can show a hidden summary.

**Steps**:
1. Hide a summary (follow Test Case 6)
2. Click the "Show Summary" button
3. Observe the UI changes

**Expected Results**:
- ✅ Summary card reappears
- ✅ Indicator card disappears
- ✅ All summary content is visible
- ✅ Timestamp and metadata are correct

**Alternative Test**:
1. Hide summary using the eye icon in the header
2. Click the eye icon again to show
3. Verify it works correctly

**Validation Checklist**:
- [ ] Summary shows correctly
- [ ] All content is visible
- [ ] No data is lost
- [ ] Transition is smooth

---

### Test Case 8: Timestamps and Metadata

**Objective**: Verify timestamps and metadata are displayed correctly.

**Steps**:
1. Generate a summary
2. Note the current time
3. Review the summary card

**Expected Results**:
- ✅ Timestamp in header shows:
  - Label: "Generated"
  - Formatted date/time (e.g., "Nov 21, 2025 at 12:34 PM")
- ✅ Footer shows:
  - Word count (e.g., "150 words")
  - Character count (e.g., "850 characters")
- ✅ Timestamp updates when summary is refreshed

**Validation Checklist**:
- [ ] Timestamp format is readable
- [ ] Timestamp is accurate
- [ ] Word count is correct
- [ ] Character count is correct
- [ ] Metadata updates on refresh

---

### Test Case 9: Error Handling - Network Error

**Objective**: Verify error handling for network failures.

**Steps**:
1. Open browser DevTools → Network tab
2. Set network to "Offline" or throttle to "Offline"
3. Navigate to a ticket detail page
4. Click "Generate Summary"
5. Observe error handling

**Expected Results**:
- ✅ Error alert appears (red alert box)
- ✅ Error title: "Summary Generation Failed"
- ✅ Error message: "Network error. Please check your connection and try again."
- ✅ Alert has dismiss button (X)
- ✅ Summary is not generated
- ✅ Button becomes enabled again

**Validation Checklist**:
- [ ] Error message is user-friendly
- [ ] Error alert is dismissible
- [ ] UI doesn't break
- [ ] User can retry after dismissing error

---

### Test Case 10: Error Handling - Server Error

**Objective**: Verify error handling for server errors.

**Steps**:
1. Stop the backend server (or simulate 500 error)
2. Navigate to a ticket detail page
3. Click "Generate Summary"
4. Observe error handling

**Expected Results**:
- ✅ Error alert appears
- ✅ Error message: "AI service is temporarily unavailable. Please try again later."
- ✅ Alert is dismissible
- ✅ User can retry after error

**Validation Checklist**:
- [ ] Error message is appropriate for server errors
- [ ] Error doesn't crash the UI
- [ ] User can dismiss and retry

---

### Test Case 11: Error Handling - Authentication Error

**Objective**: Verify error handling for permission errors.

**Steps**:
1. Log in as a regular user (not an agent)
2. Navigate to a ticket detail page
3. Verify AI Summary section is not visible

**Expected Results**:
- ✅ AI Summary section is NOT visible for non-agents
- ✅ Only agents can see and use the feature

**Alternative Test** (if you can simulate 401/403):
1. As an agent, try to generate summary
2. If API returns 401/403, verify error message

**Validation Checklist**:
- [ ] Feature is hidden from non-agents
- [ ] Permission errors are handled gracefully

---

### Test Case 12: Error Handling - Error Dismissal

**Objective**: Verify error alerts can be dismissed and cleared.

**Steps**:
1. Trigger an error (e.g., network error)
2. Click the X button on the error alert
3. Try generating summary again

**Expected Results**:
- ✅ Error alert disappears when dismissed
- ✅ Error state is cleared
- ✅ User can attempt generation again
- ✅ New errors replace old ones

**Validation Checklist**:
- [ ] Error can be dismissed
- [ ] Error state clears correctly
- [ ] Multiple errors don't stack up

---

### Test Case 13: Multiple Actions - Rapid Clicking

**Objective**: Verify the UI handles rapid user interactions correctly.

**Steps**:
1. Click "Generate Summary" multiple times rapidly
2. Observe behavior

**Expected Results**:
- ✅ Button becomes disabled after first click
- ✅ Only one request is sent
- ✅ No duplicate summaries
- ✅ Loading state shows correctly

**Validation Checklist**:
- [ ] Button prevents multiple clicks
- [ ] Only one API call is made
- [ ] UI remains stable

---

### Test Case 14: Summary Persistence

**Objective**: Verify summary persists when navigating away and back.

**Steps**:
1. Generate a summary
2. Navigate to tickets list page
3. Navigate back to the same ticket
4. Verify summary is still there

**Expected Results**:
- ✅ Summary is loaded from ticket data
- ✅ Timestamp is preserved
- ✅ Summary content matches previous state
- ✅ Summary visibility state is restored (shown/hidden)

**Validation Checklist**:
- [ ] Summary persists across navigation
- [ ] Data is loaded correctly
- [ ] No duplicate generation occurs

---

### Test Case 15: Closed Ticket Behavior

**Objective**: Verify AI Summary section is hidden for closed tickets.

**Steps**:
1. Navigate to a closed ticket
2. Verify AI Summary section

**Expected Results**:
- ✅ AI Summary section is NOT visible for closed tickets
- ✅ Feature is only available for active tickets

**Validation Checklist**:
- [ ] Section is hidden for closed tickets
- [ ] No errors occur

---

## Edge Cases

### Edge Case 1: Empty Ticket (No Comments)
- Generate summary for ticket with no comments
- Verify summary still generates (may be shorter)
- Verify no errors occur

### Edge Case 2: Very Long Summary
- Generate summary for ticket with many comments
- Verify summary displays correctly
- Verify word/character counts are accurate
- Verify UI doesn't break with long text

### Edge Case 3: Special Characters
- Create ticket with special characters in comments
- Generate summary
- Verify special characters are handled correctly

### Edge Case 4: Concurrent Operations
- Generate summary
- While generating, try to add a comment
- Verify both operations work correctly
- Verify no conflicts occur

---

## Visual Regression Tests

### Visual Test 1: Light Mode
- [ ] All colors are correct in light mode
- [ ] Text is readable
- [ ] Contrast is sufficient
- [ ] Icons are visible

### Visual Test 2: Dark Mode
- [ ] All colors are correct in dark mode
- [ ] Text is readable
- [ ] Contrast is sufficient
- [ ] Icons are visible

### Visual Test 3: Responsive Design
- [ ] Layout works on mobile (375px width)
- [ ] Layout works on tablet (768px width)
- [ ] Layout works on desktop (1920px width)
- [ ] Buttons are appropriately sized
- [ ] Text doesn't overflow

---

## Performance Tests

### Performance Test 1: Generation Time
- [ ] Summary generates within 30 seconds for normal tickets
- [ ] Loading states appear immediately
- [ ] UI remains responsive during generation

### Performance Test 2: Refresh Time
- [ ] Refresh completes within 30 seconds
- [ ] UI updates smoothly
- [ ] No flickering occurs

---

## Browser Compatibility

Test on the following browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## Test Summary Checklist

After completing all tests, verify:
- [ ] All test cases pass
- [ ] No console errors
- [ ] No network errors (except intentional ones)
- [ ] UI is responsive and smooth
- [ ] Error handling works correctly
- [ ] All features are accessible
- [ ] Visual design is consistent

---

## Known Issues / Notes

Document any issues found during testing:
- Issue: [Description]
- Steps to reproduce: [Steps]
- Expected: [Expected behavior]
- Actual: [Actual behavior]
- Severity: [Low/Medium/High]

---

## Test Data

### Test Users
- **Agent 1**: sarah.wilson@company.com / password123
- **Agent 2**: david.brown@company.com / password123
- **Agent 3**: lisa.davis@company.com / password123
- **Regular User**: john.doe@company.com / password123

### Test Tickets
- Use existing tickets from seed data
- Create new tickets with various comment counts
- Test with tickets in different statuses

---

## Quick Test Script

For quick validation, run this sequence:
1. Login as agent → Navigate to ticket → Generate summary → Verify display
2. Click Refresh → Verify refresh works
3. Click Hide → Verify hiding works
4. Click Show → Verify showing works
5. Simulate error → Verify error handling
6. Dismiss error → Verify dismissal works

---

## Questions or Issues?

If you encounter any issues during testing:
1. Check browser console for errors
2. Check network tab for failed requests
3. Verify backend is running and accessible
4. Verify Google API key is configured (if using AI features)
5. Check ticket has comments (summary needs content to analyze)

