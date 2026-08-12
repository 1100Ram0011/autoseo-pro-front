export const formatDate = (date, format = "DD/MM/YYYY") => {
  if (!date) return "N/A";

  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const monthShort = d.toLocaleString("en-IN", { month: "short" });
  const monthNum = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const time = d.toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  switch (format) {
    case "DD-MM-YYYY":
      return `${day}-${monthNum}-${year}`;
    case "DD-MMM-YYYY":
      return `${day}-${monthShort}-${year}`;
    case "DD-MMM-YYYY hh:mm A":
      return `${day}-${monthShort}-${year} at ${time}`;
    default:
      return `${day}-${monthShort}-${year}`;
  }
};