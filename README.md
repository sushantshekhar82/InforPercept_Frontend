# 🔐 Document Verification Portal

A comprehensive, role-based document verification system built with React and Keycloak authentication. This application provides secure document upload, OCR processing, and administrative management capabilities with granular access control.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Endpoints](#-api-endpoints)
- [Role-Based Access Control](#-role-based-access-control)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

## ✨ Features

### 🔑 Authentication & Authorization
- **Keycloak Integration**: Secure authentication with Keycloak
- **Role-Based Access Control**: Granular permissions system
- **JWT Token Management**: Secure token handling and validation
- **Multi-Role Support**: User, Moderator, Admin, and Super-Admin roles

### 📄 Document Management
- **Secure Upload**: Document upload with validation
- **OCR Processing**: Automatic text extraction from documents
- **Multiple Formats**: Support for various document types (PDF, images)
- **Base64 Encoding**: Secure document storage and transmission

### 👥 User Management
- **User Dashboard**: Personal verification tracking
- **Status Tracking**: Real-time verification status updates
- **Document History**: Complete audit trail of submissions
- **Profile Management**: User profile and role management

### 🛡️ Admin Panel
- **Verification Management**: Approve/reject document verifications
- **User Administration**: Manage user accounts and permissions
- **System Monitoring**: Track verification statistics and metrics
- **Bulk Operations**: Efficient management of multiple verifications

### 🔍 Advanced Features
- **OCR Data Display**: Detailed extraction results with structured data
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Live status updates and notifications
- **Error Handling**: Comprehensive error management and user feedback

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - Modern UI library
- **Vite 7.1.6** - Fast build tool and dev server
- **React Router DOM 7.9.1** - Client-side routing
- **Axios 1.12.2** - HTTP client for API communication

### Authentication
- **Keycloak JS 26.2.0** - Authentication and authorization
- **React Keycloak Web 3.4.0** - React integration for Keycloak

### UI & Styling
- **Chakra UI 3.27.0** - Component library
- **Emotion React 11.14.0** - CSS-in-JS styling
- **Custom CSS** - Tailored styling for specific components

### Development Tools
- **ESLint 9.35.0** - Code linting and quality
- **TypeScript Types** - Type definitions for React
- **Vite Plugin React 5.0.2** - React support for Vite

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** package manager
- **Keycloak Server** (v20.0.0 or higher)
- **Backend API** (Node.js/Express server running on port 5050)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd verification-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_KEYCLOAK_URL=http://localhost:8080
   VITE_KEYCLOAK_REALM=myRelm
   VITE_KEYCLOAK_CLIENT_ID=myClient
   VITE_API_BASE_URL=http://localhost:5050
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:5173`

## ⚙️ Configuration

### Keycloak Setup
1. **Create a new realm** in Keycloak (e.g., `myRelm`)
2. **Create a client** with the following settings:
   - Client ID: `myClient`
   - Client Protocol: `openid-connect`
   - Access Type: `public`
   - Valid Redirect URIs: `http://localhost:5173/*`
   - Web Origins: `http://localhost:5173`

3. **Configure roles** as described in [KEYCLOAK_ROLE_SETUP.md](./KEYCLOAK_ROLE_SETUP.md)

### Backend API Configuration
Ensure your backend API is running on `http://localhost:5050` with the following endpoints:
- `POST /verification/verify-user` - Document upload
- `GET /verification/list-verifications` - List verifications
- `GET /verification/user-verification/:id` - Get verification details
- `PUT /verification/user-verification/:id/status` - Update verification status
- `GET /auth/me` - Get current user info

## 🎯 Usage

### For Regular Users
1. **Login** with your Keycloak credentials
2. **Navigate to "Start New Verification"** tab
3. **Enter Document ID** (10 characters)
4. **Upload Document** (PDF or image)
5. **Submit** and track verification status
6. **View Details** to see OCR results and document preview

### For Administrators
1. **Login** with admin credentials
2. **Access Admin Panel** (automatically shown for admin users)
3. **View All Verifications** in the dashboard
4. **Review Documents** using the "View" button
5. **Approve/Reject** verifications as needed
6. **Monitor Statistics** and system metrics

### Key Features Usage
- **Document Upload**: Drag & drop or click to upload documents
- **OCR Results**: View extracted text and structured data
- **Status Tracking**: Real-time updates on verification progress
- **Role Management**: Automatic UI adaptation based on user roles

## 🔌 API Endpoints

### Authentication
- `GET /auth/me` - Get current user information

### Document Verification
- `POST /verification/verify-user` - Submit new verification
  ```json
  {
    "documentFile": "multipart/form-data",
    "userId": "string",
    "documentId": "string"
  }
  ```

- `GET /verification/list-verifications` - List verifications
  - Query params: `page`, `limit`, `userId`
  
- `GET /verification/user-verification/:id` - Get verification details
- `PUT /verification/user-verification/:id/status` - Update verification status
  ```json
  {
    "verificationStatus": "verified|rejected|pending"
  }
  ```

### Response Format
```json
{
  "status": "success|error",
  "data": {
    "verificationDetails": {
      "_id": "string",
      "documentId": "string",
      "userId": "string",
      "verificationStatus": "pending|verified|rejected",
      "documentData": {
        "fileName": "string",
        "mimeType": "string",
        "size": "number",
        "base64": "string",
        "ocrMessage": "string",
        "ocrData": {
          "client_id": "string",
          "name": "string",
          "gender": "string",
          "state": "string",
          // ... other OCR fields
        }
      },
      "createdAt": "ISO string",
      "updatedAt": "ISO string"
    }
  }
}
```

## 🔐 Role-Based Access Control

### Role Hierarchy
```
super-admin (Level 4)
├── admin (Level 3)
├── moderator (Level 2)
└── user (Level 1)
```

### Permissions Matrix

| Feature | User | Moderator | Admin | Super-Admin |
|---------|------|-----------|-------|-------------|
| Upload Documents | ✅ | ✅ | ✅ | ✅ |
| View Own Verifications | ✅ | ✅ | ✅ | ✅ |
| View All Verifications | ❌ | ✅ | ✅ | ✅ |
| Moderate Verifications | ❌ | ✅ | ✅ | ✅ |
| Access Admin Panel | ❌ | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ✅ | ✅ |
| System Settings | ❌ | ❌ | ✅ | ✅ |
| Realm Management | ❌ | ❌ | ❌ | ✅ |

### Role Configuration
See [KEYCLOAK_ROLE_SETUP.md](./KEYCLOAK_ROLE_SETUP.md) for detailed setup instructions.

## 📁 Project Structure

```
src/
├── Components/
│   ├── AdminPanel.jsx          # Admin dashboard and management
│   ├── protected.jsx           # User verification interface
│   ├── public.jsx              # Public landing page
│   ├── RoleExample.jsx         # Role demonstration component
│   └── RoleGuard.jsx           # Route protection component
├── Hooks/
│   └── useAuth.jsx             # Authentication hook
├── utils/
│   └── roleUtils.js            # Role-based access utilities
├── assets/
│   └── react.svg               # React logo
├── App.jsx                     # Main application component
├── main.jsx                    # Application entry point
├── App.css                     # Global styles
└── index.css                   # Base styles
```

## 📸 Screenshots

### User Dashboard
- **Verification Form**: Clean, intuitive document upload interface
- **Status Tracking**: Real-time verification progress
- **Document History**: Complete audit trail

### Admin Panel
- **Verification Management**: Comprehensive admin dashboard
- **Document Review**: Detailed document inspection with OCR results
- **User Management**: Role-based user administration

### OCR Results Display
- **Structured Data**: Organized OCR extraction results
- **Document Preview**: High-quality document visualization
- **Status Management**: Easy approve/reject workflow

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards
- Follow **ESLint** configuration
- Use **semantic commit messages**
- Write **comprehensive tests**
- Update **documentation** for new features
- Ensure **responsive design** compatibility

### Pull Request Guidelines
- Provide clear description of changes
- Include screenshots for UI changes
- Update README if necessary
- Ensure all tests pass
- Follow the existing code style

### Issue Reporting
- Use the issue template
- Provide detailed reproduction steps
- Include browser/OS information
- Add relevant screenshots or logs

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Document Verification Portal

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 📞 Contact

### Author Information
- **Name**: [Your Name]
- **Email**: [your.email@example.com]
- **GitHub**: [@yourusername](https://github.com/yourusername)
- **LinkedIn**: [Your LinkedIn Profile](https://linkedin.com/in/yourprofile)

### Project Links
- **Repository**: [GitHub Repository](https://github.com/yourusername/verification-project)
- **Live Demo**: [Demo URL](https://your-demo-url.com)
- **Documentation**: [Project Wiki](https://github.com/yourusername/verification-project/wiki)

### Support
- **Issues**: [GitHub Issues](https://github.com/yourusername/verification-project/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/verification-project/discussions)
- **Email Support**: [support@example.com](mailto:support@example.com)

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with ❤️ by [Your Name]

</div>