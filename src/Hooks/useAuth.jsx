import { useState, useRef, useCallback } from "react";
import Keycloak from "keycloak-js";

// Global Keycloak instance to prevent re-initialization
let globalKeycloak = null;
let globalAuthState = {
  isAuthenticated: false,
  userProfile: null,
  userRoles: [],
  token: null,
  isLoading: true
};

const useAuth = () => {
  // Use refs to store state and prevent re-renders
  const authState = useRef(globalAuthState);
  const keycloak = useRef(globalKeycloak);
  const isInitialized = useRef(false);
  const [, forceUpdate] = useState({});

  // Force component update
  const triggerUpdate = useCallback(() => {
    forceUpdate({});
  }, []);

  // Function to extract roles from Keycloak token
  const extractRolesFromToken = useCallback((tokenParsed) => {
    if (!tokenParsed) return [];
    
    const roles = [];
    
    // Extract realm roles
    if (tokenParsed.realm_access && tokenParsed.realm_access.roles) {
      roles.push(...tokenParsed.realm_access.roles);
    }
    
    // Extract client roles
    if (tokenParsed.resource_access) {
      Object.keys(tokenParsed.resource_access).forEach(clientId => {
        if (tokenParsed.resource_access[clientId].roles) {
          roles.push(...tokenParsed.resource_access[clientId].roles);
        }
      });
    }
    
    return roles;
  }, []);

  // Initialize Keycloak only once
  const initializeKeycloak = useCallback(async () => {
    if (isInitialized.current || keycloak.current) {
      return;
    }

    try {
      keycloak.current = new Keycloak({
        url: "http://127.0.0.1:4080",
        realm: "myRelm",
        clientId: "myClient",
      });

      const authenticated = await keycloak.current.init({
        onLoad: "login-required",
        checkLoginIframe: false,
      });

      if (authenticated) {
        authState.current.isAuthenticated = true;
        authState.current.token = keycloak.current.token;
        
        // Load user profile
        const profile = await keycloak.current.loadUserProfile();
        authState.current.userProfile = profile;
        
        // Extract roles from token
        const roles = extractRolesFromToken(keycloak.current.tokenParsed);
        console.log("Roles:", roles);
        authState.current.userRoles = roles;
      } else {
        authState.current.isAuthenticated = false;
      }
      
      authState.current.isLoading = false;
      isInitialized.current = true;
      
      // Update global state
      globalKeycloak = keycloak.current;
      globalAuthState = { ...authState.current };
      
      // Trigger component update
      triggerUpdate();
    } catch (error) {
      console.error("Keycloak init error:", error);
      authState.current.isAuthenticated = false;
      authState.current.isLoading = false;
      globalAuthState = { ...authState.current };
      triggerUpdate();
    }
  }, [extractRolesFromToken, triggerUpdate]);

  // Initialize on first call
  if (!isInitialized.current && !keycloak.current) {
    initializeKeycloak();
  }

  // Function to check if user has specific role
  const hasRole = useCallback((role) => {
    return authState.current.userRoles.includes(role);
  }, []);

  // Function to check if user has any of the specified roles
  const hasAnyRole = useCallback((roles) => {
    return roles.some(role => authState.current.userRoles.includes(role));
  }, []);

  // Function to check if user is admin
  const isAdmin = useCallback(() => {
    return hasAnyRole(['admin', 'administrator', 'super-admin']);
  }, [hasAnyRole]);

  // Function to logout
  const logout = useCallback(() => {
    if (keycloak.current) {
      keycloak.current.logout();
    }
  }, []);

  return {
    isAuthenticated: authState.current.isAuthenticated,
    token: authState.current.token,
    userProfile: authState.current.userProfile,
    userRoles: authState.current.userRoles,
    isLoading: authState.current.isLoading,
    hasRole,
    hasAnyRole,
    isAdmin,
    logout,
    keycloak: keycloak.current
  };
};

export default useAuth;
