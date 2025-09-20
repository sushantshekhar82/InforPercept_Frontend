import { useState, useEffect, useRef } from "react";
import Keycloak from "keycloak-js";

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isRun =  useRef(false)
  const keycloak = useRef(null);
  const [token,setToken] = useState(null)

  useEffect(() => {

    if(isRun.current){
      return
    }
    isRun.current = true
    const initKeycloak = async () => {
      keycloak.current = new Keycloak({
        url: "http://127.0.0.1:4080",  // your Keycloak URL
        realm: "myRelm",              // must match Keycloak
        clientId: "myClient",          // must match Keycloak
      });

      try {
        const authenticated = await keycloak.current.init({
          onLoad: "login-required",    // correct spelling
          checkLoginIframe: false,     // disable iframe check (simplifies dev)
        });

        setIsAuthenticated(authenticated);
        setToken(keycloak.current.token)
        
      } catch (error) {
        console.error("Keycloak init error:", error);
        setIsAuthenticated(false);
      }
    };

    initKeycloak();
  }, []);

  return [isAuthenticated,token];
};

export default useAuth;
