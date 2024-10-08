import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';

import './index.css';
import { store } from './redux/store.js';
import { ConfigProvider } from 'antd';
import { GoogleOAuthProvider } from '@react-oauth/google';
import envClient from './env.js';
import { SocketContextProvider } from './context/SocketContext.jsx';
import React from 'react';
import { CallContextProvider } from './context/CallContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <Provider store={store}>
            <ConfigProvider>
                <GoogleOAuthProvider clientId={envClient.GOOGLE_OATH_CLIENT_ID}>
                    <SocketContextProvider>
                        <CallContextProvider>
                            <App />
                        </CallContextProvider>
                    </SocketContextProvider>
                </GoogleOAuthProvider>
            </ConfigProvider>
        </Provider>
    </BrowserRouter>
);
