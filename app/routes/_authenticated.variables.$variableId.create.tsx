import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { useToasts } from "~/components/toast";
import prisma from "~/services/prisma.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const variableId = Number(params.variableId);
  if (isNaN(variableId)) {
    throw new Error("Invalid variable id");
  }
  const variable = await prisma.variable.findUniqueOrThrow({
    where: { id: variableId },
  });

  return { variable };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const value = formData.get("value")?.toString();
  const idVariable = Number(params.variableId);
  if (isNaN(idVariable)) {
    return json(
      { message: "Invalid variable id", hasError: true },
      { status: 400 }
    );
  }

  if (!value) {
    return json(
      { message: "Value is required", hasError: true },
      { status: 400 }
    );
  }

  const existingValue = await prisma.value.findUnique({
    where: {
      idVariable_value: {
        value,
        idVariable,
      },
    },
  });

  if (existingValue) {
    return json(
      { message: "Value already exists", hasError: true },
      { status: 400 }
    );
  }

  await prisma.value.create({
    data: {
      value,
      idVariable,
    },
  });

  const registerAndContinue = formData.get("registerAndContinue");
  if (!registerAndContinue) {
    return json(
      { message: "Value created", hasError: false },
      { status: 302, headers: { Location: `/variables/${idVariable}` } }
    );
  }

  return json({ message: "Value created", hasError: false });
}

export default function AuthenticatedVariablesValueCreate() {
  const { variable } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { addToast } = useToasts();

  useEffect(() => {
    if (actionData?.message) {
      addToast(actionData.message, actionData.hasError ? "error" : "success");
    }
  }, [actionData]);

  return (
    <>
      <h1 className="text-2xl flex items-center justify-between w-full">
        Add Value
        <Link
          to={`/variables/${variable.id}`}
          className="bg-black text-xs font-bold text-white h-6 w-24 flex rounded-md items-center justify-center"
        >
          Back
        </Link>
      </h1>
      <Form className="bg-white rounded-md p-4 shadow-md w-full" method="POST">
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="name">Value</label>
            <input
              type="text"
              id="name"
              name="value"
              required
              className="w-full h-10 border border-slate-300 rounded-sm px-3"
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
