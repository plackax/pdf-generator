import {
  ActionFunctionArgs,
  json,
  NodeOnDiskFile,
  unstable_createFileUploadHandler,
  unstable_parseMultipartFormData,
  UploadHandler,
} from "@remix-run/node";

const standardFileUploadHandler = unstable_createFileUploadHandler({
  directory: "public/uploaded_images",
  avoidFileConflicts: true,
});

const fileUploadHandler: UploadHandler = (args) => {
  if (args.name === "file") {
    return standardFileUploadHandler(args);
  }
  return new Promise((resolve) => {
    resolve(null);
  });
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await unstable_parseMultipartFormData(
    request,
    fileUploadHandler
  );

  const nodeFile = formData.get("file") as NodeOnDiskFile;
  const arrayBuffer = await nodeFile.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  return json({ location: `data:image/png;base64,${base64}` });
}
