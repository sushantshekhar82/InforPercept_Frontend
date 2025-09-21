import { useState, useEffect } from "react";
import axios from "axios";
import useAuth from "../Hooks/useAuth";

// Add CSS for spinner animation
const spinnerStyle = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject the CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = spinnerStyle;
  document.head.appendChild(style);
}

function Protected({ token }) {
  const { userProfile, userRoles, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('start-verification');
  const [file, setFile] = useState(null);
  const [userId, setUserId] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userVerifications, setUserVerifications] = useState([]);
  const [verificationStats, setVerificationStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [documentIdError, setDocumentIdError] = useState('');

  useEffect(() => {
    getCurrentUserId();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      loadUserVerifications();
    }
  }, [currentUserId]);

  const getCurrentUserId = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5050/auth/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCurrentUserId(response.data.data.userId);
    } catch (error) {
      console.error("Error getting current user ID:", error);
    }
  };

  const loadUserVerifications = async () => {
    if (!currentUserId) return;
    
    try {
      const res = await axios.get(
        `http://localhost:5050/verification/list-verifications?page=1&limit=100&userId=${currentUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const verifications = res.data.data.docs || [];
      setUserVerifications(verifications);
      
      // Calculate stats
      const stats = {
        total: verifications.length,
        pending: verifications.filter(v => v.verificationStatus === 'pending').length,
        approved: verifications.filter(v => v.verificationStatus === 'verified').length,
        rejected: verifications.filter(v => v.verificationStatus === 'rejected').length
      };
      setVerificationStats(stats);
    } catch (err) {
      console.error("Error loading verifications:", err);
      // Set mock data for demonstration
      setUserVerifications([
        {
          _id: 1,
          documentId: "PAN123456789",
          verificationStatus: "pending",
          createdAt: new Date().toISOString(),
          documentData: { fileName: "pan_card.pdf", mimeType: "application/pdf" }
        },
        {
          _id: 2,
          documentId: "AADHAR987654321",
          verificationStatus: "verified",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          documentData: { fileName: "aadhar_card.pdf", mimeType: "application/pdf" }
        }
      ]);
      setVerificationStats({ total: 2, pending: 1, approved: 1, rejected: 0 });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate document ID before submission
    if (documentId.length !== 10) {
      setDocumentIdError('Please enter a valid 10-character Document ID');
      return;
    }
    
    if (!file) {
      alert('Please select a document to upload');
      return;
    }
    
    setLoading(true);

    const formData = new FormData();
    formData.append("documentFile", file);
    formData.append("userId", userId);
    formData.append("documentId", documentId);

    try {
      const res = await axios.post(
        "http://localhost:5050/verification/verify-user",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setResponse(res.data);
      console.log("Success:", res.data);
      // Reload verifications after successful submission
      loadUserVerifications();
      // Clear form after successful submission
      setDocumentId('');
      setFile(null);
      setDocumentIdError('');
    } catch (err) {
      console.error("Error uploading:", err);
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

  const validateDocumentId = (value) => {
    // Allow both numbers and characters, just limit length
    const cleanValue = value;
    
    // Check if it's exactly 10 characters
    if (cleanValue.length === 0) {
      setDocumentIdError('');
      return '';
    } else if (cleanValue.length < 10) {
      setDocumentIdError(`Please enter all 10 characters (${cleanValue.length}/10)`);
      return cleanValue;
    } else if (cleanValue.length > 10) {
      setDocumentIdError('Document ID must be exactly 10 characters');
      return cleanValue.slice(0, 10);
    } else {
      setDocumentIdError('');
      return cleanValue;
    }
  };

  const handleDocumentIdChange = (e) => {
    const value = e.target.value;
    const validatedValue = validateDocumentId(value);
    setDocumentId(validatedValue);
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

  const renderDashboard = () => (
    <div style={{ padding: '20px', width: '100%' }}>
      <h2>Your Verification Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '20px' }}>
        <div style={{ background: '#2a2a2a', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
          <h3 style={{ color: '#0077ff', margin: '0 0 15px 0', fontSize: '18px' }}>Total Requests</h3>
          <p style={{ fontSize: '3em', margin: '0', color: '#fff', fontWeight: 'bold' }}>{verificationStats.total}</p>
        </div>
        <div style={{ background: '#2a2a2a', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
          <h3 style={{ color: '#ffc107', margin: '0 0 15px 0', fontSize: '18px' }}>Pending</h3>
          <p style={{ fontSize: '3em', margin: '0', color: '#fff', fontWeight: 'bold' }}>{verificationStats.pending}</p>
        </div>
        <div style={{ background: '#2a2a2a', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
          <h3 style={{ color: '#28a745', margin: '0 0 15px 0', fontSize: '18px' }}>Approved</h3>
          <p style={{ fontSize: '3em', margin: '0', color: '#fff', fontWeight: 'bold' }}>{verificationStats.approved}</p>
        </div>
        <div style={{ background: '#2a2a2a', padding: '25px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
          <h3 style={{ color: '#dc3545', margin: '0 0 15px 0', fontSize: '18px' }}>Rejected</h3>
          <p style={{ fontSize: '3em', margin: '0', color: '#fff', fontWeight: 'bold' }}>{verificationStats.rejected}</p>
        </div>
      </div>
    </div>
  );

  const renderVerifications = () => (
    <div style={{ padding: '20px', width: '100%' }}>
      <h2>Your Requested Verifications</h2>
      {userVerifications.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px', 
          background: '#2a2a2a', 
          borderRadius: '12px',
          color: '#ccc',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}>
          <h3 style={{ fontSize: '24px', marginBottom: '15px' }}>No verification requests yet</h3>
          <p style={{ fontSize: '16px' }}>Start your first verification by submitting a new verification below</p>
        </div>
      ) : (
        <div style={{ background: '#2a2a2a', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#1e1e1e' }}>
                <th style={{ padding: '15px', textAlign: 'left', color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>Document ID</th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>File Name</th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>Status</th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>Submitted</th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {userVerifications.map((verification, index) => (
                <tr key={verification._id} style={{ borderBottom: '1px solid #444' }}>
                  <td style={{ padding: '15px', color: '#fff', fontSize: '14px' }}>{verification.documentId}</td>
                  <td style={{ padding: '15px', color: '#fff', fontSize: '14px' }}>{verification.documentData?.fileName || 'N/A'}</td>
                  <td style={{ padding: '15px', color: '#fff' }}>
                    <span style={{ 
                      padding: '6px 12px', 
                      borderRadius: '6px', 
                      background: verification.verificationStatus === 'verified' ? '#28a745' : 
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderStartVerification = () => (
    <div style={{ padding: '2px', width: '93%' }}>
      <h2>Start New Verification</h2>
      <div style={{ 
        background: '#2a2a2a',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 6px 15px rgba(0,0,0,0.3)',
        width: '100%'
      }}>
        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>Document ID:</label>
              <input
                type="text"
                value={documentId}
                onChange={handleDocumentIdChange}
                required
                maxLength="10"
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: "8px",
                  padding: "12px",
                  borderRadius: "6px",
                  border: documentIdError ? "1px solid #dc3545" : "1px solid #444",
                  background: "#1e1e1e",
                  color: "#fff",
                  fontSize: '16px'
                }}
                placeholder="Enter 10-character Document ID"
              />
              {documentIdError && (
                <div style={{
                  color: '#dc3545',
                  fontSize: '14px',
                  marginTop: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <span>⚠️</span>
                  {documentIdError}
                </div>
              )}
            </div>
            <div>
              <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>Upload Valid Document:</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              required
                style={{ 
                  display: "block", 
                  marginTop: "8px",
                  color: '#fff',
                  padding: '8px',
                  width: '120%'
                }}
              />
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
          <button
            type="submit"
              disabled={loading}
            style={{
                padding: "12px 30px",
              background: "#0077ff",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
                fontSize: '16px',
                minWidth: '200px'
            }}
          >
              {loading ? "Uploading..." : "Submit Verification"}
          </button>
          </div>
        </form>

        {/* Response */}
        {response && response.status === "success" && (
          <div
            style={{
              display: "flex",
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "20px",
              marginTop: "20px",
              backgroundColor: "#ffffff",
              color: "#222",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            {/* Left Side: Details */}
            <div style={{ flex: 1, paddingRight: "20px" }}>
              <h3 style={{ marginBottom: "10px" }}>Verification Details</h3>
              <p>
                <strong>User ID:</strong> {response.data.userId}
              </p>
              <p>
                <strong>Document ID:</strong> {response.data.documentId}
              </p>
              <p>
                <strong>Status:</strong> {response.data.verificationStatus}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {new Date(response.data.createdAt).toLocaleString()}
              </p>
              <p>
                <strong>Updated At:</strong>{" "}
                {new Date(response.data.updatedAt).toLocaleString()}
              </p>

              <h4 style={{ marginTop: "15px" }}>Document Info</h4>
              <p>
                <strong>File Name:</strong>{" "}
                {response.data.documentData.fileName}
              </p>
              <p>
                <strong>Type:</strong> {response.data.documentData.mimeType}
              </p>
              <p>
                <strong>Size:</strong>{" "}
                {(response.data.documentData.size / 1024).toFixed(2)} KB
              </p>
            </div>

            {/* Right Side: Image */}
            <div style={{ flex: 1, textAlign: "center" }}>
              <img
                src={`data:${response.data.documentData.mimeType};base64,${response.data.documentData.base64}`}
                alt="Uploaded Document"
                style={{
                  maxWidth: "100%",
                  maxHeight: "300px",
                  borderRadius: "8px",
                  boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#1e1e1e', 
      color: '#fff', 
      width: '100%' 
    }}>
      {/* Header */}
      <div style={{ 
        background: '#2a2a2a', 
        padding: '20px', 
        borderBottom: '1px solid #444',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div>
          <h1 style={{ margin: '0', color: '#0077ff' }}>Verification Portal</h1>
          <p style={{ margin: '5px 0 0 0', color: '#ccc' }}>
            Welcome, {userProfile?.username || 'User'}
          </p>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '15px',
          flexWrap: 'wrap',
          maxWidth: '60%'
        }}>
          <span style={{ 
            color: '#ccc', 
            fontSize: '14px',
            wordBreak: 'break-word',
            maxWidth: '300px'
          }}>
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
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        {renderDashboard()}
        {renderVerifications()}
        {renderStartVerification()}
      </div>

      {/* Details Modal */}
      {renderDetailsModal()}
    </div>
  );
}

export default Protected;
