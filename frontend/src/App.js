import React from 'react';
import { BrowserRouter as Router, Route, Routes,Navigate } from 'react-router-dom';
import Home from './component/Home';
import CreatePost from './component/CreatePost';
import ChatPage from './component/Chat/ChatPage';
import Profile from './component/Profile/Profile';
import LoginModal from './component/Auth/Login';
import { useAuthContext } from './ContextApis/AuthContext';
import PostDetails from './component/PostDetails/PostPage';
import OtherProfile from './component/Profile/OtherProfile';
import ForgetPassword from './component/ResetPassword/forgetPassword';
import ResetPassword from './component/ResetPassword/resetPassword';

export default function App() {
  const {authUser} = useAuthContext();
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hot" element={<Home />} />
        <Route path="/top" element={<Home />} />
        <Route path="/new" element={<Home />} />
        <Route path="/post/:postId" element={<PostDetails/>} />
        <Route path="/create-post" element={authUser ? <CreatePost /> : <Navigate to="/" replace />}/>
        <Route path="/chat" element={authUser ? <ChatPage /> : <Navigate to="/" replace />}/>
        <Route path="/profile" element={authUser ? <Profile /> : <Navigate to="/" replace />} />
        <Route path="/profile/:username" element={<OtherProfile/>} />
        <Route path="/forgetpassword" element={<ForgetPassword/>} />
        <Route path="/resetpassword/:token" element={<ResetPassword/>} />
      </Routes>
    </Router>
  );
}
