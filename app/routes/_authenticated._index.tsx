import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  return await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
}

export default function Index() {
  const user = useLoaderData<typeof loader>();

  return (
    <div className="text-2xl">
      <span>Welcome, {user.name}</span>
    </div>
  );
}
