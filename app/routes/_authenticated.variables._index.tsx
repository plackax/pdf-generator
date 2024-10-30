import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import prisma from "../services/prisma.server";
import { EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ActionFunctionArgs, json } from "@remix-run/node";

export async function loader() {
  const variables = await prisma.variable.findMany();
  return { variables };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const id = formData.get("id")?.toString();

  if (!id) {
    return json(
      { message: "All fields are required", hasError: true },
      { status: 400 }
    );
  }

  await prisma.value.deleteMany({
    where: { idVariable: parseInt(id) },
  });

  await prisma.variable.delete({
    where: { id: parseInt(id) },
  });

  return json(
    { message: "Variable deleted", hasError: false },
    { status: 302, headers: { Location: "/variables" } }
  );
}

export default function AuthenticatedVariablesIndex() {
  const { variables } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  return (
    <>
      <h1 className="text-2xl flex items-center justify-between w-full">
        Variables
        <Link
          to="/variables/create"
          className="bg-green-900 text-xs font-bold text-white h-6 w-24 flex rounded-md items-center justify-center"
        >
          Add variable
        </Link>
      </h1>
      <div className="w-full flex-1 overflow-auto max-h-[calc(100dvh-6.5rem)]">
        <table className="table-auto min-w-full text-left text-sm font-light text-surface dark:text-white bg-white rounded-md shadow-md">
          <thead className="border-b border-neutral-200 font-medium dark:border-white/10">
            <tr>
              <th className="px-6 py-4">Key</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {variables.map((variable) => (
              <tr
                key={variable.id}
                className="border-b border-neutral-200 dark:border-white/10"
              >
                <td className="whitespace-nowrap px-6 py-4">{variable.key}</td>
                <td className="whitespace-nowrap px-6 py-2 text-right flex items-center justify-end gap-3">
                  <Link
                    className="bg-blue-900 rounded-md text-white shadow-md px-3 py-1 h-8 flex items-center justify-center"
                    to={`/variables/${variable.id}`}
                  >
                    <EyeIcon className="w-4 h-4" />
                  </Link>
                  <fetcher.Form
                    className=" bg-red-900 rounded-md text-white shadow-md px-3 py-1 h-8 items-center justify-center flex"
                    method="DELETE"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (confirm("Are you sure you want to delete this?")) {
                        fetcher.submit(e.currentTarget);
                      }
                    }}
                  >
                    <input type="hidden" name="id" value={variable.id} />
                    <button
                      type="submit"
                      className="flex items-center justify-center w-full h-full"
                      disabled={fetcher.state === "submitting"}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </fetcher.Form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
