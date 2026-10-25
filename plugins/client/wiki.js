const axios = require("axios");

async function Wiki(query) {
  const q = String(query || "").trim();
  if (!q) return { success: false, error: "Empty query" };
  try {
    const search = await axios.get("https://en.wikipedia.org/w/api.php", {
      params: { action: "opensearch", search: q, limit: 1, namespace: 0, format: "json" },
      timeout: 8000,
    });
    const title = search.data?.[1]?.[0];
    if (!title) return { success: false, error: "No results", query: q };
    const { data: d } = await axios.get(
      "https://en.wikipedia.org/api/rest_v1/page/summary/" +
        encodeURIComponent(title.replace(/ /g, "_")),
      { timeout: 8000 }
    );
    return {
      success: true,
      query: q,
      title: d.title,
      description: d.description || null,
      summary: d.extract || null,
      isDisambiguation: d.type === "disambiguation",
      url: d.content_urls?.desktop?.page || null,
      image: d.originalimage?.source || d.thumbnail?.source || null,
      lastUpdated: d.timestamp || null,
    };
  } catch (e) {
    if (e.response?.status === 404) return { success: false, error: "No results", query: q };
    return { success: false, error: e.message, query: q };
  }
}

module.exports = { Wiki };
