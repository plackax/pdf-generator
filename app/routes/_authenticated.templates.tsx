import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  if (user.role !== "ADMIN") {
    throw redirect("/");
  }

  return null;
}

export default function AuthenticatedTemplates() {
  return (
    <div className="h-dvh bg-slate-100 flex items-start gap-6 text-sm flex-1 flex-col">
      <Outlet />
    </div>
  );
}
