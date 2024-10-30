import type { Variable } from "@prisma/client";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import TemplateEditor from "~/components/editor";
import { useToasts } from "~/components/toast";
import prisma from "~/services/prisma.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const templateId = params.templateId;
  if (!templateId) {
    throw new Error("Template ID is required");
  }
  const template = await prisma.template.findUnique({
    where: { id: Number(templateId) },
  });

  if (!template) {
    throw new Error("Template not found");
  }

  const variables = await prisma.variable.findMany();

  return { template, variables };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const templateId = params.templateId;
  if (!templateId) {
    return json(
      { message: "Template ID is required", hasError: true },
      { status: 400 }
    );
  }

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

  await prisma.template.update({
    where: { id: Number(templateId) },
    data: {
      name,
      fullContent,
      header,
      footer,
      body,
    },
  });

  return json(
    { message: "Template modified", hasError: false },
    { status: 302, headers: { Location: "/templates" } }
  );
}

export default function AuthenticatedTemplatesTemplateIdEdit() {
  const { template, variables } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const { addToast } = useToasts();

  const [header, setHeader] = useState(template.header);
  const [content, setContent] = useState(template.body);
  const [footer, setFooter] = useState(template.footer);
  const [fullContent, setFullContent] = useState(template.fullContent);

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
        <input type="hidden" name="header" value={header || ""} />
        <input type="hidden" name="footer" value={footer || ""} />
        <input type="hidden" name="body" value={content || ""} />
        <div className="flex flex-col gap-4 max-h-[calc(100dvh-8.5rem)] overflow-auto">
          <div>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              defaultValue={template.name}
              className="w-full h-10 border border-slate-300 rounded-sm px-3"
            />
          </div>
          <div className="flex flex-col gap-6">
            <label htmlFor="content">Content</label>
            <span className="-mb-4">Header</span>
            <TemplateEditor
              id="header-editor"
              initValue={template.header || ""}
              height={250}
              onChange={setHeader}
            />
            <span className="-mb-4">Content</span>
            <TemplateEditor
              id="content-editor"
              initValue={template.body || ""}
              height={500}
              variables={variables as unknown as Variable[]}
              onChange={setContent}
            />
            <span className="-mb-4">Footer</span>
            <TemplateEditor
              id="footer-editor"
              initValue={template.footer || ""}
              height={250}
              onChange={setFooter}
            />
          </div>
          <div className="flex gap-6">
            <button
              name="justRegister"
              value="1"
              className="bg-black text-white h-10 w-full rounded-sm"
            >
              Save changes
            </button>
          </div>
        </div>
      </Form>
    </>
  );
}
