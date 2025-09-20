import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Public from './Components/public'
import Protected from './Components/protected'
import AdminPanel from './Components/AdminPanel'
import useAuth from './Hooks/useAuth'
import { canAccessAdminPanel } from './utils/roleUtils'

function App() {
   const auth = useAuth();
   const { isAuthenticated, token, userProfile, userRoles, isLoading } = auth;

   // Show loading state while Keycloak is initializing
   if (isLoading) {
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
           <h2>Loading...</h2>
           <p>Initializing authentication...</p>
         </div>
       </div>
     );
   }

   if (!isAuthenticated) {
     return <Public />;
   }

   // Check if user should see admin panel
   if (canAccessAdminPanel(userRoles)) {
     return <AdminPanel 
       token={token} 
       userProfile={userProfile} 
       userRoles={userRoles} 
       logout={auth.logout}
     />;
   }

   // Regular user sees the protected component
   return <Protected token={token} />;
}

export default App
