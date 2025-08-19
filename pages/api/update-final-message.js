import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { number, finalMessage } = req.body;
    
    const client = await clientPromise;
    const db = client.db('chatbotDB');
    const collection = db.collection('userDetails');
    
    const result = await collection.updateOne(
      { number: number },
      { $set: { finalMessage: finalMessage, modified_at: new Date() } }
    );
    
    if (result.modifiedCount > 0) {
      res.json({ message: "Final message updated" });
    } else {
      res.status(404).json({ message: "No matching user found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error updating message" });
  }
}
