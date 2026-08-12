const BASE_URL = `${(process.env.NEXT_PUBLIC_API_URL.replace('/api', ''))}/backlinks`;

export const fetchBacklinks = async (domain, page = 1, limit = 10) => {
  const res = await fetch(
    `${BASE_URL}?domain=${domain}&page=${page}&limit=${limit}`
  );
  if (!res.ok) throw new Error("Failed to fetch backlinks");
  return res.json();
};