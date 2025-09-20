import { useState, useEffect } from "react";
import axios from "axios";
import useAuth from "../Hooks/useAuth";

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

  useEffect(() => {
    
    loadUserVerifications();
  }, []);

  const loadUserVerifications = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5050/verification/user-verifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserVerifications(res.data.verifications || []);
      
      // Calculate stats
      const stats = {
        total: res.data.verifications?.length || 0,
        pending: res.data.verifications?.filter(v => v.verificationStatus === 'pending').length || 0,
        approved: res.data.verifications?.filter(v => v.verificationStatus === 'approved').length || 0,
        rejected: res.data.verifications?.filter(v => v.verificationStatus === 'rejected').length || 0
      };
      setVerificationStats(stats);
    } catch (err) {
      console.error("Error loading verifications:", err);
      // Set mock data for demonstration
      setUserVerifications([
        {
          id: 1,
          documentId: "PAN123456789",
          verificationStatus: "pending",
          createdAt: new Date().toISOString(),
          documentData: { fileName: "pan_card.pdf", mimeType: "application/pdf" }
        },
        {
          id: 2,
          documentId: "AADHAR987654321",
          verificationStatus: "approved",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          documentData: { fileName: "aadhar_card.pdf", mimeType: "application/pdf" }
        }
      ]);
      setVerificationStats({ total: 2, pending: 1, approved: 1, rejected: 0 });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    } catch (err) {
      console.error("Error uploading:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
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
          <p style={{ fontSize: '16px' }}>Start your first verification by clicking on "Start Verification" tab</p>
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
                <tr key={verification.id} style={{ borderBottom: '1px solid #444' }}>
                  <td style={{ padding: '15px', color: '#fff', fontSize: '14px' }}>{verification.documentId}</td>
                  <td style={{ padding: '15px', color: '#fff', fontSize: '14px' }}>{verification.documentData?.fileName || 'N/A'}</td>
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
                      background: '#0077ff', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      View Details
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
              onChange={(e) => setDocumentId(e.target.value)}
              required
              style={{
                display: "block",
                width: "100%",
                marginTop: "8px",
                  padding: "12px",
                borderRadius: "6px",
                border: "1px solid #444",
                background: "#1e1e1e",
                color: "#fff",
                  fontSize: '16px'
              }}
              placeholder="Enter document ID like PAN"
            />
          </div>
            <div>
              <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>Upload Document:</label>
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
        {/* {renderDashboard()} */}
        {renderStartVerification()}
      </div>
    </div>
  );
}

export default Protected;
