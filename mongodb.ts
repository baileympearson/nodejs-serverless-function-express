import { ClientSession, MongoClient, MongoClientOptions } from "mongodb";
import { attachDatabasePool } from "@vercel/functions";

const uri = process.env.MONGODB_URI!;
const options: MongoClientOptions = {
  maxIdleTimeMS: 5000,
  // timeoutMS: 5000
};

let client: MongoClient = new MongoClient(uri, options);
// Attach the client to ensure proper cleanup on function suspension
attachDatabasePool(client);


export async function withClient<T>(callback: (client: MongoClient) => Promise<T>): Promise<T> {
  return await callback(client);
}

export async function withSession<T>(callback: (client: ClientSession) => Promise<T>): Promise<T> {
  const session = client.startSession();
  try {
    return await callback(session);
  } finally {
    session.endSession();
  }
}
