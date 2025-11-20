# Implementation Plan

- [x] 1. Create backend database model and API endpoints

  - [x] 1.1 Create ChecklistStatus model


    - Create `server/src/models/ChecklistStatus.js` file
    - Define schema with employee, date, and checklist Map fields
    - Add compound index on (employee, date)
    - Add unique constraint on (employee, date) combination
    - _Requirements: 4.3, 4.4_



  - [ ] 1.2 Create checklist controller functions
    - Create controller functions in `server/src/controllers/employee.controller.js`
    - Implement getEmployeeChecklistStatus to fetch all statuses for logged-in employee
    - Implement saveChecklistStatus to create or update status for a specific date


    - Handle upsert logic (create if not exists, update if exists)
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

  - [x] 1.3 Add checklist routes


    - Add routes in `server/src/routes/modules/employee.routes.js`
    - Create GET `/employees/checklist-status` endpoint
    - Create POST `/employees/checklist-status` endpoint for save/update
    - Apply authentication and employee role authorization

    - _Requirements: 4.3, 4.4_



- [ ] 2. Update LayoutShell sidebar navigation
  - Add "Checklist" link to sidebar navigation for employee and applicant roles
  - Update the allLinks array in LayoutShell.jsx with new route
  - Ensure proper active state highlighting for the new route

  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 3. Create EmployeeChecklist page component
  - [ ] 3.1 Create base component file and setup
    - Create `client/src/pages/EmployeeChecklist.jsx`


    - Import necessary hooks and libraries
    - Define predefined checklist items array (35+ items)
    - Setup component structure with loading and empty states
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 6.1, 6.2, 6.3, 6.4_

  - [x] 3.2 Implement data fetching logic


    - Fetch checklist status using new endpoint
    - Transform status data into map structure: { date: { itemId: boolean } }
    - Extract unique dates from status and sort chronologically
    - _Requirements: 2.4, 4.4_

  - [x] 3.3 Build table structure with fixed and scrollable columns

    - Create table container with horizontal scroll
    - Implement fixed left column for checklist items (400px width)
    - Create header row with "Checklist Item" and date column headers
    - Render checklist item rows with numbers and text
    - Style table with borders, padding, and proper spacing
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 3.4 Implement add date column functionality

    - Create "Add Date Column" button in page header
    - Implement date picker modal or input
    - Validate date is not duplicate before adding
    - Add new date to dateColumns state in chronological order


    - Scroll table to show newly added column
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.5 Implement checkbox cells with toggle functionality


    - Create checkbox component for each cell
    - Implement click handler to toggle checkbox state
    - Use optimistic updates for immediate UI feedback
    - Save checkbox state to backend on toggle
    - Show saving indicator during API call
    - Revert state on error with error message
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ] 3.6 Add keyboard navigation support
    - Implement Tab/Shift+Tab for checkbox navigation
    - Add Space key to toggle checkbox
    - Support arrow key navigation between checkboxes
    - _Requirements: 5.5_

- [ ] 4. Update App.jsx routing
  - Add new route for `/employee/checklist` pointing to EmployeeChecklist component
  - Wrap route with RoleGuard for employee and applicant roles
  - Place route inside ProtectedRoute wrapper
  - _Requirements: 1.2_

- [ ] 5. Test the complete feature
  - Verify sidebar link appears for employees
  - Test loading all 34+ checklist items
  - Test adding new date columns
  - Test checkbox toggling and persistence
  - Verify existing checkbox states display correctly
  - Test horizontal scrolling with fixed checklist column
  - Test keyboard navigation
  - Verify responsive design on different screen sizes
  - Test error handling for failed saves
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5_
