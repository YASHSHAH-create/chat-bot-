import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    const client = await clientPromise;
    const db = client.db('chatbotDB');
    const collection = db.collection('userDetails');
    
    const user = await collection.findOne({ _id: new ObjectId(id) });
    
    if (user) {
      res.json({ user });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error fetching user" });
  }
}
