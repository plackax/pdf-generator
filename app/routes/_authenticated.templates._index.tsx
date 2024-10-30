import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import prisma from "../services/prisma.server";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { convertTinyMceHtmlToPdf } from "~/services/pdf.server";
import { useEffect } from "react";
import { Spinner } from "~/components/spinner";

export async function loader() {
  const templates = await prisma.template.findMany();
  return { templates };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const preview = formData.get("preview");
  const templateId = Number(preview);
  if (isNaN(templateId)) {
    return json(
      { message: "Invalid template id", hasError: true, pdfBuffer: null },
      { status: 400 }
    );
  }

  const template = await prisma.template.findUnique({
    where: { id: templateId },
  });

  if (!template) {
    return json(
      { message: "Template not found", hasError: true, pdfBuffer: null },
      { status: 404 }
    );
  }

  const pdfBuffer = await convertTinyMceHtmlToPdf(template);

  return json({
    pdfBuffer: Buffer.from(pdfBuffer).toString("base64"),
    hasError: false,
    message: "PDF generated",
  });
}

export const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
};

export default function AuthenticatedVariablesIndex() {
  const { templates } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  useEffect(() => {
    if (fetcher.data?.pdfBuffer) {
      const byteData = base64ToUint8Array(fetcher.data.pdfBuffer);
      const blob = new Blob([byteData], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "template.pdf";
      a.click();
    }
  }, [fetcher.data]);

  return (
    <>
      <h1 className="text-2xl flex items-center justify-between w-full">
        Templates
        <Link
          to="/templates/create"
          className="bg-black text-xs font-bold text-white h-6 w-24 flex rounded-md items-center justify-center"
        >
          Add template
        </Link>
      </h1>
      <div className="w-full flex-1 overflow-auto max-h-[calc(100dvh-6.5rem)]">
        <table className="table-auto min-w-full text-left text-sm font-light text-surface dark:text-white bg-white rounded-md shadow-md">
          <thead className="border-b border-neutral-200 font-medium dark:border-white/10">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((template) => (
              <tr
                key={template.id}
                className="border-b border-neutral-200 dark:border-white/10"
              >
                <td className="whitespace-nowrap px-6 py-4">{template.name}</td>
                <td className="whitespace-nowrap px-6 py-2 text-right flex items-center justify-end gap-4">
                  <fetcher.Form method="post">
                    <button
                      name="preview"
                      value={template.id}
                      disabled={fetcher.state !== "idle"}
                      className="bg-black flex items-center justify-center rounded-md text-white shadow-md px-3 py-1 disabled:bg-gray-600"
                    >
                      {fetcher.state !== "idle" ? <Spinner /> : "Preview"}
                    </button>
                  </fetcher.Form>
                  <Link
                    className="bg-black rounded-md text-white shadow-md px-3 py-1"
                    to={`/templates/${template.id}/edit`}
                  >
                    Edit
                  </Link>
                  {/*
                  <Link
                    className="bg-black rounded-md text-white shadow-md px-3 py-1"
                    to={`/templates/${template.id}`}
                  >
                    Preview
                  </Link>
                  <Link
                    className="bg-black rounded-md text-white shadow-md px-3 py-1"
                    to={`/variables/${variable.id}/edit`}
                  >
                    Edit
                  </Link>
                  <Link
                    className="bg-black rounded-md text-white shadow-md px-3 py-1"
                    to={`/variables/${variable.id}/edit`}
                  >
                    Delete
                  </Link>*/}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
