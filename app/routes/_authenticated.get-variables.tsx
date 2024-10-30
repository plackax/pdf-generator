import { ActionFunctionArgs, json } from "@remix-run/node";
import prisma from "~/services/prisma.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const getValuesFromVariable = formData
    .get("getValuesFromVariable")
    ?.toString();

  if (getValuesFromVariable) {
    const variableData = await prisma.variable.findUniqueOrThrow({
      where: { key: getValuesFromVariable },
      include: { values: true },
    });

    return json({ variableData });
  }
}
