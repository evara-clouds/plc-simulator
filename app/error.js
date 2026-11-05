"use client";
export default function Error({ reset }) {
  return (
    <div className="mx-auto mt-16 max-w-md space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-6 text-center">
      <h1 className="text-xl font-bold text-cyan-400">Something went wrong</h1>
      <p className="text-sm text-slate-400">The service may be waking up or busy. Please try again in a moment.</p>
      <button className="btn" onClick={() => reset()}>Try again</button>
    </div>
  );
}
