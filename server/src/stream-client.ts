import { StreamClient } from "@stream-io/node-sdk";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.STREAM_API_KEY;
const secret = process.env.STREAM_SECRET;

console.log('API Key:', apiKey); // Debug log
console.log('Secret length:', secret?.length); // Debug log

if (!apiKey || !secret) {
  throw new Error("STREAM_API_KEY and STREAM_SECRET must be set in environment variables");
}

export const client = new StreamClient(apiKey, secret);