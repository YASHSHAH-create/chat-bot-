import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        // Store login state in localStorage (in a real app, use proper session management)
        localStorage.setItem('adminLoggedIn', 'true');
        router.push('/admin');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Admin Login – Envirocare Labs</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="login-container">
        <h2>Admin Login</h2>

        {error && (
          <div className="flash-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Admin Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>

      <style jsx>{`
        body {
          font-family: "Segoe UI", sans-serif;
          background: #f4f7f9;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
        }

        .login-container {
          background: #fff;
          padding: 30px 40px;
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 400px;
          margin: auto;
          margin-top: 20vh;
        }

        h2 {
          margin-bottom: 20px;
          color: #333;
          text-align: center;
        }

        form input[type="email"],
        form input[type="password"] {
          width: 100%;
          padding: 12px;
          margin-bottom: 15px;
          border: 1px solid #ccc;
          border-radius: 5px;
          box-sizing: border-box;
        }

        form button {
          width: 100%;
          padding: 12px;
          background-color: #008b8b;
          border: none;
          border-radius: 5px;
          color: white;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        form button:hover:not(:disabled) {
          background-color: #006666;
        }

        form button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .flash-message {
          color: red;
          text-align: center;
          margin-bottom: 10px;
          padding: 10px;
          background-color: #ffe6e6;
          border-radius: 5px;
        }
      `}</style>
    </>
  );
}
