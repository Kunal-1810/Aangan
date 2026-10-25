import mongoose from 'mongoose';

// Cache the connection so warm serverless invocations reuse it.
const cache = globalThis._mongoose || (globalThis._mongoose = { conn: null, promise: null });

export async function connectDB() {
  if (cache.conn) return cache.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, { bufferCommands: false })
      .catch((err) => {
        cache.promise = null; // allow retry on next request
        throw err;
      });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}