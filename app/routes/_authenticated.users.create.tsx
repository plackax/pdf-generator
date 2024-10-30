import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Spinner } from "~/components/spinner";
import { useToasts } from "~/components/toast";
import prisma from "~/services/prisma.server";
import bcrypt from "bcrypt";

export async function loader() {
  const variables = await prisma.variable.findMany();
  return json({ variables });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const role = formData.get("role")?.toString();
  const password = formData.get("password")?.toString();

  if (!name || !email || !role || !password) {
    return json(
      { message: "All fields are required", hasError: true },
      { status: 400 }
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return json(
      { message: "User already exists", hasError: true },
      { status: 400 }
    );
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      role,
      password: bcrypt.hashSync(password, 10),
    },
  });

  return json(
    { message: "User created", hasError: false },
    { status: 302, headers: { Location: "/users/" + user.id } }
  );
}

export default function AuthenticatedVariablesCreate() {
  const actionData = useActionData<typeof action>();
  const { addToast } = useToasts();
  const navigation = useNavigation();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (actionData?.message) {
      addToast(actionData.message, actionData.hasError ? "error" : "success");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  return (
    <>
      <h1 className="text-2xl flex items-center justify-between w-full">
        Add User
        <Link
          to="/users"
          className="bg-black text-xs font-bold text-white h-6 w-24 flex rounded-md items-center justify-center"
        >
          Back
        </Link>
      </h1>
      <Form className="bg-white rounded-md p-4 shadow-md w-full" method="POST">
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
            />
          </div>
          <div>
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              required
              className="w-full h-10 border border-slate-300 rounded-sm px-3"
            >
              <option value="">Choose a role</option>
              <option value="ADMIN">Admin</option>
              <option value="OPERATOR">Operator</option>
            </select>
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
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
              required
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
                !password ||
                !confirmPassword ||
                password !== confirmPassword ||
                navigation.state === "submitting"
              }
            >
              {navigation.state === "submitting" ? <Spinner /> : "Register"}
            </button>
          </div>
        </div>
      </Form>
    </>
  );
}
