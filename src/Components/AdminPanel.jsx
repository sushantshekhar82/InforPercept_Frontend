import { useState, useEffect } from 'react';
import axios from 'axios';
import { canAccessAdminPanel, canManageUsers, canModerateVerifications } from '../utils/roleUtils';

function AdminPanel({ token, userProfile, userRoles, logout }) {
  const [activeTab, setActiveTab] = useState('users');
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalDocs: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  useEffect(() => {
    if (canAccessAdminPanel(userRoles)) {
      loadVerifications();
    }
  }, [userRoles]);

  const loadVerifications = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5050/verification/list-verifications?page=${page}&limit=${pagination.limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("===================")
      console.log("Response:", response.data);
      
      // Handle the nested response structure
      const responseData = response.data.data;
      setVerifications(responseData.docs || []);
      setPagination({
        page: responseData.page,
        limit: responseData.limit,
        totalDocs: responseData.totalDocs,
        totalPages: responseData.totalPages,
        hasNextPage: responseData.hasNextPage,
        hasPrevPage: responseData.hasPrevPage
      });
    } catch (error) {
      console.error('Error loading verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const renderUsers = () => (
    <div style={{ padding: '20px', width: '100%' }}>
      <h2>Users & Verifications</h2>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <>
          <div style={{ background: '#2a2a2a', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#1e1e1e' }}>
                  <th style={{ padding: '15px', textAlign: 'left', color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>User ID</th>
                  <th style={{ padding: '15px', textAlign: 'left', color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>Document ID</th>
                  <th style={{ padding: '15px', textAlign: 'left', color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>File Name</th>
                  <th style={{ padding: '15px', textAlign: 'left', color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>Status</th>
                  <th style={{ padding: '15px', textAlign: 'left', color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>Submitted</th>
                  <th style={{ padding: '15px', textAlign: 'left', color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {verifications.map((verification, index) => (
                  <tr key={verification._id} style={{ borderBottom: '1px solid #444' }}>
                    <td style={{ padding: '15px', color: '#fff', fontSize: '14px' }}>
                      {verification.userId?._id || 'N/A'}
                    </td>
                    <td style={{ padding: '15px', color: '#fff', fontSize: '14px' }}>
                      {verification.documentId}
                    </td>
                    <td style={{ padding: '15px', color: '#fff', fontSize: '14px' }}>
                      {verification.documentData?.fileName || 'N/A'}
                    </td>
                    <td style={{ padding: '15px', color: '#fff' }}>
                      <span style={{ 
                        padding: '6px 12px', 
                        borderRadius: '6px', 
                        background: verification.verificationStatus === 'approved' ? '#28a745' : 
                                   verification.verificationStatus === 'rejected' ? '#dc3545' : '#ffc107',
                        color: verification.verificationStatus === 'pending' ? '#000' : '#fff',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {verification.verificationStatus}
                      </span>
                    </td>
                    <td style={{ padding: '15px', color: '#fff', fontSize: '14px' }}>
                      {new Date(verification.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '15px' }}>
                      <button style={{ 
                        padding: '6px 12px', 
                        marginRight: '8px', 
                        background: '#0077ff', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        View
                      </button>
                      {verification.verificationStatus === 'pending' && (
                        <>
                          <button style={{ 
                            padding: '6px 12px', 
                            marginRight: '8px', 
                            background: '#28a745', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            Approve
                          </button>
                          <button style={{ 
                            padding: '6px 12px', 
                            background: '#dc3545', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginTop: '20px',
            padding: '15px',
            background: '#2a2a2a',
            borderRadius: '8px'
          }}>
            <div style={{ color: '#fff' }}>
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalDocs)} of {pagination.totalDocs} results
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => loadVerifications(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
                style={{ 
                  padding: '8px 16px', 
                  background: pagination.hasPrevPage ? '#0077ff' : '#444', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: pagination.hasPrevPage ? 'pointer' : 'not-allowed'
                }}
              >
                Previous
              </button>
              <span style={{ color: '#fff', padding: '8px 16px' }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button 
                onClick={() => loadVerifications(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                style={{ 
                  padding: '8px 16px', 
                  background: pagination.hasNextPage ? '#0077ff' : '#444', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: pagination.hasNextPage ? 'pointer' : 'not-allowed'
                }}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );


  if (!canAccessAdminPanel(userRoles)) {
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
          <p>You don't have permission to access the admin panel.</p>
          <button 
            onClick={handleLogout}
            style={{ 
              padding: '10px 20px', 
              background: '#e63946', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#1e1e1e', 
      color: '#fff' 
    }}>
      {/* Header */}
      <div style={{ 
        background: '#2a2a2a', 
        padding: '20px', 
        borderBottom: '1px solid #444',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: '0', color: '#0077ff' }}>Admin Panel</h1>
          <p style={{ margin: '5px 0 0 0', color: '#ccc' }}>
            Welcome, {userProfile?.username || 'Admin'}
          </p>
        </div>
        <div>
          <span style={{ marginRight: '20px', color: '#ccc' }}>
            Roles: {userRoles.join(', ')}
          </span>
          <button 
            onClick={handleLogout}
            style={{ 
              padding: '8px 15px', 
              background: '#e63946', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        {renderUsers()}
      </div>
    </div>
  );
}

export default AdminPanel;
