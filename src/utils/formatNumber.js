// utils/formatNumber.js

export const formatNumber = (value = 0) => {
  const number = Number(value);

  if (Number.isNaN(number)) return "0";

  if (number >= 1_000_000_000) {
    return `${(number / 1_000_000_000)
      .toFixed(1)
      .replace(/\.0$/, "")}B`;
  }

  if (number >= 1_000_000) {
    return `${(number / 1_000_000)
      .toFixed(1)
      .replace(/\.0$/, "")}M`;
  }

  if (number >= 1_000) {
    return `${(number / 1_000)
      .toFixed(1)
      .replace(/\.0$/, "")}K`;
  }

  return String(number);
};