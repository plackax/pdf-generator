import { Outlet } from "@remix-run/react";

export default function AuthenticatedTemplatesTemplateIdIndex() {
  return (
    <div className="h-dvh bg-slate-100 flex items-start gap-6 text-sm flex-1 flex-col">
      <Outlet />
    </div>
  );
}
