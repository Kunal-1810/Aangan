import mongoose from 'mongoose';

// Cache the connection so warm serverless invocations reuse it.
const cache = globalThis._mongoose || (globalThis._mongoose = { conn: null, promise: null });

export async function connectDB() {
  if (cache.conn) return cache.conn;
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set');
  cache.promise ||= mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
  cache.conn = await cache.promise;
  return cache.conn;
}
