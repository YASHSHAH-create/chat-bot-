import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('chatbotDB');
    const collection = db.collection('userDetails');
    
    const users = await collection.find({}).sort({ timestamp: -1 }).toArray();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
}
