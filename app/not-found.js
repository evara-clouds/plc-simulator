import Link from "next/link";
export default function NotFound() {
  return (
    <div className="mx-auto mt-16 max-w-md space-y-3 text-center">
      <h1 className="text-xl font-bold text-cyan-400">Page not found</h1>
      <Link href="/problems" className="btn inline-block">Go to Problems</Link>
    </div>
  );
}
