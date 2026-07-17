import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthorRoute from './components/AuthorRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import PostDetail from './pages/PostDetail';
import CreateEditPost from './pages/CreateEditPost';
import MyPosts from './pages/MyPosts';
import Bookmarks from './pages/Bookmarks';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            }
          />
          <Route path="/posts/new" element={<AuthorRoute><CreateEditPost /></AuthorRoute>} />
          <Route path="/posts/:id/edit" element={<AuthorRoute><CreateEditPost /></AuthorRoute>} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/my-posts" element={<AuthorRoute><MyPosts /></AuthorRoute>} />
          <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3500} newestOnTop />
    </AuthProvider>
  );
}

export default App;
