import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import prisma from "../services/prisma.server";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { useEffect, useState } from "react";
import { useToasts } from "~/components/toast";
import { Spinner } from "~/components/spinner";
import bcrypt from "bcrypt";

export async function loader({ params }: LoaderFunctionArgs) {
  const userId = params.userId;
  if (!userId) {
    throw new Error("User ID is required");
  }
  const userData = await prisma.user.findUniqueOrThrow({
    where: { id: Number(userId) },
    select: {
      id: true,
      name: true,
      role: true,
      email: true,
    },
  });

  return { userData };
}

export async function action({ params, request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const id = params.userId;
  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const role = formData.get("role")?.toString();
  const password = formData.get("password")?.toString();

  if (!id || !name || !email || !role) {
    return json(
      { message: "All fields are required", hasError: true },
      { status: 400 }
    );
  }

  const existingUserWithEmail = await prisma.user.findFirst({
    where: { email, id: { not: Number(id) } },
  });

  if (existingUserWithEmail) {
    return json(
      { message: "User with this email already exists", hasError: true },
      { status: 400 }
    );
  }

  const userToUpdate = await prisma.user.findUnique({
    where: { id: Number(id) },
  });

  if (!userToUpdate) {
    return json({ message: "User not found", hasError: true }, { status: 404 });
  }

  const data: Record<string, string> = {
    name,
    email,
    role,
  };

  if (password) {
    data.password = bcrypt.hashSync(password, 10);
  }

  await prisma.user.update({
    where: { id: Number(id) },
    data,
  });

  return json({ message: "User updated", hasError: false });
}

export default function AuthenticatedUsersIndex() {
  const { userData } = useLoaderData<typeof loader>();
  const { addToast } = useToasts();
  const fetcher = useFetcher<typeof action>();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [email, setEmail] = useState(userData.email);
  const [name, setName] = useState(userData.name);
  const [role, setRole] = useState(userData.role);

  useEffect(() => {
    if (fetcher.data?.message) {
      addToast(
        fetcher.data.message,
        fetcher.data.hasError ? "error" : "success"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.data]);

  return (
    <>
      <h1 className="text-2xl flex items-center justify-between w-full">
        Modifiy {userData.name}
        <Link
          to="/users"
          className="bg-black text-xs font-bold text-white h-6 w-24 flex rounded-md items-center justify-center"
        >
          Back
        </Link>
      </h1>
      <fetcher.Form
        className="bg-white rounded-md p-4 shadow-md w-full"
        method="POST"
      >
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="User name"
              className="w-full h-10 border border-slate-300 rounded-sm px-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="User email"
              className="w-full h-10 border border-slate-300 rounded-sm px-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              required
              className="w-full h-10 border border-slate-300 rounded-sm px-3"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">Choose a role</option>
              <option value="ADMIN">Admin</option>
              <option value="OPERATOR">Operator</option>
            </select>
          </div>
          <div>
            <div className="text-xl border-y border-black/5 py-3 mb-4">
              Change User Password
            </div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="User password"
              className="w-full h-10 border border-slate-300 rounded-sm px-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              placeholder="Confirm user password"
              className="w-full h-10 border border-slate-300 rounded-sm px-3"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="flex gap-6">
            <button
              name="justRegister"
              value="1"
              className="bg-black text-white h-10 w-full rounded-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={
                ((!!password || !!confirmPassword) &&
                  password !== confirmPassword) ||
                fetcher.state === "submitting" ||
                (userData.role === role &&
                  userData.email === email &&
                  userData.name === name &&
                  !password &&
                  !confirmPassword)
              }
            >
              {fetcher.state === "submitting" ? <Spinner /> : "Update"}
            </button>
          </div>
        </div>
      </fetcher.Form>
    </>
  );
}
