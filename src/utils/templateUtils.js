// utils/templateUtils.js

export const extractVariables =
  (text = "") => {
    const regex =
      /\{\{(\d+)\}\}/g;

    const found =
      new Set();

    let match;

    while (
      (match =
        regex.exec(
          text
        )) !== null
    ) {
      found.add(
        match[1]
      );
    }

    return Array.from(
      found
    ).sort(
      (a, b) =>
        Number(a) -
        Number(b)
    );
  };

export const replaceVariables =
  (
    text,
    values = {}
  ) => {
    if (!text)
      return "";

    return text.replace(
      /\{\{(\d+)\}\}/g,
      (_, key) =>
        values[key] ||
        `{{${key}}}`
    );
  };

export const getNextVariable =
  (text = "") => {
    const vars =
      extractVariables(
        text
      );

    if (
      !vars.length
    )
      return 1;

    return (
      Math.max(
        ...vars.map(
          Number
        )
      ) + 1
    );
  };

export const createDefaultButton =
  (type) => {
    switch (type) {
      case "url":
        return {
          type,
          label:
            "Visit Website",
          value: "",
        };

      case "call":
        return {
          type,
          label:
            "Call Now",
          value: "",
        };

      case "reply":
        return {
          type,
          label:
            "Interested",
          value: "",
        };

      default:
        return {
          type,
          label: "",
          value: "",
        };
    }
  };

export const mediaLabels =
  {
    TEXT: "Text",
    IMAGE: "Image",
    VIDEO: "Video",
    AUDIO: "Audio",
    DOCUMENT:
      "Document",
  };