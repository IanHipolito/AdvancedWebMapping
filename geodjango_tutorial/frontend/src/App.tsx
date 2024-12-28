import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MapPage from './pages/Map';
import PrivateRoute from './pages/PrivateRoute';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/map"
          element={<PrivateRoute element={<MapPage updateLocationUrl="/hospital/update_location/" />} />}
        />
      </Routes>
    </Router>
  );
};

export default App;
