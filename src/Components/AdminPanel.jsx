import { useState, useEffect } from 'react';
import axios from 'axios';
import { canAccessAdminPanel, canManageUsers, canModerateVerifications } from '../utils/roleUtils';

// Add CSS for spinner animation and toast
const spinnerStyle = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes slideIn {
    0% { transform: translateX(100%); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  }
`;

// Inject the CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = spinnerStyle;
  document.head.appendChild(style);
}

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
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

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

  const handleViewDetails = async (verificationId) => {
    setDetailsLoading(true);
    setShowDetailsModal(true);
    
    try {
      const response = await axios.get(
        `http://localhost:5050/verification/user-verification/${verificationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setSelectedVerification(response.data.data.verificationDetails);
    } catch (error) {
      console.error('Error loading verification details:', error);
      setSelectedVerification(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedVerification(null);
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const updateVerificationStatus = async (verificationId, status) => {
    setUpdatingStatus(true);
    try {
      const response = await axios.put(
        `http://localhost:5050/verification/user-verification/${verificationId}/status`,
        { verificationStatus: status },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.status === 'success') {
        showToast('Status updated successfully!', 'success');
        // Reload verifications to reflect the updated status
        loadVerifications(pagination.page);
        // Update the selected verification if it's the same one
        if (selectedVerification && selectedVerification._id === verificationId) {
          setSelectedVerification(prev => ({
            ...prev,
            verificationStatus: status
          }));
        }
      }
    } catch (error) {
      console.error('Error updating verification status:', error);
      showToast('Failed to update status. Please try again.', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleApprove = (verificationId) => {
    updateVerificationStatus(verificationId, 'verified');
  };

  const handleReject = (verificationId) => {
    updateVerificationStatus(verificationId, 'rejected');
  };

  const renderToast = () => {
    if (!toast.show) return null;

    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: toast.type === 'success' ? '#28a745' : '#dc3545',
        color: '#fff',
        padding: '15px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        zIndex: 1001,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        minWidth: '300px',
        animation: 'slideIn 0.3s ease-out'
      }}>
        <div style={{
          fontSize: '20px',
          fontWeight: 'bold'
        }}>
          {toast.type === 'success' ? '✓' : '✗'}
        </div>
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
            {toast.type === 'success' ? 'Success' : 'Error'}
          </div>
          <div style={{ fontSize: '14px' }}>
            {toast.message}
          </div>
        </div>
      </div>
    );
  };

  const renderDetailsModal = () => {
    if (!showDetailsModal) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '20px'
      }}>
        <div style={{
          background: '#2a2a2a',
          borderRadius: '16px',
          width: '90%',
          maxWidth: '1200px',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Modal Header */}
          <div style={{
            background: '#1e1e1e',
            padding: '20px 30px',
            borderBottom: '1px solid #444',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{ 
              margin: 0, 
              color: '#0077ff', 
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              Verification Details
            </h2>
            <button
              onClick={closeDetailsModal}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '5px',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#444'}
              onMouseOut={(e) => e.target.style.background = 'none'}
            >
              ×
            </button>
          </div>

          {/* Modal Content */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '0'
          }}>
            {detailsLoading ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px',
                color: '#fff'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #444',
                    borderTop: '4px solid #0077ff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 20px'
                  }}></div>
                  <p>Loading verification details...</p>
                </div>
              </div>
            ) : selectedVerification ? (
              <div style={{
                display: 'flex',
                height: '100%',
                minHeight: '500px'
              }}>
                {/* Left Side - Details */}
                <div style={{
                  flex: '1',
                  padding: '30px',
                  background: '#2a2a2a',
                  borderRight: '1px solid #444'
                }}>
                  <div style={{
                    background: '#1e1e1e',
                    padding: '25px',
                    borderRadius: '12px',
                    marginBottom: '20px'
                  }}>
                    <h3 style={{ 
                      color: '#0077ff', 
                      marginBottom: '20px', 
                      fontSize: '18px',
                      borderBottom: '2px solid #0077ff',
                      paddingBottom: '10px'
                    }}>
                      Verification Information
                    </h3>
                    
                    <div style={{ display: 'grid', gap: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#ccc', fontWeight: 'bold' }}>Verification ID:</span>
                        <span style={{ color: '#fff', fontFamily: 'monospace' }}>{selectedVerification._id}</span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#ccc', fontWeight: 'bold' }}>User ID:</span>
                        <span style={{ color: '#fff', fontFamily: 'monospace' }}>{selectedVerification.userId}</span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#ccc', fontWeight: 'bold' }}>Document ID:</span>
                        <span style={{ color: '#fff', fontFamily: 'monospace' }}>{selectedVerification.documentId}</span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#ccc', fontWeight: 'bold' }}>Status:</span>
                        <span style={{ 
                          padding: '6px 12px', 
                          borderRadius: '6px', 
                          background: selectedVerification.verificationStatus === 'verified' ? '#28a745' : 
                                     selectedVerification.verificationStatus === 'rejected' ? '#dc3545' : '#ffc107',
                          color: selectedVerification.verificationStatus === 'pending' ? '#000' : '#fff',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {selectedVerification.verificationStatus}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#ccc', fontWeight: 'bold' }}>Created:</span>
                        <span style={{ color: '#fff' }}>{new Date(selectedVerification.createdAt).toLocaleString()}</span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#ccc', fontWeight: 'bold' }}>Updated:</span>
                        <span style={{ color: '#fff' }}>{new Date(selectedVerification.updatedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {selectedVerification.verificationStatus === 'pending' && (
                    <div style={{
                      background: '#1e1e1e',
                      padding: '25px',
                      borderRadius: '12px',
                      marginTop: '20px'
                    }}>
                      <h3 style={{ 
                        color: '#0077ff', 
                        marginBottom: '20px', 
                        fontSize: '18px',
                        borderBottom: '2px solid #0077ff',
                        paddingBottom: '10px'
                      }}>
                        Actions
                      </h3>
                      
                      <div style={{ display: 'flex', gap: '15px' }}>
                        <button 
                          onClick={() => handleApprove(selectedVerification._id)}
                          disabled={updatingStatus}
                          style={{ 
                            padding: '12px 24px', 
                            background: updatingStatus ? '#6c757d' : '#28a745', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '8px',
                            cursor: updatingStatus ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            flex: 1,
                            transition: 'background-color 0.2s'
                          }}
                          onMouseOver={(e) => !updatingStatus && (e.target.style.background = '#218838')}
                          onMouseOut={(e) => !updatingStatus && (e.target.style.background = '#28a745')}
                        >
                          {updatingStatus ? 'Updating...' : '✓ Approve Verification'}
                        </button>
                        <button 
                          onClick={() => handleReject(selectedVerification._id)}
                          disabled={updatingStatus}
                          style={{ 
                            padding: '12px 24px', 
                            background: updatingStatus ? '#6c757d' : '#dc3545', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '8px',
                            cursor: updatingStatus ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            flex: 1,
                            transition: 'background-color 0.2s'
                          }}
                          onMouseOver={(e) => !updatingStatus && (e.target.style.background = '#c82333')}
                          onMouseOut={(e) => !updatingStatus && (e.target.style.background = '#dc3545')}
                        >
                          {updatingStatus ? 'Updating...' : '✗ Reject Verification'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div style={{
                    background: '#1e1e1e',
                    padding: '25px',
                    borderRadius: '12px'
                  }}>
                    <h3 style={{ 
                      color: '#0077ff', 
                      marginBottom: '20px', 
                      fontSize: '18px',
                      borderBottom: '2px solid #0077ff',
                      paddingBottom: '10px'
                    }}>
                      Document Information
                    </h3>
                    
                    <div style={{ display: 'grid', gap: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#ccc', fontWeight: 'bold' }}>File Name:</span>
                        <span style={{ color: '#fff', wordBreak: 'break-all' }}>{selectedVerification.documentData.fileName}</span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#ccc', fontWeight: 'bold' }}>File Type:</span>
                        <span style={{ color: '#fff' }}>{selectedVerification.documentData.mimeType}</span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#ccc', fontWeight: 'bold' }}>File Size:</span>
                        <span style={{ color: '#fff' }}>{(selectedVerification.documentData.size / 1024).toFixed(2)} KB</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#ccc', fontWeight: 'bold' }}>OCR Message:</span>
                        <span style={{ color: '#fff', marginLeft: '50px', paddingLeft: '10px' }}>{selectedVerification.documentData.ocrMessage}</span>
                      </div>
                    </div>
                  </div>

                  {/* OCR Data Section - Only show if ocrData exists */}
                  {selectedVerification.documentData.ocrData && (
                    <div style={{
                      background: '#1e1e1e',
                      padding: '25px',
                      borderRadius: '12px',
                      marginTop: '20px'
                    }}>
                      <h3 style={{ 
                        color: '#0077ff', 
                        marginBottom: '20px', 
                        fontSize: '18px',
                        borderBottom: '2px solid #0077ff',
                        paddingBottom: '10px'
                      }}>
                        OCR Extracted Data
                      </h3>
                      
                      <div style={{ display: 'grid', gap: '15px' }}>
                        {Object.entries(selectedVerification.documentData.ocrData).map(([key, value]) => (
                          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#ccc', fontWeight: 'bold', textTransform: 'capitalize' }}>
                              {key.replace(/_/g, ' ')}:
                            </span>
                            <span style={{ 
                              color: '#fff', 
                              wordBreak: 'break-all',
                              maxWidth: '60%',
                              textAlign: 'right'
                            }}>
                              {value !== null && value !== undefined ? String(value) : 'N/A'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side - Image */}
                <div style={{
                  flex: '1',
                  padding: '30px',
                  background: '#2a2a2a',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <h3 style={{ 
                    color: '#0077ff', 
                    marginBottom: '20px', 
                    fontSize: '18px',
                    textAlign: 'center'
                  }}>
                    Document Preview
                  </h3>
                  
                  <div style={{
                    background: '#1e1e1e',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img
                      src={`data:${selectedVerification.documentData.mimeType};base64,${selectedVerification.documentData.base64}`}
                      alt="Document Preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '400px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px',
                color: '#fff'
              }}>
                <p>Failed to load verification details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
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
                      <button 
                        onClick={() => handleViewDetails(verification._id)}
                        style={{ 
                          padding: '6px 12px', 
                          marginRight: '8px', 
                          background: '#0077ff', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        View
                      </button>
                      {verification.verificationStatus === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApprove(verification._id)}
                            disabled={updatingStatus}
                            style={{ 
                              padding: '6px 12px', 
                              marginRight: '8px', 
                              background: updatingStatus ? '#6c757d' : '#28a745', 
                              color: '#fff', 
                              border: 'none', 
                              borderRadius: '6px',
                              cursor: updatingStatus ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}
                          >
                            {updatingStatus ? 'Updating...' : 'Approve'}
                          </button>
                          <button 
                            onClick={() => handleReject(verification._id)}
                            disabled={updatingStatus}
                            style={{ 
                              padding: '6px 12px', 
                              background: updatingStatus ? '#6c757d' : '#dc3545', 
                              color: '#fff', 
                              border: 'none', 
                              borderRadius: '6px',
                              cursor: updatingStatus ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}
                          >
                            {updatingStatus ? 'Updating...' : 'Reject'}
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

      {/* Details Modal */}
      {renderDetailsModal()}

      {/* Toast Notification */}
      {renderToast()}
    </div>
  );
}

export default AdminPanel;
