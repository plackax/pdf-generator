import { Form, json, useFetcher, useLoaderData } from "@remix-run/react";
import prisma from "../services/prisma.server";
import { ActionFunctionArgs } from "@remix-run/node";
import { useCallback, useEffect, useState } from "react";
import { convertTinyMceHtmlToPdf } from "~/services/pdf.server";
import { base64ToUint8Array } from "./_authenticated.templates._index";
import { Value, Variable } from "@prisma/client";
import { action as getVarsAction } from "./_authenticated.get-variables";
import {
  getFormattedDateBetween,
  getVariablesFromTemplate,
  stringToNumber,
} from "~/utils/utils";
import { Spinner } from "~/components/spinner";
import Handlebars from "handlebars";

export async function loader() {
  const templates = await prisma.template.findMany();

  return json({ templates });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const templateId = formData.get("templateId")?.toString();
  const getVars = formData.get("getVars")?.toString();
  const modifiedBody = formData.get("modifiedBody")?.toString();

  if (!templateId) {
    throw new Error("Template ID is required");
  }

  const templateData = await prisma.template.findUniqueOrThrow({
    where: { id: Number(templateId) },
  });

  const variables = await getVariablesFromTemplate(templateData.body!);
  const variablesMap: Record<
    string,
    {
      variable: string;
      condition: string | null;
      block: string;
      name: string | null;
    }
  > = {};

  const variablesMapToArray: string[] = [];
  for (const variable of variables) {
    const pieces = variable.variable.split(" ");
    const varId =
      pieces
        .find((p) => p.includes("id="))
        ?.split("=")[1]
        ?.trim() ?? "";

    if (pieces[0]) {
      variablesMapToArray.push(pieces[0]);
    }
    const variableMapKey = varId + (varId ? "-" : "") + pieces[0];

    if (!variablesMap[variableMapKey]) {
      variablesMap[variableMapKey] = {
        condition: variable.condition ?? null,
        block: variable.block,
        variable: pieces[0],
        name: variable.name ?? null,
      };
    }
  }

  const variablesData = await prisma.variable.findMany({
    where: { key: { in: variablesMapToArray } },
    include: { values: true },
  });

  if (getVars) {
    return json({
      templateData,
      variablesMap,
      variablesData,
      pdfBuffer: null,
    });
  }

  if (modifiedBody) {
    const templateData = await prisma.template.findUniqueOrThrow({
      where: { id: Number(templateId) },
    });

    const previousBody = templateData.body;
    templateData.body = modifiedBody;

    const pdfBuffer = await convertTinyMceHtmlToPdf(templateData);

    templateData.body = previousBody;

    return json({
      pdfBuffer: Buffer.from(pdfBuffer).toString("base64"),
      templateData,
      variablesMap,
      variablesData,
    });
  }

  return null;
}

function VariableSelector({
  variableData,
  onChange,
}: {
  variableData: Variable & { values: Value[] };
  onChange?: (value: string) => void;
}) {
  const fetcher = useFetcher<typeof getVarsAction>();

  return (
    <>
      <select
        id={variableData.id.toString()}
        required
        className="w-full h-10 border border-slate-300 rounded-sm px-3"
        onChange={(e) => {
          if (variableData.type !== "variableSelector") return;

          const value = e.target.value;
          fetcher.submit(
            {
              getValuesFromVariable: value,
            },
            {
              method: "POST",
              action: "/get-variables",
            }
          );
        }}
      >
        <option value="">Select a value</option>
        {variableData?.values.map((value) => (
          <option key={value.id} value={value.value}>
            {value.value}
          </option>
        ))}
      </select>
      {fetcher.data?.variableData?.values.length ? (
        <select
          id={variableData.id.toString() + "_metadata"}
          required
          className="w-[calc(100%-1.25rem)] h-10 border mt-4 ml-5 border-slate-300 rounded-sm px-3"
          onChange={(e) => {
            const value = e.target.value;
            onChange?.(value);
          }}
        >
          <option value="">Select a value</option>
          {fetcher.data?.variableData?.values.map((value) => (
            <option key={value.id} value={value.value}>
              {value.value}
            </option>
          ))}
        </select>
      ) : null}
    </>
  );
}

