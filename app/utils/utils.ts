export const getVariablesFromTemplate = async (template: string) => {
  const regex = /{{#if (.*?)}}|{{else}}|{{\/if}}|{{(.*?)}}/g;
  const nameRegex = /name="(.*?)"/;

  const stack = [];
  const variablesWithOrigin = [];

  for (const match of template.matchAll(regex)) {
    if (match[1]) {
      const conditionVariable = match[1].trim();
      variablesWithOrigin.push({
        variable: conditionVariable,
        condition: conditionVariable,
        block: "if",
      });
      stack.push({ condition: conditionVariable, block: "if" });
    } else if (match[0] === "{{else}}") {
      if (stack.length > 0 && stack[stack.length - 1].block === "if") {
        stack[stack.length - 1].block = "else";
      }
    } else if (match[0] === "{{/if}}") {
      stack.pop();
    } else if (match[2]) {
      const currentBlock =
        stack.length > 0 ? stack[stack.length - 1] : { block: "none" };

      let variable = match[2].trim();
      const nameMatch = variable.match(nameRegex);
      const name = nameMatch ? nameMatch[1] : null;

      variable = variable.replace(nameRegex, "").trim();

      variablesWithOrigin.push({
        variable,
        condition: currentBlock.condition,
        block: currentBlock.block,
        name,
      });
    }
  }

  console.log(variablesWithOrigin);

  return variablesWithOrigin;
};

export const getFormattedDateBetween = (
  initialDate: string,
  finalDate: string
) => {
  const splitInitialDate = initialDate.split("-");
  const splitFinalDate = finalDate.split("-");

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getSuffix = (day: string) => {
    let suffixDay = "th";
    switch (day) {
      case "1":
        suffixDay = "st";
        break;
      case "2":
        suffixDay = "nd";
        break;
      case "3":
        suffixDay = "rd";
        break;
      default:
        suffixDay = "th";
        break;
    }

    return suffixDay;
  };

  const suffixInitialDay = getSuffix(splitInitialDate[2][1]);
  const suffixFinalDay = getSuffix(splitFinalDate[2][1]);

  const formattedInitialDate = `from ${
    months[Number(splitInitialDate[1]) - 1]
  } ${
    splitInitialDate[2].startsWith("0")
      ? splitInitialDate[2][1]
      : splitInitialDate[2]
  }${suffixInitialDay} to the${
    months[Number(splitInitialDate[1]) - 1] !==
    months[Number(splitFinalDate[1]) - 1]
      ? " " + months[Number(splitFinalDate[1]) - 1]
      : ""
  } ${
    splitFinalDate[2].startsWith("0") ? splitFinalDate[2][1] : splitFinalDate[2]
  }${suffixFinalDay} ${splitFinalDate[0]}`;

  return formattedInitialDate;
};

export const stringToNumber = (str: string) => {
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    sum += str.charCodeAt(i);
  }
  return sum;
};
