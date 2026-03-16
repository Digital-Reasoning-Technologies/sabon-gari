import mongoose from "mongoose";
import User from '@/lib/models/user';
import { hashPassword } from '@/lib/auth';

let isConnected = false;

/** True if MONGODB_URI is set (avoids throwing in API routes when env is missing). */
export function isDbConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI);
}

const ensureSuperadmin = async () => {
  const emailRaw = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;

  if (!emailRaw || !password) return;

  const email = emailRaw.toLowerCase().trim();

  const existingSuperadmin = await User.findOne({ role: 'superadmin' }).lean().exec();
  if (existingSuperadmin) return;

  const existingEmail = await User.findOne({ email }).lean().exec();
  if (existingEmail) return;

  const passwordHash = await hashPassword(password);
  await User.create({ email, passwordHash, role: 'superadmin' });
  console.log('Superadmin bootstrapped:', email);
};

export const connectDB = async () => {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/5ae3dc11-cd75-4fff-a2a4-798b349edd4c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/mongodb.ts:26',message:'connectDB entry',data:{isConnected,hasMongoUri:!!process.env.MONGODB_URI,mongoUriFormat:process.env.MONGODB_URI?.substring(0,20)+'...'||'missing',mongoUriLength:process.env.MONGODB_URI?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  const MONGODB_URI = process.env.MONGODB_URI as string;

  if (!MONGODB_URI) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/5ae3dc11-cd75-4fff-a2a4-798b349edd4c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/mongodb.ts:30',message:'MONGODB_URI missing',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    throw new Error("⚠️ Please add MONGODB_URI to .env");
  }

  if (isConnected) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/5ae3dc11-cd75-4fff-a2a4-798b349edd4c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/mongodb.ts:33',message:'Already connected, returning early',data:{isConnected},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    return;
  }

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/5ae3dc11-cd75-4fff-a2a4-798b349edd4c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/mongodb.ts:35',message:'Starting connection attempt',data:{mongoUriStartsWith:MONGODB_URI.substring(0,15),isSrv:MONGODB_URI.includes('mongodb+srv://')},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  try {
    // Check if already connected via mongoose
    if (mongoose.connection.readyState === 1) {
      isConnected = true;
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/5ae3dc11-cd75-4fff-a2a4-798b349edd4c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/mongodb.ts:49',message:'Already connected via mongoose',data:{readyState:mongoose.connection.readyState,host:mongoose.connection.host},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      return;
    }

    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true,
    });
    
    // mongoose.connect() resolves when connection is ready
    // During parallel builds, readyState might be 2 (connecting) temporarily,
    // but mongoose will handle queries properly once connection is established
    isConnected = true;
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/5ae3dc11-cd75-4fff-a2a4-798b349edd4c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/mongodb.ts:62',message:'Connection successful',data:{host:mongoose.connection.host,readyState:mongoose.connection.readyState,isConnected},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    console.log("MongoDB Connected:", mongoose.connection.host);

    try {
      await ensureSuperadmin();
    } catch (e) {
      console.error('Failed to bootstrap superadmin:', e);
    }
  } catch (error) {
    isConnected = false;
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/5ae3dc11-cd75-4fff-a2a4-798b349edd4c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/mongodb.ts:72',message:'Connection error caught, will re-throw',data:{errorName:error instanceof Error?error.name:'unknown',errorMessage:error instanceof Error?error.message:String(error),errorCode:(error as any)?.code,errorSyscall:(error as any)?.syscall,errorHostname:(error as any)?.hostname,isConnected},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    console.error("MongoDB connection error:", error);
    // Re-throw the error so API routes can handle it properly
    throw error;
  }
};
