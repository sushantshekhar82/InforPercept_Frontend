import { RequireRole, RequirePermission } from './RoleGuard';
import useAuth from '../Hooks/useAuth';

// Example component showing different ways to use role-based access control
function RoleExample() {
  const { userRoles, userProfile } = useAuth();

  return (
    <div style={{ padding: '20px', background: '#1e1e1e', color: '#fff' }}>
      <h2>Role-Based Access Control Examples</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Current User Info</h3>
        <p><strong>Username:</strong> {userProfile?.username}</p>
        <p><strong>Email:</strong> {userProfile?.email}</p>
        <p><strong>Roles:</strong> {userRoles.join(', ')}</p>
      </div>

      {/* Example 1: Simple role check */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#2a2a2a', borderRadius: '8px' }}>
        <h3>Example 1: Admin Only Content</h3>
        <RequireRole roles={['admin', 'super-admin']} userRoles={userRoles}>
          <div style={{ color: '#28a745' }}>
            ✅ This content is only visible to admins!
          </div>
        </RequireRole>
        <RequireRole roles={['admin', 'super-admin']} userRoles={userRoles} requireAll={false}>
          <div style={{ color: '#ffc107' }}>
            ⚠️ This content requires admin OR super-admin role
          </div>
        </RequireRole>
      </div>

      {/* Example 2: Permission-based access */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#2a2a2a', borderRadius: '8px' }}>
        <h3>Example 2: Permission-Based Content</h3>
        <RequirePermission permissions={['view_admin_panel']} userRoles={userRoles}>
          <div style={{ color: '#0077ff' }}>
            🔧 Admin panel access granted
          </div>
        </RequirePermission>
        <RequirePermission permissions={['manage_users']} userRoles={userRoles}>
          <div style={{ color: '#28a745' }}>
            👥 User management access granted
          </div>
        </RequirePermission>
      </div>

      {/* Example 3: Conditional rendering based on roles */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#2a2a2a', borderRadius: '8px' }}>
        <h3>Example 3: Conditional Content</h3>
        {userRoles.includes('admin') && (
          <div style={{ color: '#28a745' }}>
            🎯 Admin-specific content using conditional rendering
          </div>
        )}
        {userRoles.includes('moderator') && (
          <div style={{ color: '#ffc107' }}>
            📝 Moderator-specific content
          </div>
        )}
        {userRoles.includes('user') && (
          <div style={{ color: '#0077ff' }}>
            👤 Regular user content
          </div>
        )}
      </div>

      {/* Example 4: Role-based buttons */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#2a2a2a', borderRadius: '8px' }}>
        <h3>Example 4: Role-Based Actions</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {userRoles.includes('admin') && (
            <button style={{ 
              padding: '8px 16px', 
              background: '#28a745', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Manage Users
            </button>
          )}
          {userRoles.includes('moderator') && (
            <button style={{ 
              padding: '8px 16px', 
              background: '#ffc107', 
              color: '#000', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Moderate Content
            </button>
          )}
          <button style={{ 
            padding: '8px 16px', 
            background: '#0077ff', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            View Profile
          </button>
        </div>
      </div>

      {/* Example 5: Role hierarchy demonstration */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#2a2a2a', borderRadius: '8px' }}>
        <h3>Example 5: Role Hierarchy</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <div style={{ 
            padding: '10px', 
            background: userRoles.includes('user') ? '#28a745' : '#444', 
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            User Access
          </div>
          <div style={{ 
            padding: '10px', 
            background: userRoles.includes('moderator') ? '#ffc107' : '#444', 
            borderRadius: '4px',
            textAlign: 'center',
            color: userRoles.includes('moderator') ? '#000' : '#fff'
          }}>
            Moderator Access
          </div>
          <div style={{ 
            padding: '10px', 
            background: userRoles.includes('admin') ? '#0077ff' : '#444', 
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            Admin Access
          </div>
          <div style={{ 
            padding: '10px', 
            background: userRoles.includes('super-admin') ? '#dc3545' : '#444', 
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            Super Admin Access
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoleExample;
