import React, { useState } from 'react';
import Login from '../LoginPendente';
import Dashboard from '../DashPendente';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <div>
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard />
      )}
    </div>
  );
};

export default App;