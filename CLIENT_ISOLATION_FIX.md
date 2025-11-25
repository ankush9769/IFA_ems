# 🔒 Client Data Isolation Fix

## Problem
All client users were seeing the same projects regardless of which client account was logged in. Client A could see Client B's projects, which is a serious data privacy issue.

## Root Cause
The project filtering logic in `listProjects` only filtered by `clientRef` when it existed, but many client users don't have a `clientRef` set in their User record. This meant:

1. Client users without `clientRef` saw ALL projects
2. No fallback filtering by `createdBy` field
3. Same issue in `getProject`, `updateProject`, and `addProjectDailyUpdate` functions

## Solution Implemented

### Updated Project Controller (`server/src/controllers/project.controller.js`)

#### 1. `listProjects` Function
**Before:**
```javascript
if (req.user?.role === 'client' && req.user?.clientRef) {
  filters.client = req.user.clientRef;
}
```

**After:**
```javascript
if (req.user?.role === 'client') {
  if (req.user?.clientRef) {
    // If client has a clientRef, filter by that
    filters.client = req.user.clientRef;
  } else {
    // If client doesn't have clientRef, filter by createdBy
    filters.createdBy = req.user.sub;
  }
}
```

#### 2. `getProject` Function
**Before:**
```javascript
if (req.user.role === 'client' && String(req.user.clientRef) !== String(project.client?._id)) {
  throw createHttpError(403, 'Not allowed');
}
```

**After:**
```javascript
if (req.user.role === 'client') {
  const isOwner = req.user.clientRef 
    ? String(req.user.clientRef) === String(project.client?._id)
    : String(req.user.sub) === String(project.createdBy);
  
  if (!isOwner) {
    throw createHttpError(403, 'Not allowed to view this project');
  }
}
```

#### 3. `updateProject` Function
Added same ownership check as `getProject`

#### 4. `addProjectDailyUpdate` Function
Added same ownership check as `getProject`

## How It Works

### Two Types of Client Users

1. **Clients with `clientRef`** (linked to a Client record)
   - Filter projects by: `client === clientRef`
   - These are formal clients with a Client record in the database

2. **Clients without `clientRef`** (standalone users)
   - Filter projects by: `createdBy === user.sub`
   - These are clients who registered but don't have a formal Client record yet

### Ownership Verification

For all project operations (view, update, add updates), the system now checks:

```javascript
const isOwner = req.user.clientRef 
  ? String(req.user.clientRef) === String(project.client?._id)  // Check clientRef
  : String(req.user.sub) === String(project.createdBy);          // Check createdBy
```

## Testing

### Test Case 1: Client with clientRef
1. Login as Client A (has clientRef)
2. Create Project X
3. Logout
4. Login as Client B (has different clientRef)
5. ✅ Should NOT see Project X
6. ✅ Should only see Client B's projects

### Test Case 2: Client without clientRef
1. Login as Client C (no clientRef)
2. Create Project Y
3. Logout
4. Login as Client D (no clientRef)
5. ✅ Should NOT see Project Y
6. ✅ Should only see Client D's projects

### Test Case 3: Mixed Scenario
1. Login as Client E (has clientRef)
2. Create Project Z
3. Logout
4. Login as Client F (no clientRef)
5. ✅ Should NOT see Project Z
6. ✅ Each client sees only their own projects

## Security Benefits

✅ **Complete Data Isolation** - Clients can only see their own projects  
✅ **Privacy Protection** - No data leakage between clients  
✅ **Access Control** - Clients can't view/edit other clients' projects  
✅ **Dual Filtering** - Works for both clientRef and createdBy scenarios  
✅ **Consistent Enforcement** - Applied to all project operations  

## API Endpoints Secured

- `GET /api/projects` - List projects (filtered by client)
- `GET /api/projects/:id` - Get single project (ownership check)
- `PUT /api/projects/:id` - Update project (ownership check)
- `POST /api/projects/:id/updates` - Add daily update (ownership check)

## Database Fields Used

### User Model
- `_id` (sub in JWT) - User ID
- `role` - User role (client, admin, employee)
- `clientRef` - Reference to Client record (optional)

### Project Model
- `client` - Reference to Client record (optional)
- `createdBy` - Reference to User who created the project

## Notes

- Admin and employee users are not affected by these filters
- Employees see projects they're assigned to (when `assigned=true` query param)
- Admins see all projects (no filtering)
- The fix maintains backward compatibility with existing data

## Files Modified

1. **server/src/controllers/project.controller.js**
   - Updated `listProjects` function
   - Updated `getProject` function
   - Updated `updateProject` function
   - Updated `addProjectDailyUpdate` function

## Deployment

After deploying this fix:

1. **Clear React Query Cache** (already implemented in previous fix)
2. **Restart Backend Server** on Render
3. **Test with Multiple Client Accounts**
4. **Verify Data Isolation**

## Additional Recommendations

### For Production
1. **Audit Existing Data**
   - Check which client users have `clientRef` set
   - Consider creating Client records for users without `clientRef`

2. **Improve Client Registration**
   - Automatically create Client record when client user registers
   - Set `clientRef` in User record during registration

3. **Add Logging**
   - Log when clients access projects
   - Monitor for unauthorized access attempts

---

**Last Updated**: November 23, 2025
