import {
  ArrowRightEndOnRectangleIcon,
  CogIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { Form, Link } from "@remix-run/react";

export function Sidebar({
  user,
}: {
  user: { email: string; name: string; role: string };
}) {
  return (
    <div className="bg-slate-950 w-64 h-full text-white p-4 fixed left-0 top-0">
      <nav className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 items-center bg-white/85 rounded-md text-black py-4 overflow-hidden px-4">
          <div className="w-14 h-14 bg-black rounded-full text-white p-3">
            <UserIcon />
          </div>
          <Link
            to="/profile"
            className="flex items-center text-sky-600 underline whitespace-nowrap"
          >
            {user.name} <CogIcon className="w-4 h-4" />
          </Link>
          <hr className="w-full h-[1px] bg-white/90" />
          <Form action="/logout" method="POST">
            <button
              type="submit"
              name="logout"
              className="flex items-center justify-center w-full gap-1"
            >
              Logout <ArrowRightEndOnRectangleIcon className="w-4 h-4" />
            </button>
          </Form>
        </div>
        <div>
          <h3 className="text-slate-600 mb-3 px-3 text-base">Sections</h3>
          <ul className="flex flex-col gap-2">
            {user.role === "ADMIN" ? (
              <>
                <li className="px-3 h-10 flex hover:bg-slate-600 transition-all rounded-sm">
                  <Link className="w-full flex items-center" to="/variables">
                    Variables
                  </Link>
                </li>
                <li className="bg-slate-700 w-full h-[1px]"></li>
                <li className="px-3 h-10 flex hover:bg-slate-600 transition-all rounded-sm">
                  <Link className="w-full flex items-center" to="/templates">
                    Templates
                  </Link>
                </li>
                <li className="bg-slate-700 w-full h-[1px]"></li>
                <li className="px-3 h-10 flex hover:bg-slate-600 transition-all rounded-sm">
                  <Link className="w-full flex items-center" to="/users">
                    Users
                  </Link>
                </li>
                <li className="bg-slate-700 w-full h-[1px]"></li>
              </>
            ) : null}
            <li className="px-3 h-10 flex hover:bg-slate-600 transition-all rounded-sm">
              <Link className="w-full flex items-center" to="/pdf-generator">
                PDF Generator
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}
