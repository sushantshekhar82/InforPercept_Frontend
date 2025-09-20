// Role-based access control utilities

// Define role hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY = {
  'user': 1,
  'moderator': 2,
  'admin': 3,
  'super-admin': 4
};

// Define role permissions
export const ROLE_PERMISSIONS = {
  'user': [
    'view_own_profile',
    'upload_documents',
    'view_own_verifications'
  ],
  'moderator': [
    'view_own_profile',
    'upload_documents',
    'view_own_verifications',
    'view_all_verifications',
    'moderate_verifications'
  ],
  'admin': [
    'view_own_profile',
    'upload_documents',
    'view_own_verifications',
    'view_all_verifications',
    'moderate_verifications',
    'manage_users',
    'view_admin_panel',
    'manage_system_settings'
  ],
  'super-admin': [
    'view_own_profile',
    'upload_documents',
    'view_own_verifications',
    'view_all_verifications',
    'moderate_verifications',
    'manage_users',
    'view_admin_panel',
    'manage_system_settings',
    'manage_realms',
    'manage_clients'
  ]
};

// Check if user has specific permission
export const hasPermission = (userRoles, permission) => {
  if (!userRoles || !Array.isArray(userRoles)) return false;
  
  return userRoles.some(role => {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  });
};

// Check if user has minimum role level
export const hasMinimumRole = (userRoles, requiredRole) => {
  if (!userRoles || !Array.isArray(userRoles)) return false;
  
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  
  return userRoles.some(role => {
    const userLevel = ROLE_HIERARCHY[role] || 0;
    return userLevel >= requiredLevel;
  });
};

// Get user's highest role
export const getHighestRole = (userRoles) => {
  if (!userRoles || !Array.isArray(userRoles)) return 'user';
  
  let highestRole = 'user';
  let highestLevel = 0;
  
  userRoles.forEach(role => {
    const level = ROLE_HIERARCHY[role] || 0;
    if (level > highestLevel) {
      highestLevel = level;
      highestRole = role;
    }
  });
  
  return highestRole;
};

// Check if user can access admin panel
export const canAccessAdminPanel = (userRoles) => {
  return hasPermission(userRoles, 'view_admin_panel');
};

// Check if user can manage users
export const canManageUsers = (userRoles) => {
  return hasPermission(userRoles, 'manage_users');
};

// Check if user can moderate verifications
export const canModerateVerifications = (userRoles) => {
  return hasPermission(userRoles, 'moderate_verifications');
};
