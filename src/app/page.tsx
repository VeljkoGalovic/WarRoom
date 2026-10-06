import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100 font-sans p-6">
      <div className="max-w-md w-full bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-8 shadow-2xl text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 font-bold text-xl mb-4 border border-amber-500/20">
          WR
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          WAR ROOM
        </h1>
        <p className="text-sm text-slate-400 mb-8">
          Tactical Command & Orchestration Platform
        </p>
        
        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="flex items-center justify-center w-full py-3 px-4 bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold rounded-xl transition shadow-lg shadow-amber-600/20"
          >
            Enter Command Dashboard
          </Link>
          <Link
            href="/auth/signin"
            className="flex items-center justify-center w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition border border-slate-700/50"
          >
            Sign In / Authentication
          </Link>
        </div>
      </div>
      <p className="mt-8 text-xs text-slate-600 font-mono">
        SYSTEM OPERATIONAL // PORT 3000
      </p>
    </div>
  );
}
