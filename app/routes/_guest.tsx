import { Outlet } from "@remix-run/react";

export default function GuestLayout() {
  return (
    <div className="h-dvh bg-slate-100 flex flex-col gap-6 items-center justify-center">
      <Outlet />
    </div>
  );
}
