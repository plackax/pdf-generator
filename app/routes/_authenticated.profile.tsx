import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { authenticator } from "~/services/auth.server";
import prisma from "~/services/prisma.server";
import { commitSession, getSession } from "~/services/session.server";
import bcrypt from "bcrypt";
import { useToasts } from "~/components/toast";
import { Spinner } from "~/components/spinner";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  return json({
    user: {
      email: user.email,
      name: user.name,
    },
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const formData = await request.formData();
  const updateprofile = formData.get("updateprofile")?.toString();
  const updatepassword = formData.get("updatepassword")?.toString();

  if (updateprofile) {
    const email = formData.get("email")?.toString();
    const name = formData.get("name")?.toString();

    if (!email || !name) {
      return json({ message: "All fields are required", hasError: true });
    }

    const updatedUser = await prisma.user.update({
      where: { email: user.email },
      data: { name, email },
    });

    const session = await getSession(request.headers.get("Cookie"));
    session.set(authenticator.sessionKey, updatedUser);

    const headers = new Headers({ "Set-Cookie": await commitSession(session) });

    return json(
      {
        message: "Profile updated",
        hasError: false,
      },
      {
        headers,
      }
    );
  }

  if (updatepassword) {
    const current_password = formData.get("current_password")?.toString();
    const new_password = formData.get("new_password")?.toString();

    if (!current_password || !new_password) {
      return json({ message: "All fields are required", hasError: true });
    }

    const arePasswordEqual = await bcrypt.compare(
      current_password,
      user.password
    );

    if (!arePasswordEqual) {
      return json({ message: "Invalid current password", hasError: true });
    }

    const hashedPassword = bcrypt.hashSync(new_password, 10);

    await prisma.user.update({
      where: { email: user.email },
      data: { password: hashedPassword },
    });

    return json({ message: "Password updated", hasError: false });
  }

  return json({ message: null, hasError: true });
}

export default function AuthenticatedProfile() {
  const { user } = useLoaderData<typeof loader>();
  const profileFetcher = useFetcher<typeof action>();
  const passwordFetcher = useFetcher<typeof action>();

  const { addToast } = useToasts();

  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [actualPassword, setActualPassword] = useState("");
  const [fullName, setFullName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  useEffect(() => {
    if (profileFetcher.data?.message) {
      addToast(
        profileFetcher.data.message,
        profileFetcher.data.hasError ? "error" : "success"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileFetcher.data]);

  useEffect(() => {
    if (passwordFetcher.data?.message) {
      addToast(
        passwordFetcher.data.message,
        passwordFetcher.data.hasError ? "error" : "success"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passwordFetcher.data]);

  return (
    <div className="h-dvh bg-slate-100 flex items-start gap-6 text-sm flex-1 flex-col">
      <h1 className="text-2xl flex items-center justify-between w-full">
        Manager your profile information here
      </h1>
      <div className="flex flex-row w-full gap-4">
        <profileFetcher.Form
          className="bg-white rounded-md p-4 shadow-md flex-1 flex flex-col gap-4 justify-between"
          method="POST"
        >
          <div className="flex flex-col gap-4">
            <h2 className="font-bold text-xl">Personal Information</h2>
            <div>
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full h-10 border border-slate-300 rounded-sm px-3"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="name">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full h-10 border border-slate-300 rounded-sm px-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-6">
            <button
              name="updateprofile"
              value="1"
              className="bg-black text-white h-10 w-full flex items-center justify-center rounded-sm disabled:bg-black/50 disabled:cursor-not-allowed"
              disabled={
                !email ||
                !fullName ||
                !(email !== user.email || fullName !== user.name) ||
                profileFetcher.state === "submitting"
              }
            >
              {profileFetcher.state === "submitting" ? (
                <Spinner />
              ) : (
                "Update Personal Information"
              )}
            </button>
          </div>
        </profileFetcher.Form>
        <passwordFetcher.Form
          className="bg-white rounded-md p-4 shadow-md flex-1 flex flex-col gap-4 justify-between"
          method="POST"
        >
          <div className="flex flex-col gap-4">
            <h2 className="font-bold text-xl">Password Change</h2>
            <div>
              <label htmlFor="current_password">Current Password</label>
              <input
                type="password"
                id="current_password"
                name="current_password"
                required
                className="w-full h-10 border border-slate-300 rounded-sm px-3"
                value={actualPassword}
                onChange={(e) => setActualPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="new_password">New Password</label>
              <input
                type="password"
                id="new_password"
                name="new_password"
                required
                className="w-full h-10 border border-slate-300 rounded-sm px-3"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="repeat_password">Repeat New Password</label>
              <input
                type="password"
                id="repeat_password"
                required
                className="w-full h-10 border border-slate-300 rounded-sm px-3"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-6">
            <button
              name="updatepassword"
              value="1"
              className="bg-black text-white flex justify-center items-center h-10 w-full rounded-sm disabled:bg-black/50 disabled:cursor-not-allowed"
              disabled={
                password !== repeatPassword ||
                !password ||
                !repeatPassword ||
                !actualPassword ||
                passwordFetcher.state === "submitting"
              }
            >
              {passwordFetcher.state === "submitting" ? (
                <Spinner />
              ) : (
                "Update Password"
              )}
            </button>
          </div>
        </passwordFetcher.Form>
      </div>
    </div>
  );
}
