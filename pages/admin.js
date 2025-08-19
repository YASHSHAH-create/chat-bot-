import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if admin is logged in
    const adminLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!adminLoggedIn) {
      router.push('/login');
      return;
    }

    // Fetch users
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    router.push('/login');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Executive Dashboard – User List</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="admin-container">
        <h2>👥 Submitted Users</h2>
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Service</th>
                <th>Sub-Service</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.number}</td>
                  <td>{user.email}</td>
                  <td>{user.service}</td>
                  <td>{user.subService}</td>
                  <td>
                    <Link href={`/chat/${user._id}`} className="chat-link">
                      💬 Chat
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      <style jsx>{`
        body {
          font-family: Arial, sans-serif;
          background: #f5f5f5;
          padding: 20px;
          margin: 0;
        }

        .admin-container {
          max-width: 1000px;
          margin: auto;
          background: #fff;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        h2 {
          text-align: center;
          color: #333;
          margin-bottom: 30px;
        }

        .table-container {
          overflow-x: auto;
          margin-bottom: 20px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }

        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: center;
        }

        th {
          background: #007BFF;
          color: white;
          font-weight: 600;
        }

        tr:nth-child(even) {
          background-color: #f9f9f9;
        }

        tr:hover {
          background-color: #f1f1f1;
        }

        .chat-link {
          text-decoration: none;
          background: #007BFF;
          color: white;
          padding: 8px 12px;
          border-radius: 5px;
          font-size: 14px;
          transition: background-color 0.3s ease;
        }

        .chat-link:hover {
          background: #0056b3;
        }

        .logout-btn {
          float: right;
          background: #dc3545;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.3s ease;
        }

        .logout-btn:hover {
          background: #c82333;
        }

        @media (max-width: 768px) {
          .admin-container {
            margin: 10px;
            padding: 15px;
          }
          
          table {
            font-size: 12px;
          }
          
          th, td {
            padding: 8px 4px;
          }
        }
      `}</style>
    </>
  );
}
