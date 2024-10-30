import { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { Sidebar } from "~/components/sidebarComponent";
import { ToastContainer, ToastProvider } from "~/components/toast";
import { useEffect, useRef, useState } from "react";
import { Spinner } from "~/components/spinner";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  return {
    user: {
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

export default function AuthenticatedLayout() {
  const [hydrated, setHydrated] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    divRef.current?.style.setProperty("opacity", "0");
    setTimeout(() => {
      setHydrated(true);
    }, 300);
  }, []);

  const { user } = useLoaderData<typeof loader>();

  if (!hydrated) {
    return (
      <div
        ref={divRef}
        className="flex flex-col text-white transition-all duration-300 text-xs gap-4 flex-1 h-dvh bg-[#1c1d20] items-center justify-center"
      >
        <Spinner />
        Loading contents
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-dvh bg-slate-100 flex items-start gap-6 text-sm overflow-x-hidden">
        <Sidebar user={user} />
        <div className="flex flex-col flex-1 py-6 pr-6 pl-72">
          <ToastContainer />
          <Outlet />
        </div>
      </div>
    </ToastProvider>
  );
}
