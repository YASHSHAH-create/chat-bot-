import { MongoClient } from 'mongodb';

if (!process.env.MONGO_USER || !process.env.MONGO_PASS || !process.env.MONGO_CLUSTER) {
  throw new Error('Please define the MongoDB environment variables');
}

const username = process.env.MONGO_USER;
const password = encodeURIComponent(process.env.MONGO_PASS);
const cluster = process.env.MONGO_CLUSTER;
const uri = `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority&appName=EvaChatbot`;

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
