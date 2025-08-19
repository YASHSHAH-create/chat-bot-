import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log("🟢 Received feedback update request:", req.body);
  const { number, feedback } = req.body;

  if (!number) {
    return res.status(400).json({ message: "Error: Missing 'number' in request" });
  }
  if (feedback === undefined) {
    return res.status(400).json({ message: "Error: Missing 'feedback'" });
  }

  try {
    const client = await clientPromise;
    const db = client.db('chatbotDB');
    const collection = db.collection('userDetails');
    
    const result = await collection.updateOne(
      { number: number },
      { $set: { feedback: feedback } }
    );

    if (result.matchedCount === 0) {
      console.log("⚠️ No matching document found for number:", number);
      return res.status(404).json({ message: "No matching user found." });
    } else if (result.modifiedCount === 0) {
      console.log("ℹ️ Document matched but nothing changed (same values)");
    } else {
      console.log("✅ Feedback updated successfully for number:", number);
    }
    res.json({ message: "Feedback updated successfully." });
  } catch (err) {
    console.error("Error updating feedback:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
