import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { commitSession, getSession } from "~/services/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });

  const session = await getSession(request.headers.get("Cookie"));
  const error = session.get(authenticator.sessionErrorKey);

  return json(
    { error },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
}

export async function action({ context, request }: ActionFunctionArgs) {
  return await authenticator.authenticate("user-pass", request, {
    successRedirect: "/",
    failureRedirect: "/login",
    context,
    throwOnError: true,
  });
}

export default function Login() {
  const { error } = useLoaderData<typeof loader>();

  return (
    <Form method="post" className="flex flex-col gap-3">
      {error ? (
        <div className="text-red-500 text-center">{error.message}</div>
      ) : null}

      <input
        type="email"
        name="email"
        placeholder="Email"
        required
        className="min-w-72 h-10 px-3 rounded-md ring-slate-600 ring-1 placeholder:text-slate-900"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        autoComplete="current-password"
        required
        className="min-w-72 h-10 px-3 rounded-md ring-slate-600 ring-1 placeholder:text-slate-900"
      />
      <button className="w-full bg-slate-900 h-10 px-3 text-white rounded-md">
        Sign In
      </button>
    </Form>
  );
}
