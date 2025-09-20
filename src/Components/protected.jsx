import { useState } from "react";
import axios from "axios";

function VerifyUserForm(token) {
  const [file, setFile] = useState(null);
  const [userId, setUserId] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false); // new loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // start loader

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
            Authorization: `Bearer ${token.token}`,
          },
        }
      );
      setResponse(res.data);
      console.log("Success:", res.data);
    } catch (err) {
      console.error("Error uploading:", err);
    } finally {
      setLoading(false); // stop loader
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "http://localhost:5173";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#1e1e1e",
      }}
    >
      <div
        style={{
          width: "500px",
          background: "#2a2a2a",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 6px 15px rgba(0,0,0,0.3)",
          color: "#f5f5f5",
        }}
      >
        {/* Top Row with Logout */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "20px",
          }}
        >
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 15px",
              border: "none",
              borderRadius: "6px",
              background: "#e63946",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Logout
          </button>
        </div>

        <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
          Verify User
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label>Document ID:</label>
            <input
              type="text"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              required
              style={{
                display: "block",
                width: "100%",
                marginTop: "8px",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #444",
                background: "#1e1e1e",
                color: "#fff",
              }}
              placeholder="Enter document ID like PAN"
            />
          </div>
          <div style={{ marginBottom: "15px", marginLeft: "10px" }}>
            <label>Upload Document:</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              required
              style={{ display: "block", marginTop: "8px" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading} // disable while loading
            style={{
              width: "100%",
              padding: "10px",
              background: "#0077ff",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Uploading..." : "Submit"} {/* loader text */}
          </button>
        </form>

        {/* Response */}
        {response && response.status === "success" && (
          <div
            style={{
              display: "flex",
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "20px",
              maxWidth: "800px",
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
}

export default VerifyUserForm;
