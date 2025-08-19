import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { user_id } = req.query;
    
    const client = await clientPromise;
    const db = client.db('chatbotDB');
    const chat_collection = db.collection('chatMessages');
    
    const messages = await chat_collection
      .find({ user_id: user_id })
      .sort({ timestamp: 1 })
      .toArray();
      
    const formatted = messages.map(msg => ({
      sender: msg.sender,
      text: msg.text,
      timestamp: msg.timestamp.toISOString()
    }));
    
    res.json({ messages: formatted });
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages" });
  }
}
