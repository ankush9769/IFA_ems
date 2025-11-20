# Implementation Plan

- [x] 1. Create backend API endpoint for admin to fetch employee checklist

  - [x] 1.1 Add new controller function


    - Add getEmployeeChecklistStatusByAdmin function in `server/src/controllers/employee.controller.js`
    - Accept employeeId as parameter
    - Fetch checklist status for specified employee
    - Ensure admin-only access
    - _Requirements: 3.1, 5.1, 5.2_



  - [ ] 1.2 Add new route
    - Add route in `server/src/routes/modules/employee.routes.js`


    - Create GET `/employees/:employeeId/checklist-status` endpoint
    - Apply authentication and admin role authorization
    - _Requirements: 3.1_


- [x] 2. Update LayoutShell sidebar navigation


  - Add "Employee Checklist" link to sidebar navigation for admin role
  - Update the allLinks array in LayoutShell.jsx with new route
  - Ensure proper active state highlighting for the new route
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_


- [ ] 3. Create AdminEmployeeChecklistViewer page component
  - [ ] 3.1 Create base component file and setup
    - Create `client/src/pages/AdminEmployeeChecklistViewer.jsx`
    - Import necessary hooks and libraries
    - Import CHECKLIST_ITEMS from EmployeeChecklist or create shared constant
    - Setup component structure with two views (list and detail)
    - _Requirements: 2.1, 2.4, 4.1, 4.2, 4.3_


  - [ ] 3.2 Implement employee list view
    - Fetch all employees using existing endpoint
    - Display employees in a grid layout with cards
    - Show employee name, role, and status
    - Make cards clickable to select employee

    - Handle loading and empty states
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 6.5_

  - [ ] 3.3 Implement employee selection and view switching
    - Create click handler for employee cards
    - Fetch selected employee's checklist status
    - Switch from list view to detail view

    - Store selected employee in state
    - _Requirements: 3.1, 3.2, 3.5_

  - [ ] 3.4 Build employee checklist detail view
    - Create back button to return to employee list
    - Display employee name and info header

    - Build table structure with fixed and scrollable columns (reuse structure from EmployeeChecklist)
    - Display checklist items with numbers
    - Show date columns from employee's checklist data
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 6.1, 6.2, 6.3, 6.4, 6.5_



  - [ ] 3.5 Implement read-only checkboxes
    - Display checkboxes showing employee's completion status
    - Make checkboxes disabled/read-only (not clickable)


    - Use visual styling to indicate read-only state
    - Display checked/unchecked states correctly
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 3.6 Add navigation and keyboard support
    - Implement back button functionality
    - Add keyboard navigation for employee cards (Tab, Enter)
    - Add Escape key to return to list from detail view
    - _Requirements: 6.1_

- [ ] 4. Update App.jsx routing
  - Add new route for `/admin/employee-checklist` pointing to AdminEmployeeChecklistViewer component
  - Wrap route with RoleGuard for admin role only
  - Place route inside ProtectedRoute wrapper
  - _Requirements: 1.2_

- [ ] 5. Test the complete feature
  - Verify sidebar link appears for admins only
  - Test loading employee list
  - Test clicking employee to view checklist
  - Verify checklist displays with correct data
  - Test that checkboxes are read-only
  - Test back button functionality
  - Verify horizontal scrolling works
  - Test empty states and error handling
  - Verify responsive design on different screen sizes
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 6.4, 6.5_
