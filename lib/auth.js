import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { prisma } from "./prisma";

export const authOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      credentials: { email: {}, password: {} },
      async authorize(c) {
        const u = await prisma.user.findUnique({ where: { email: (c?.email || "").toLowerCase() } });
        if (!u || !(await bcrypt.compare(c.password || "", u.password))) return null;
        return { id: u.id, name: u.name, email: u.email, type: u.accountType };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) { if (user) { token.id = user.id; token.type = user.type; } return token; },
    session({ session, token }) { session.user.id = token.id; session.user.type = token.type || "student"; return session; },
  },
};
export const getUser = async () => (await getServerSession(authOptions))?.user || null;
