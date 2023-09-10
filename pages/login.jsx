import { useState } from 'react';
import { useRouter } from 'next/router';

function LoginForm() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [loginStatus, setLoginStatus] = useState(null);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(formData);

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      // Login successful
      setLoginStatus('Login successful');
      router.push('/UploadView');
    } else {
      // Login failed
      setLoginStatus('Wrong username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-3xl font-semibold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="username" className="block text-gray-700 font-semibold">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-400"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-semibold">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-400"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600"
          >
            Login
          </button>
          <p className="text-center mt-4">
          Already have an account?{' '}
          <a className="text-blue-500 cursor-pointer" onClick={() => router.push('/register')}>
            Register
          </a>
        </p>
        </form>
        {loginStatus && (
          <p className="text-red-500 mt-4 text-center font-semibold">{loginStatus}</p>
        )}
      </div>
    </div>
  );
}

export default LoginForm;
