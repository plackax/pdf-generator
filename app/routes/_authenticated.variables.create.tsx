import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useToasts } from "~/components/toast";
import prisma from "~/services/prisma.server";

export async function loader() {
  const variables = await prisma.variable.findMany();
  return json({ variables });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const key = formData.get("key")?.toString();
  const type = formData.get("type")?.toString();

  const content = formData.get("content")?.toString();
  const variables = formData.getAll("variables");

  if (!key || !type || (type === "script" && !content)) {
    return json(
      { message: "All fields are required", hasError: true },
      { status: 400 }
    );
  }

  const existingVariable = await prisma.variable.findUnique({
    where: { key },
  });

  if (existingVariable) {
    return json(
      { message: "Variable already exists", hasError: true },
      { status: 400 }
    );
  }

  const variableCreated = await prisma.variable.create({
    data: {
      key,
      type,
      content,
    },
  });

  if (variables) {
    await prisma.value.createMany({
      data: variables.map((v) => ({
        idVariable: variableCreated.id,
        value: v.toString(),
      })),
    });
  }

  const registerAndContinue = formData.get("registerAndContinue");
  if (!registerAndContinue) {
    return json(
      { message: "Variable created", hasError: false },
      { status: 302, headers: { Location: "/variables/" + variableCreated.id } }
    );
  }

  return json({ message: "Variable created", hasError: false });
}

export default function AuthenticatedVariablesCreate() {
  const { variables } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { addToast } = useToasts();

  const [showContentField, setshowContentField] = useState(false);

  useEffect(() => {
    if (actionData?.message) {
      addToast(actionData.message, actionData.hasError ? "error" : "success");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  return (
    <>
      <h1 className="text-2xl flex items-center justify-between w-full">
        Add Variable
        <Link
          to="/variables"
          className="bg-black text-xs font-bold text-white h-6 w-24 flex rounded-md items-center justify-center"
        >
          Back
        </Link>
      </h1>
      <Form className="bg-white rounded-md p-4 shadow-md w-full" method="POST">
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="key"
              required
              placeholder="Variable name"
              className="w-full h-10 border border-slate-300 rounded-sm px-3"
            />
          </div>
          <div>
            <label htmlFor="name">Type</label>
            <select
              id="name"
              name="type"
              required
              className="w-full h-10 border border-slate-300 rounded-sm px-3"
              onChange={(e) => {
                setshowContentField(e.target.value === "variableSelector");
              }}
            >
              <option value="">Choose a variable type</option>
              <option value="selector">Selector</option>
              <option value="variableSelector">Variable Selector</option>
              <option value="condition">Condition</option>
            </select>
          </div>
          {showContentField ? (
            <div>
              <label htmlFor="variables">Variables</label>
              <select
                name="variables"
                id="variables"
                multiple
                className="w-full h-40 border border-slate-300 rounded-sm px-3"
              >
                {variables.map((variable) => (
                  <option key={variable.id} value={variable.key}>
                    {variable.key}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
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
