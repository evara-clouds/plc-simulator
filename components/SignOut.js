"use client";
import { signOut } from "next-auth/react";
export default function SignOut() {
  return <button className="btn2" onClick={() => signOut({ callbackUrl: "/" })}>Sign out</button>;
}
