import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log("Received /submit request with body:", req.body);
    const data = req.body;
    data.timestamp = new Date();
    
    const client = await clientPromise;
    const db = client.db('chatbotDB');
    const collection = db.collection('userDetails');
    
    const result = await collection.insertOne(data);
    
    console.log("MongoDB insert successful, insertedId:", result.insertedId);

    res.json({ 
      message: "Thank you! Your details have been saved.",
      userId: result.insertedId 
    });
  } catch (err) {
    console.error("Error in /submit endpoint:", err);
    res.status(500).json({ message: "Error saving details" });
  }
}
