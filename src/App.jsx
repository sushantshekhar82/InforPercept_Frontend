import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Public from './Components/public'
import Protected from './Components/protected'
import useAuth from './Hooks/useAuth'
function App() {
   const [isAuthenticated,token] = useAuth();

   return isAuthenticated ? <Protected token= {token}/> : <Public />

}

  

export default App
