import type { Variable } from "@prisma/client";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import TemplateEditor from "~/components/editor";
import { useToasts } from "~/components/toast";
import prisma from "~/services/prisma.server";
import { defaultHeader, defaultFooter } from "../../prisma/default-template";

export async function loader() {
  const variables = await prisma.variable.findMany();
  return { variables };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get("name")?.toString();
  const fullContent = formData.get("content")?.toString();
  const header = formData.get("header")?.toString();
  const footer = formData.get("footer")?.toString();
  const body = formData.get("body")?.toString();

  if (!name || !fullContent) {
    return json(
      { message: "All fields are required", hasError: true },
      { status: 400 }
    );
  }

  await prisma.template.create({
    data: {
      name,
      fullContent,
      header,
      footer,
      body,
    },
  });

  const registerAndContinue = formData.get("registerAndContinue");
  if (!registerAndContinue) {
    return json(
      { message: "Template created", hasError: false },
      { status: 302, headers: { Location: "/templates" } }
    );
  }

  return json({ message: "Template created", hasError: false });
}

export default function AuthenticatedTemplatesCreate() {
  const actionData = useActionData<typeof action>();
  const { variables } = useLoaderData<typeof loader>();
  const { addToast } = useToasts();

  const [header, setHeader] = useState("");
  const [content, setContent] = useState("");
  const [footer, setFooter] = useState("");
  const [fullContent, setFullContent] = useState("");

  useEffect(() => {
    let fullContent = "";
    if (header) {
      fullContent += header;
    }
    if (content) {
      fullContent += content;
    }
    if (footer) {
      fullContent += footer;
    }

    setFullContent(fullContent);
  }, [header, content, footer]);

  useEffect(() => {
    if (actionData?.message) {
      addToast(actionData.message, actionData.hasError ? "error" : "success");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  return (
    <>
      <h1 className="text-2xl flex items-center max-w-[868px] justify-between w-full">
        Add Template
        <Link
          to="/templates"
          className="bg-black text-xs font-bold text-white h-6 w-24 flex rounded-md items-center justify-center"
        >
          Back
        </Link>
      </h1>
      <Form
        className="bg-white rounded-md p-4 shadow-md w-full max-w-[868px]"
        method="POST"
      >
        <input type="hidden" name="content" value={fullContent} />
        <input type="hidden" name="header" value={header} />
        <input type="hidden" name="footer" value={footer} />
        <input type="hidden" name="body" value={content} />
        <div className="flex flex-col gap-4 max-h-[calc(100dvh-8.5rem)] overflow-auto">
          <div>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full h-10 border border-slate-300 rounded-sm px-3"
            />
          </div>
          <div className="flex flex-col gap-6">
            <label htmlFor="content">Content</label>
            <span className="-mb-4">Header</span>
            <TemplateEditor
              id="header-editor"
              height={250}
              onChange={setHeader}
              initValue={defaultHeader}
            />
            <span className="-mb-4">Content</span>
            <TemplateEditor
              id="content-editor"
              height={500}
              onChange={setContent}
              variables={variables as unknown as Variable[]}
            />
            <span className="-mb-4">Footer</span>
            <TemplateEditor
              id="footer-editor"
              height={250}
              onChange={setFooter}
              initValue={defaultFooter}
            />
          </div>
          <div className="flex gap-6">
            <button
              name="justRegister"
              value="1"
              className="bg-black text-white h-10 w-full rounded-sm"
            >
              Register
            </button>
            <button
              name="registerAndContinue"
              value="1"
              className=" bg-green-900 text-white h-10 w-full rounded-sm"
            >
              Register and continue
            </button>
          </div>
        </div>
      </Form>
    </>
  );
}
