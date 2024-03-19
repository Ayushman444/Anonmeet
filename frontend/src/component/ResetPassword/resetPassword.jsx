import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; 

function ResetPassword() {
  const { token } = useParams(); 
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/reset-password', {
        password,
        confirmPassword,
        token
      });
      if (response.data.success) {
        setSuccess(true);
        setMessage(response.data.message);
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred. Please try again later.');
    }
  };

  return (
    <div>
      {!success ? (
        <div>
          <h2>Reset Password</h2>
          <label>Password:</label>
          <input
            type="password"
            placeholder="Enter your new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label>Confirm Password:</label>
          <input
            type="password"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button onClick={handleResetPassword}>Reset Password</button>
          {message && <p>{message}</p>}
          {success && <p>Password reset successfully.</p>}
        </div>
      ) : null}
    </div>
  );
}

export default ResetPassword;
