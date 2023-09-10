import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from 'react-query';

const Register = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [registrationError, setRegistrationError] = useState(null);

  const registerUser = useMutation(async (newUserData) => {
    try {
      if (newUserData.password !== newUserData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUserData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      router.push('/login');
    } catch (error) {
      console.error('Registration failed:', error.message);
      setRegistrationError(error.message);
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    registerUser.mutate(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-3xl font-semibold mb-6 text-center">Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-400"
              placeholder="Username"
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-400"
              placeholder="Password"
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-400"
              placeholder="Confirm Password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600"
          >
            Register
          </button>
        </form>
        {registrationError && (
          <p className="text-red-500 mt-4 text-center font-semibold">{registrationError}</p>
        )}
        <p className="text-center mt-4">
          Already have an account?{' '}
          <a className="text-blue-500 cursor-pointer" onClick={() => router.push('/login')}>
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
