import mongoose from "mongoose";

let cached = (global as any).mongooseRoot;

if (!cached) {
    cached = (global as any).mongooseRoot = { conn: null, promise: null };
}

export async function connectRootDB() {
    console.log(">>> connectRootDB called");

    if (cached.conn) {
        console.log(">>> Using cached root connection");
        return cached.conn;
    }

    const MONGODB_URI = process.env.MONGODB_URI as string;
    console.log(">>> MONGODB_URI =", MONGODB_URI);

    if (!MONGODB_URI) {
        throw new Error("Please define MONGODB_URI");
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI).then((m) => m);
    }

    cached.conn = await cached.promise;
    console.log(">>> Root connection established");
    return cached.conn;
}