export function DateRange({
  onChange,
}: {
  onChange?: (dateString: string) => void;
}) {
  const [initialDate, setInitialDate] = useState("");
  const [finalDate, setFinalDate] = useState("");

  useEffect(() => {
    if (initialDate && finalDate && onChange) {
      const formattedInitialDate = getFormattedDateBetween(
        initialDate,
        finalDate
      );

      onChange?.(formattedInitialDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDate, finalDate]);

  return (
    <div className="flex gap-4 flex-wrap">
      <input
        type="date"
        required
        value={initialDate}
        onChange={(e) => setInitialDate(e.target.value)}
        className="w-full h-10 border border-slate-300 rounded-sm px-3"
      />
      <input
        type="date"
        required
        value={finalDate}
        onChange={(e) => setFinalDate(e.target.value)}
        className="w-full h-10 border border-slate-300 rounded-sm px-3"
      />
    </div>
  );
}

export default function AuthenticatedPDFGeneratorIndex() {
  const { templates } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  const [fetcherData, setFetcherData] = useState<typeof fetcher.data>();

  useEffect(() => {
    setFetcherData(fetcher.data ?? null);
  }, [fetcher.data]);

  const [calculatedValues, setCalculatedValues] = useState<
    {
      id: number;
      selectedValue: string;
      metadata: Record<string, string>;
    }[]
  >([]);

  useEffect(() => {
    if (fetcherData?.pdfBuffer) {
      const byteData = base64ToUint8Array(fetcherData.pdfBuffer);
      const blob = new Blob([byteData], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${Date.now()}.pdf`;
      a.click();
    }
  }, [fetcherData]);

  const calculateFullContent = useCallback(() => {
    const fullContent = fetcherData?.templateData?.body ?? "";

    const regexPattern = /{{(.*?)}}/g;
    const coincidencesWithIndexOf = Array.from(
      fullContent.matchAll(regexPattern),
      (m) => ({ index: m.index, match: m[0] })
    );

    const handlebarsVars: Record<string, unknown> = {};

    const newCalculatedString = calculatedValues.reduce((acc, value) => {
      if (Object.keys(value.metadata).length) {
        Object.entries(value.metadata).forEach(
          ([metadataKey, metadataValue]) => {
            if (metadataKey === "isConditional") {
              const [conditionValue, variableName] =
                value.selectedValue.split("-");
              handlebarsVars[variableName] = conditionValue === "yes";
              return;
            }

            const coincidence = coincidencesWithIndexOf.find(
              (c) =>
                c.match.includes("id=" + value.id) &&
                c.match.includes("metadata=" + metadataKey)
            );
            if (coincidence) {
              acc = acc.replaceAll(coincidence.match, metadataValue);
            }
          }
        );
      }

      const coincidence = coincidencesWithIndexOf.find((c) =>
        c.match.includes("id=" + value.id)
      );

      if (coincidence) {
        acc = acc.replaceAll(coincidence.match, value.selectedValue);
      }

      return acc;
    }, fullContent);

    const template = Handlebars.compile(newCalculatedString);

    return template(handlebarsVars);
  }, [calculatedValues, fetcherData?.templateData?.body]);

  const handleChangeValue = (
    value: string,
    varId: number,
    variableData?: Variable & { values: Value[] }
  ) => {
    let metadataString = variableData?.values.find(
      (v) => v.value === value
    )?.metadata;

    if (isNaN(varId)) {
      varId = stringToNumber(variableData?.key ?? "");
      metadataString = '{"isConditional": true}';
    }

    const metadata = metadataString ? JSON.parse(metadataString) : {};

    setCalculatedValues((prev) => {
      const newCalculatedValues = [...prev];
      const index = newCalculatedValues.findIndex((v) => v.id === varId);

      if (index === -1) {
        newCalculatedValues.push({
          id: varId,
          selectedValue: value,
          metadata,
        });
      } else {
        newCalculatedValues[index] = {
          id: varId,
          selectedValue: value,
          metadata,
        };
      }

      return newCalculatedValues;
    });
  };

  return (
    <>
      <h1 className="text-2xl flex items-center justify-between w-full">
        Generate PDF
      </h1>
      <div className="flex gap-6">
        <Form
          className="bg-white rounded-md p-4 shadow-md w-full max-w-[868px]"
          method="POST"
          onSubmit={(e) => {
            e.preventDefault();
            fetcher.submit(
              {
                modifiedBody: calculateFullContent(),
                templateId:
                  (document.getElementById("templateVar") as HTMLSelectElement)
                    ?.value ?? "",
              },
              { method: "POST" }
            );
          }}
        >
          <input
            type="hidden"
            name="modifiedBody"
            value={calculateFullContent()}
          />
          <div className="flex flex-col gap-4 max-h-[calc(100dvh-8.5rem)] overflow-auto">
            <div>
              <label htmlFor="templateVar">Choose a Template</label>
              <select
                id="templateVar"
                name="templateId"
                required
                className="w-full h-10 border border-slate-300 rounded-sm px-3"
                onChange={(e) => {
                  setFetcherData(null);
                  const templateId = e.target.value;
                  if (!templateId) {
                    return;
                  }

                  fetcher.submit(
                    { templateId, getVars: true },
                    { method: "POST" }
                  );
                  setCalculatedValues([]);
                }}
              >
                <option value="">Select a template</option>
                {templates.map((template, index) => (
                  <option key={template.id + index} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {fetcherData?.variablesData.length ? <hr className="my-4" /> : null}
            <div className="flex flex-wrap gap-4">
              {fetcherData?.variablesMap &&
                Object.keys(fetcherData.variablesMap)?.map((varCompositeId) => {
                  const variable = fetcherData.variablesMap[varCompositeId];
                  const varName = variable.variable;
                  const varId = Number(varCompositeId.split("-")[0]);

                  const variableData = fetcherData?.variablesData.find(
                    (v) => v.key === varName
                  );

                  return (
                    <div
                      key={varCompositeId}
                      className={
                        "flex-1 min-w-[calc(50%-1rem)] " +
                        (variable.condition &&
                        variable.condition !== variable.variable
                          ? variable.condition + "-" + variable.block
                          : "")
                      }
                      style={
                        variable.condition &&
                        variable.variable !== variable.condition
                          ? { display: "none" }
                          : {}
                      }
                    >
                      <label className="capitalize" htmlFor={varCompositeId}>
                        <span
                          dangerouslySetInnerHTML={{
                            __html: variable.name
                              ? variable.name
                              : varName.replaceAll("_", " "),
                          }}
                        ></span>
                        {""}
                      </label>
                      {variableData?.type === "selector" ? (
                        <select
                          id={varCompositeId}
                          name={varCompositeId}
                          required
                          className="w-full h-10 border border-slate-300 rounded-sm px-3"
                          onChange={(e) => {
                            const value = e.target.value;
                            handleChangeValue(
                              value,
                              varId,
                              variableData as unknown as Variable & {
                                values: Value[];
                              }
                            );
                          }}
                        >
                          <option value="">Select a value</option>
                          {variableData?.values.map((value) => (
                            <option key={value.id} value={value.value}>
                              {value.value}
                            </option>
                          ))}
                        </select>
                      ) : variableData?.type === "variableSelector" ? (
                        <VariableSelector
                          variableData={
                            variableData as unknown as Variable & {
                              values: Value[];
                            }
                          }
                          onChange={(value) => {
                            handleChangeValue(
                              value,
                              varId,
                              variableData as unknown as Variable & {
                                values: Value[];
                              }
                            );
                          }}
                        />
                      ) : variableData?.type === "condition" ? (
                        <div>
                          <select
                            name={variableData.key}
                            id={variableData.key}
                            required
                            className="w-full h-10 border border-slate-300 rounded-sm px-3"
                            onChange={(e) => {
                              const value = e.target.value;
                              const classToCheck =
                                variable.variable +
                                "-" +
                                (value === "yes" ? "if" : "else");

                              const classToHide =
                                variable.variable +
                                "-" +
                                (value === "yes" ? "else" : "if");

                              const elementsToShow =
                                document.querySelectorAll<HTMLDivElement>(
                                  `.${classToCheck}`
                                );

                              const elementsToHide =
                                document.querySelectorAll<HTMLDivElement>(
                                  `.${classToHide}`
                                );

                              elementsToShow.forEach((element) => {
                                element.style.display = "block";
                              });

                              elementsToHide.forEach((element) => {
                                element.style.display = "none";
                              });

                              const inputsToMakeRequired =
                                document.querySelectorAll<HTMLInputElement>(
                                  `.${classToCheck} input`
                                );

                              const inputsToMakeNotRequired =
                                document.querySelectorAll<HTMLInputElement>(
                                  `.${classToHide} input`
                                );

                              inputsToMakeRequired.forEach((input) => {
                                input.required = true;
                              });

                              inputsToMakeNotRequired.forEach((input) => {
                                input.required = false;
                              });

                              handleChangeValue(
                                value + "-" + variableData.key,
                                varId,
                                variableData as unknown as Variable & {
                                  values: Value[];
                                }
                              );
                            }}
                          >
                            <option value="">Select a value</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </select>
                        </div>
                      ) : varName === "date_full_field" ? (
                        <input
                          type="date"
                          required
                          id={varCompositeId}
                          name={varCompositeId}
                          className="w-full h-10 border border-slate-300 rounded-sm px-3"
                          onChange={(e) => {
                            const value = e.target.value;
                            const date = new Date(value + "T23:59:59Z");
                            const formattedDate = date.toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "2-digit",
                              }
                            );
                            handleChangeValue(
                              formattedDate,
                              varId,
                              variableData as unknown as Variable & {
                                values: Value[];
                              }
                            );
                          }}
                        />
                      ) : varName === "date_range_full_field" ? (
                        <DateRange
                          onChange={(value) => {
                            handleChangeValue(
                              value,
                              varId,
                              variableData as unknown as Variable & {
                                values: Value[];
                              }
                            );
                          }}
                        />
                      ) : (
                        <input
                          id={varCompositeId}
                          name={varCompositeId}
                          type={varName === "numeric_field" ? "number" : "text"}
                          required
                          onChange={(e) => {
                            const value = e.target.value;
                            handleChangeValue(
                              value,
                              varId,
                              variableData as unknown as Variable & {
                                values: Value[];
                              }
                            );
                          }}
                          value={eval(variableData?.content ?? "")}
                          className="w-full h-10 border border-slate-300 rounded-sm px-3"
                        />
                      )}
                    </div>
                  );
                })}
            </div>

            <div className="flex gap-6">
              <button
                name="generate"
                value="1"
                className="bg-black text-white h-10 w-full flex justify-center items-center gap-4 rounded-sm disabled:bg-slate-500 disabled:cursor-not-allowed"
                disabled={
                  !fetcherData?.templateData || fetcher.state === "submitting"
                }
              >
                {fetcher.state !== "idle" && !fetcherData ? (
                  <>
                    <Spinner />
                    <span>Loading</span>
                  </>
                ) : (
                  <>
                    {fetcher.state === "submitting" && fetcherData ? (
                      <>
                        <Spinner />
                        <span>Generating</span>
                      </>
                    ) : (
                      "Generate PDF"
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </Form>
        {fetcherData ? (
          <div className="w-1/2">
            <h2 className="text-xl">Preview</h2>
            <div className="rounded-md shadow-md overflow-auto h-[calc(100dvh-108px)] bg-white">
              <iframe
                title="PreviewIframe"
                srcDoc={
                  `<div style="display:block; width: 100%;min-width:720px; font-family: arial;">` +
                  fetcherData.templateData.header +
                  calculateFullContent() +
                  '<div style="margin-top:100px">' +
                  fetcherData.templateData.footer +
                  `</div></div>`
                }
                onLoad={(e) => {
                  const iframe = e.target as HTMLIFrameElement;
                  const iframeDoc = iframe.contentWindow?.document;

                  iframeDoc!.body.style.margin = "0";
                  iframeDoc!.body.style.padding = "0";
                  iframeDoc!.body.style.overflow = "hidden";
                }}
                style={{
                  width: 792,
                  height: 1500,
                  overflow: "hidden",
                  transformOrigin: "top left",
                  backgroundColor: "white",
                  padding: "20px 30px",
                }}
              ></iframe>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
