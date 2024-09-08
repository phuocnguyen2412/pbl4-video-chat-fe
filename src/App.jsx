import { Navigate, Route, Routes } from 'react-router-dom';

import ForgotPassword from './pages/LoginPage/ForgotPasswordPage';
import LoginPage from './pages/LoginPage/LoginPage';
import MainPage from './pages/MainPage/MainPage';
import ContactPage from './pages/MessagePage/ContactPage/ContactPage';
import MessagePage from './pages/MessagePage/MessagePage';

import ProtectedRoute from './routes/ProtectedRoute';
import UnauthorizeRoute from './routes/UnauthorizeRoute';
import SearchPage from './pages/SearchPage/SearchPage';
import UserPage from './pages/User/UserPage';
import FriendListPage from './pages/MessagePage/ContactPage/FriendListPage/FriendListPage';
import FriendRequestPage from './pages/MessagePage/ContactPage/FriendRequestPage/FriendRequestPage';

function App() {
    return (
        <Routes>
            {/* Public route for unauthenticated users */}
            <Route element={<UnauthorizeRoute />}>
                <Route path='/login' element={<LoginPage />} />
                <Route path='/forgot-password' element={<ForgotPassword />} />
            </Route>

            {/* Protected route for authenticated users */}
            <Route element={<ProtectedRoute />}>
                <Route path='/' element={<MainPage />}>
                    <Route path='/message' element={<MessagePage />} />
                    <Route path='/contact' element={<ContactPage />}>
                        <Route path='/contact/friend-list' element={<FriendListPage />} />
                        <Route path='/contact/friend-request' element={<FriendRequestPage />} />
                    </Route>
                    <Route path='/search' element={<SearchPage />} />
                    <Route path='/user/:id' element={<UserPage />} />
                </Route>
            </Route>

            {/* Optional: Catch-all route for undefined paths */}
            <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
    );
}

export default App;
