import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withClient } from "../mongodb";

const MAX_RETRIES = 5;
async function handle(req: VercelRequest, res: VercelResponse, attempt: number = 0) {
  try {
    const documents = await withClient(async (client) => {
      const db = client.db("sample_restaurants");
      const collection = db.collection("neighborhoods");
      return collection.find({}).limit(10).toArray();
    });

    return res.json(documents);
  } catch (error) {
    if (attempt < 5) {
      console.error('retrying after error: ', error);
      return await handle(req, res, attempt + 1);
    }
    console.error("Database connection error:", error);
    return res.status(500).json({
      error: "Failed to connect to database",
    });
  }
}
export default async function handler(req: VercelRequest, res: VercelResponse) {
  return await  handle(req, res, 0);
}
