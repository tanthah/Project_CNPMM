import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import store from './store'
import 'bootstrap/dist/css/bootstrap.min.css';

const container = document.getElementById('root')
const root = createRoot(container)

root.render(
  <React.StrictMode>
    <div className="bg-gradient" />
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
)
