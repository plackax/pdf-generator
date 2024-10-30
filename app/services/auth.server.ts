import { Authenticator, AuthorizationError } from "remix-auth";
import { login, sessionStorage } from "./session.server";
import type { User } from "@prisma/client";
import { FormStrategy } from "remix-auth-form";

const authenticator = new Authenticator<User>(sessionStorage);

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email")?.toString();
    const password = form.get("password")?.toString();

    if (!email || !password) {
      throw new AuthorizationError("Missing email or password.");
    }

    const user = await login({ email, password });

    if (user == null) {
      throw new AuthorizationError("Invalid email or password.");
    }

    return user;
  }),
  "user-pass"
);

export { authenticator };
