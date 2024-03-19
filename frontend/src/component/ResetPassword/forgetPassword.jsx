import React, { useState } from 'react';
import axios from 'axios';

function ForgetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleForgetPassword = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/forget-password', { email });
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
    <div className=' flex flex-col  items-center justify-center mt-[10%]'>
      <h2 className='p-4 text-2xl font-bold text-white'>Forgot your Password ? We got you!</h2>
      <input
      className='p-2 w-[20%]'
        type="email"
        placeholder="Enter your registered email ID"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleForgetPassword} className='btn btn-primary p-2'>Send Reset Link</button>
      {message && <p>{message}</p>}
      {success && <p>Please check your email for the reset link.</p>}
    </div>
  );
}

export default ForgetPassword;
