# Implementation Plan

- [x] 1. Create backend API endpoint for fetching employee daily updates

  - [x] 1.1 Add new route in employee or project routes


    - Create GET endpoint `/employee/daily-updates` to fetch all updates for logged-in employee
    - Implement controller function to query DailyUpdate model filtered by employee ID
    - Populate project information in the response
    - _Requirements: 2.2, 2.5_

  - [x] 1.2 Update existing update endpoints if needed


    - Ensure POST `/projects/:projectId/updates` accepts minimal data (summary, date, project, employee)
    - Allow hoursLogged and nextPlan to be optional or default values
    - _Requirements: 4.2, 4.3_

- [x] 2. Update LayoutShell sidebar navigation


  - Add "Daily Update Chart" link to sidebar navigation for employee and applicant roles
  - Update the allLinks array in LayoutShell.jsx with new route
  - Ensure proper active state highlighting for the new route
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 3. Create DailyUpdateChart page component

  - [x] 3.1 Create base component file and setup


    - Create `client/src/pages/DailyUpdateChart.jsx`
    - Import necessary hooks (useState, useEffect, useCallback) and libraries
    - Import useAuthStore for employee information
    - Import React Query hooks for data fetching
    - Setup component structure with loading and empty states
    - _Requirements: 2.1, 2.4_

  - [x] 3.2 Implement data fetching logic

    - Fetch assigned projects using existing `/projects?assigned=true` endpoint
    - Fetch all daily updates for the employee using new endpoint
    - Transform updates into a map structure: { projectId: { date: updateData } }
    - Extract unique dates from updates and sort chronologically
    - _Requirements: 2.2, 2.3, 2.5, 4.4_

  - [x] 3.3 Build table structure with fixed and scrollable columns


    - Create table container with horizontal scroll
    - Implement fixed left column for project names (250px width)
    - Create header row with "Project" and date column headers
    - Render project rows with project name and client information
    - Style table with borders, padding, and proper spacing
    - _Requirements: 2.1, 2.3, 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 3.4 Implement add date column functionality


    - Create "Add Date Column" button in page header
    - Implement date picker modal or input
    - Validate date is not duplicate before adding
    - Add new date to dateColumns state in chronological order
    - Scroll table to show newly added column
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.5 Implement editable cells for daily updates


    - Create cell component that displays update text or empty state
    - Make cells clickable to enter edit mode
    - Use textarea or input for editing cell content
    - Implement auto-save on blur or after 2 seconds of inactivity
    - Show saving indicator and success feedback
    - Update local state immediately for responsive UI
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 3.6 Add keyboard navigation support

    - Implement Tab/Shift+Tab for cell navigation
    - Add Enter key to start editing
    - Add Escape key to cancel editing
    - Support arrow key navigation when not editing
    - _Requirements: 2.5, 5.5_

- [x] 4. Update App.jsx routing


  - Add new route for `/employee/daily-chart` pointing to DailyUpdateChart component
  - Wrap route with RoleGuard for employee and applicant roles
  - Place route inside ProtectedRoute wrapper
  - _Requirements: 1.2_

- [x] 5. Test the complete feature


  - Verify sidebar link appears for employees
  - Test loading assigned projects in table
  - Test adding new date columns
  - Test editing and saving cell updates
  - Verify existing updates display correctly
  - Test horizontal scrolling with fixed project column
  - Test keyboard navigation
  - Verify responsive design on different screen sizes
  - Test error handling for failed saves
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5_
