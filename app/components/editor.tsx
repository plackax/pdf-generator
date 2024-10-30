import { Variable } from "@prisma/client";
import { Editor } from "@tinymce/tinymce-react";
import { useEffect, useState } from "react";
import { getVariablesFromTemplate } from "~/utils/utils";

type TemplateEditorProps = {
  id: string;
  initValue?: string;
  height?: number;
  variables?: Variable[];
  onChange?: (content: string) => void;
};

export default function TemplateEditor({
  id,
  initValue,
  variables,
  height = 500,
  onChange,
}: TemplateEditorProps) {
  const [content, setContent] = useState(initValue || "");

  const handleEditorChange = (content: string) => {
    setContent(content);
  };

  useEffect(() => {
    if (onChange) {
      onChange(content);
    }
  }, [content, onChange]);

  return (
    <Editor
      id={id}
      apiKey="g5fzk0ky2rxdirzoee3j2ipk5uv2brhkbweh7y6deilcz1v9"
      value={content}
      init={{
        height,
        menubar: false,
        newline_behavior: "invert",
        plugins: ["table", "image", "code"],
        images_upload_url: "/uploadimage",
        relative_urls: false,
        remove_script_host: false,
        convert_urls: true,
        width: 820,
        content_style: "body { font-family: Arial, sans-serif; }",
        inline_styles: true,
        max_width: 820,
        setup: (editor) => {
          if (variables?.length) {
            editor.ui.registry.addSplitButton("variables", {
              text: "Variables",
              icon: "info",
              tooltip: "Insert any variable to the content",
              onAction: () => {},
              onItemAction: async (api, value) => {
                const currentHtml = editor.getContent({
                  format: "html",
                });

                const variables = await getVariablesFromTemplate(currentHtml);
                const identifiedValue = value.includes("#if ")
                  ? value
                  : value.replace(
                      "}}",
                      " id=" +
                        (variables.length + 1) +
                        " name=field " +
                        (variables.length + 1) +
                        "}}"
                    );

                return editor.insertContent(identifiedValue);
              },
              fetch: (callback) =>
                callback(
                  [
                    {
                      type: "choiceitem" as const,
                      text: "Writable field",
                      value: "{{writable_field}}",
                    },
                    {
                      type: "choiceitem" as const,
                      text: "Numeric field",
                      value: "{{numeric_field}}",
                    },
                    {
                      type: "choiceitem" as const,
                      text: "Date field (IE: October 13, 2021)",
                      value: "{{date_full_field}}",
                    },
                    {
                      type: "choiceitem" as const,
                      text: "Date range field (IE: from October 13rd to October 15th 2021)",
                      value: "{{date_range_full_field}}",
                    },
                    {
                      type: "choiceitem" as const,
                      text: "Conditional block",
                      value: `{{#if [REPLACE_VAR]}}
                        ...
                      {{/if}}`,
                    },
                    {
                      type: "choiceitem" as const,
                      text: "____________________",
                      value: "",
                    },
                  ].concat(
                    variables.map((variable) => ({
                      type: "choiceitem",
                      text: variable.key,
                      value: `{{${variable.key}}}`,
                    }))
                  )
                ),
            });
          }
        },
        toolbar:
          "variables | undo redo | formatselect | bold italic underline fontsize lineheight backcolor | table image | \
          alignleft aligncenter alignright alignjustify | \
          bullist numlist outdent indent | removeformat | code",
        table_toolbar:
          "tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol",
      }}
      onEditorChange={handleEditorChange}
    />
  );
}
