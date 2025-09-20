import { canAccessAdminPanel } from '../utils/roleUtils';

// Role-based route guard component
function RoleGuard({ 
  children, 
  requiredRoles = [], 
  requiredPermissions = [], 
  requireAdmin = false,
  fallback = null 
}) {
  // This component should be used with the useAuth hook
  // The actual role checking will be done in the parent component
  return children;
}

// Higher-order component for role-based access control
export const withRoleGuard = (WrappedComponent, options = {}) => {
  return function RoleGuardedComponent(props) {
    const { 
      userRoles = [], 
      requiredRoles = [], 
      requiredPermissions = [], 
      requireAdmin = false 
    } = options;

    // Check if user has required roles
    const hasRequiredRoles = requiredRoles.length === 0 || 
      requiredRoles.some(role => userRoles.includes(role));

    // Check if user has required permissions
    const hasRequiredPermissions = requiredPermissions.length === 0 || 
      requiredPermissions.some(permission => {
        // This would need to be implemented based on your permission system
        return true; // Placeholder
      });

    // Check if admin access is required
    const hasAdminAccess = !requireAdmin || canAccessAdminPanel(userRoles);

    // If all checks pass, render the component
    if (hasRequiredRoles && hasRequiredPermissions && hasAdminAccess) {
      return <WrappedComponent {...props} />;
    }

    // Otherwise, render fallback or access denied
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        background: '#1e1e1e',
        color: '#fff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Access Denied</h2>
          <p>You don't have the required permissions to access this page.</p>
          {requiredRoles.length > 0 && (
            <p>Required roles: {requiredRoles.join(', ')}</p>
          )}
          {requireAdmin && (
            <p>Admin access required</p>
          )}
        </div>
      </div>
    );
  };
};

// Simple role check component
export const RequireRole = ({ 
  children, 
  roles = [], 
  userRoles = [], 
  requireAll = false 
}) => {
  const hasAccess = requireAll 
    ? roles.every(role => userRoles.includes(role))
    : roles.some(role => userRoles.includes(role));

  if (!hasAccess) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        color: '#e63946',
        background: '#2a2a2a',
        borderRadius: '8px',
        margin: '20px'
      }}>
        <h3>Access Denied</h3>
        <p>You need one of these roles: {roles.join(', ')}</p>
      </div>
    );
  }

  return children;
};

// Permission check component
export const RequirePermission = ({ 
  children, 
  permissions = [], 
  userRoles = [] 
}) => {
  // This would need to be implemented based on your permission system
  // For now, we'll use a simple role-based check
  const hasPermission = permissions.length === 0 || 
    permissions.some(permission => {
      // Map permissions to roles (this is a simplified approach)
      const permissionRoleMap = {
        'view_admin_panel': ['admin', 'super-admin'],
        'manage_users': ['admin', 'super-admin'],
        'moderate_verifications': ['moderator', 'admin', 'super-admin'],
        'manage_system_settings': ['admin', 'super-admin']
      };
      
      const requiredRoles = permissionRoleMap[permission] || [];
      return requiredRoles.some(role => userRoles.includes(role));
    });

  if (!hasPermission) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        color: '#e63946',
        background: '#2a2a2a',
        borderRadius: '8px',
        margin: '20px'
      }}>
        <h3>Permission Denied</h3>
        <p>You need these permissions: {permissions.join(', ')}</p>
      </div>
    );
  }

  return children;
};

export default RoleGuard;
