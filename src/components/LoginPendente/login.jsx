import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'jaya' && password === '697843') {
      onLogin();
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'blue', color: 'white' }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <input style={{ padding: '10px', margin: '5px', border: '1px solid white' }} type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <input style={{ padding: '10px', margin: '5px', border: '1px solid white' }} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button style={{ padding: '10px', margin: '5px', backgroundColor: 'white', color: 'blue' }} type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;