import { checkAdminCredentials } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;
  
  if (checkAdminCredentials(email, password)) {
    // In a real app, you'd use JWT or sessions
    // For simplicity, we'll just return success
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
}
