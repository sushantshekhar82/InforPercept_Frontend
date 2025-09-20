# Keycloak Role-Based Access Control Setup Guide

## Overview
This guide explains how to set up role-based access control in Keycloak for your verification project without needing separate realms.

## Option 1: Realm Roles (Recommended)

### Step 1: Create Realm Roles
1. Log into Keycloak Admin Console
2. Navigate to your realm (`myRelm`)
3. Go to **Realm Roles** in the left sidebar
4. Click **Create role** and add these roles:
   - `user` (default role for all users)
   - `moderator` (can moderate verifications)
   - `admin` (can access admin panel and manage users)
   - `super-admin` (full system access)

### Step 2: Assign Roles to Users
1. Go to **Users** in the left sidebar
2. Select a user
3. Go to **Role mapping** tab
4. Click **Assign role**
5. Select the appropriate roles for the user

### Step 3: Configure Client Roles (Optional)
1. Go to **Clients** → `myClient`
2. Go to **Roles** tab
3. Create client-specific roles if needed:
   - `verification-admin`
   - `user-manager`
   - `system-admin`

## Option 2: Groups with Roles

### Step 1: Create Groups
1. Go to **Groups** in the left sidebar
2. Create these groups:
   - `users` (regular users)
   - `moderators` (verification moderators)
   - `admins` (system administrators)

### Step 2: Assign Roles to Groups
1. Select a group
2. Go to **Role mapping** tab
3. Assign appropriate roles to the group

### Step 3: Add Users to Groups
1. Go to **Users**
2. Select a user
3. Go to **Groups** tab
4. Add user to appropriate group

## Option 3: Client Roles Only

### Step 1: Create Client Roles
1. Go to **Clients** → `myClient`
2. Go to **Roles** tab
3. Create roles:
   - `app-user`
   - `app-moderator`
   - `app-admin`

### Step 2: Assign Client Roles
1. Go to **Users**
2. Select a user
3. Go to **Role mapping** tab
4. Click **Assign role**
5. Filter by client and assign client roles

## Token Configuration

### Ensure Roles are in Token
1. Go to **Clients** → `myClient`
2. Go to **Client scopes** tab
3. Ensure these scopes are assigned:
   - `realm-management` (for realm roles)
   - `profile` (for user profile)
   - `email` (for email)

### Configure Token Claims
1. Go to **Clients** → `myClient`
2. Go to **Client scopes** → `realm-management`
3. Go to **Mappers** tab
4. Ensure **realm roles** mapper exists
5. Add **client roles** mapper if using client roles

## Testing Roles

### Check Token Content
1. Use browser dev tools
2. Go to Application → Local Storage
3. Find Keycloak token
4. Decode JWT at jwt.io
5. Verify roles are present in `realm_access.roles` or `resource_access`

### Test Role Access
1. Login with different users
2. Check if admin panel appears for admin users
3. Verify regular users see only verification form

## Role Hierarchy Example

```
super-admin (highest)
├── admin
├── moderator
└── user (lowest)
```

## Permission Mapping

| Role | Permissions |
|------|-------------|
| `user` | Upload documents, view own verifications |
| `moderator` | User permissions + moderate verifications |
| `admin` | Moderator permissions + manage users + admin panel |
| `super-admin` | All permissions + system management |

## Best Practices

1. **Use Realm Roles**: Easier to manage and more flexible
2. **Start Simple**: Begin with basic roles, add complexity as needed
3. **Test Thoroughly**: Verify role assignments work as expected
4. **Document Roles**: Keep clear documentation of role purposes
5. **Regular Audits**: Periodically review user role assignments

## Troubleshooting

### Roles Not Appearing in Token
- Check client scope assignments
- Verify role mappers are configured
- Ensure user has roles assigned
- Check token expiration

### Admin Panel Not Showing
- Verify user has `admin` or `super-admin` role
- Check `canAccessAdminPanel` function in roleUtils.js
- Ensure roles are properly extracted from token

### Access Denied Errors
- Check role assignments in Keycloak
- Verify token contains expected roles
- Review permission checks in code
