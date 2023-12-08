import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App'
import AppNetworkGate from './components/AppNetworkGate'
import './index.css'

import { store } from './store/store'
import { Provider } from 'react-redux'
import { PersistGate } from 'reduxjs-toolkit-persist/integration/react'
import { persistStore } from 'reduxjs-toolkit-persist'

const persistor = persistStore(store)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppNetworkGate>
          <App />
        </AppNetworkGate>
      </PersistGate>
    </Provider>
  </React.StrictMode>,
)
