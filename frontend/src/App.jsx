import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SmartMirror from './pages/SmartMirror';
import MaxhubDashboard from './pages/MaxhubDashboard';
import MobileApp from './pages/MobileApp';
import NotFound from './pages/NotFound';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* 公开路由：登录页 */}
        <Route path="/login" element={<Login />} />
        
        {/* 私有路由：需要登录才能访问 */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<SmartMirror />} />
          <Route path="/maxhub" element={<MaxhubDashboard />} />
          <Route path="/mobile" element={<MobileApp />} />
        </Route>
        
        {/* 404页面 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;