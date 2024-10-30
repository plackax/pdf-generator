import { createCookieSessionStorage, redirect } from "@remix-run/node";
import bcrypt from "bcrypt";
import prisma from "./prisma.server";

export type LoginForm = {
  email: string;
  password: string;
};

export type RegisterForm = LoginForm & {
  name: string;
};

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: ["s3cr3t"],
    secure: process.env.NODE_ENV === "production",
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;

export async function register({ email, name, password }: RegisterForm) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: { email, password: passwordHash, name, role: "USER" },
  });
}

export async function login({ email, password }: LoginForm) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const isCorrectPassword = await bcrypt.compare(password, user.password);
  if (!isCorrectPassword) return null;
  return user;
}

export async function logout(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/login", {
    headers: { "Set-Cookie": await destroySession(session) },
  });
}
