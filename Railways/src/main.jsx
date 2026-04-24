import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  // Use React.StrictMode carefully with WebSockets; keeping it off here to avoid double connects
  <App />
)
