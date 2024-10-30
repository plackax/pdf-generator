import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import prisma from "../services/prisma.server";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { useEffect, useRef, useState } from "react";
import {
  MinusIcon,
  PlusCircleIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import type { Value } from "@prisma/client";
import { useToasts } from "~/components/toast";
import { Spinner } from "~/components/spinner";

export async function loader({ params }: LoaderFunctionArgs) {
  const variableId = params.variableId;
  if (!variableId) {
    throw new Error("Variable ID is required");
  }
  const variableWithValues = await prisma.variable.findUniqueOrThrow({
    where: { id: Number(variableId) },
    include: { values: true },
  });

  const variables = await prisma.variable.findMany({
    where: { id: { not: Number(variableId) } },
  });

  return { variableWithValues, variables };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();

  const variableId = params.variableId;
  const key = formData.get("key")?.toString();
  const type = formData.get("type")?.toString();
  const values = formData.get("values")?.toString();
  const variables = formData.getAll("variables");

  if (!key || !type) {
    return json({
      message: "All fields are required",
      hasError: true,
    });
  }

  const valuesArray = JSON.parse(values || "[]");

  const existingVariable = await prisma.variable.findFirst({
    where: { key, id: { not: Number(variableId) } },
  });

  if (existingVariable) {
    return json({
      message: "Variable already exists",
      hasError: true,
    });
  }

  if (valuesArray.length || variables.length) {
    await prisma.value.deleteMany({
      where: { idVariable: Number(variableId) },
    });
  }

  if (valuesArray.length && type === "selector") {
    await prisma.variable.update({
      where: { id: Number(variableId) },
      data: {
        key,
        type,
      },
    });

    await prisma.value.createMany({
      data: valuesArray.map((v: Value) => ({
        idVariable: Number(variableId),
        value: v.value,
        metadata: JSON.stringify(v.metadata),
      })),
    });
  }

  if (variables.length && type === "variableSelector") {
    await prisma.variable.update({
      where: { id: Number(variableId) },
      data: {
        key,
        type,
      },
    });

    await prisma.value.createMany({
      data: variables.map((v) => ({
        idVariable: Number(variableId),
        value: v.toString(),
      })),
    });
  }

  return json({
    message: "Variable updated",
    hasError: false,
  });
}

export default function AuthenticatedVariablesIndex() {
  const { variableWithValues, variables } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const { addToast } = useToasts();
  const navigation = useNavigation();

  const [values, setValues] = useState(
    variableWithValues.type === "variableSelector"
      ? []
      : variableWithValues.values.map((value) => ({
          value: value.value,
          metadata: value.metadata ? JSON.parse(value.metadata) : {},
        }))
  );

  const [showVariablesSelector, setShowVariablesSelector] = useState(
    variableWithValues.type === "variableSelector"
  );

  useEffect(() => {
    if (actionData?.message) {
      addToast(actionData.message, actionData.hasError ? "error" : "success");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  const handleChange = (index: number, value: string) => {
    const updatedValues = [...values];
    updatedValues[index] = {
      ...updatedValues[index],
      value,
    };
    setValues(updatedValues);
  };

  const handleMetadataChange = (index: number, key: string, value: string) => {
    const updatedValues = [...values];
    updatedValues[index] = {
      ...updatedValues[index],
      metadata: {
        ...updatedValues[index].metadata,
        [key]: value,
      },
    };
    setValues(updatedValues);
  };

  const handleMetadataKeyChange = (
    index: number,
    previousKey: string,
    key: string,
    useTimeout: boolean
  ) => {
    if (key === "") {
      return;
    }

    const updateValuesAction = () => {
      const updatedValues = [...values];
      updatedValues[index] = {
        ...updatedValues[index],
        metadata: {
          ...updatedValues[index].metadata,
          [key]: updatedValues[index].metadata[previousKey],
        },
      };

      delete updatedValues[index].metadata[previousKey];
      setValues(updatedValues);
    };

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (useTimeout) {
      debounceTimeout.current = setTimeout(() => {
        updateValuesAction();
      }, 2000);
    } else {
      updateValuesAction();
    }
  };

  const handleDeleteValue = (index: number) => {
    const updatedValues = [...values];
    updatedValues.splice(index, 1);
    setValues(updatedValues);
  };

  const handleDeleteMetadata = (index: number, key: string) => {
    const updatedValues = [...values];
    delete updatedValues[index].metadata[key];
    setValues(updatedValues);
  };

  const handleAddValue = () => {
    const updatedValues = [...values];
    updatedValues.unshift({
      value: "",
      metadata: {},
    });
    setValues(updatedValues);
  };

  const handleAddMetadataValue = (index: number) => {
    const updatedValues = [...values];
    updatedValues[index] = {
      ...updatedValues[index],
      metadata: {
        ...updatedValues[index].metadata,
        [""]: "",
      },
    };
    setValues(updatedValues);
  };

  return (
    <Form className="flex flex-col w-full gap-4" method="POST">
      <input type="hidden" name="values" value={JSON.stringify(values)} />
      <h1 className="text-2xl flex items-center justify-between w-full">
        Variable: {variableWithValues.key}
        <button
          type="submit"
          className="bg-green-900 h-10 text-white min-w-12 px-3 gap-1 text-base flex justify-center items-center rounded-md disabled:opacity-50"
          disabled={navigation.state === "submitting"}
        >
          {navigation.state === "submitting" ? (
            <Spinner />
          ) : (
            <>
              Save changes
              <PlusCircleIcon className="w-6 h-6" />
            </>
          )}
        </button>
      </h1>
      <div className="bg-white rounded-md p-4 shadow-md w-full">
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
              defaultValue={variableWithValues.key}
            />
          </div>
          <div>
            <label htmlFor="name">Type</label>
            <select
              id="name"
              name="type"
              required
              className="w-full h-10 border border-slate-300 rounded-sm px-3"
              defaultValue={variableWithValues.type}
              onChange={(e) => {
                setShowVariablesSelector(e.target.value === "variableSelector");
              }}
            >
              <option value="">Choose a variable type</option>
              <option value="selector">Selector</option>
              <option value="variableSelector">Variable Selector</option>
              <option value="condition">Condition</option>
            </select>
          </div>
          {variableWithValues.type !== "condition" ? (
            <div className="flex flex-col  w-full gap-6">
              <h4 className="text-lg mt-4 flex justify-between items-center">
                Values for this variable
                {!showVariablesSelector ? (
                  <button
                    type="button"
                    className="bg-green-900 h-10 text-white min-w-12 px-3 gap-1 text-xs flex justify-center items-center rounded-md"
                    onClick={handleAddValue}
                  >
                    Add new value
                    <PlusCircleIcon className="w-5 h-5" />
                  </button>
                ) : null}
              </h4>
              <div className="flex flex-col gap-3">
                {!showVariablesSelector ? (
                  values.map((value, index) => {
                    return (
                      <div key={index} className="bg-slate-100 p-3 rounded-md">
                        <div className="flex items-center justify-between gap-4 mt-4">
                          <input
                            type="text"
                            id="name"
                            required
                            placeholder="Variable name"
                            className="w-full h-10 border border-slate-300 rounded-sm px-3"
                            value={value.value}
                            onChange={(e) =>
                              handleChange(index, e.target.value)
                            }
                          />
                          <button
                            type="button"
                            className="bg-red-900 h-10 text-white min-w-12 flex justify-center items-center rounded-md"
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you want to delete this value?"
                                )
                              ) {
                                handleDeleteValue(index);
                              }
                            }}
                          >
                            <TrashIcon className="w-6 h-6" />
                          </button>
                        </div>
                        {value.metadata &&
                        Object.keys(value.metadata).length ? (
                          <div className="flex flex-col gap-4 mt-4 pl-8">
                            {Object.keys(value.metadata)
                              .sort((a, b) => {
                                if (a === "") return 1;
                                if (b === "") return 1;

                                if (a.toLowerCase() < b.toLowerCase())
                                  return -1;
                                if (a.toLowerCase() > b.toLowerCase()) return 1;
                                return 0;
                              })
                              .map((key) => (
                                <div
                                  key={key}
                                  className="flex gap-2 items-center"
                                >
                                  <input
                                    type="text"
                                    id="name"
                                    name=""
                                    required
                                    placeholder="Key name"
                                    className="w-full h-10 border border-slate-300 rounded-sm px-3"
                                    defaultValue={key}
                                    onChange={(e) =>
                                      handleMetadataKeyChange(
                                        index,
                                        key,
                                        e.target.value,
                                        true
                                      )
                                    }
                                    onBlur={(e) =>
                                      handleMetadataKeyChange(
                                        index,
                                        key,
                                        e.target.value,
                                        false
                                      )
                                    }
                                  />
                                  <span>:</span>
                                  <input
                                    type="text"
                                    id="name"
                                    name=""
                                    placeholder="Variable name"
                                    className="w-full h-10 border border-slate-300 rounded-sm px-3"
                                    value={value.metadata[key]}
                                    onChange={(e) =>
                                      handleMetadataChange(
                                        index,
                                        key,
                                        e.target.value
                                      )
                                    }
                                  />
                                  <button
                                    type="button"
                                    className="bg-red-900 h-10 text-white min-w-12 flex justify-center items-center rounded-md"
                                    onClick={() =>
                                      handleDeleteMetadata(index, key)
                                    }
                                  >
                                    <MinusIcon className="w-6 h-6" />
                                  </button>
                                </div>
                              ))}
                          </div>
                        ) : null}
                        <div className="flex justify-end">
                          <button
                            type="button"
                            className="bg-blue-900 mt-4 h-8 text-white min-w-12 px-3 gap-1 text-xs flex justify-center items-center rounded-md"
                            onClick={() => handleAddMetadataValue(index)}
                          >
                            Add metadata value
                            <PlusIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div>
                    <label htmlFor="variables">Variables</label>
                    <select
                      name="variables"
                      id="variables"
                      multiple
                      className="w-full h-40 border border-slate-300 rounded-sm px-3"
                      defaultValue={variableWithValues.values.map(
                        (value) => value.value
                      )}
                    >
                      {variables.map((variable) => (
                        <option key={variable.id} value={variable.key}>
                          {variable.key}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Form>
  );
}
