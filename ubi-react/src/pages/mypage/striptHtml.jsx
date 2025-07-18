export function stripHtml(html) {
  if (!html || typeof html !== "string") return "";

  let text = html.replace(/<br\s*\/?>/gi, " ");
  text = text.replace(/<[^>]+>/g, "");
  text = text.replace(/&nbsp;/g, " ").trim();

  return text;
}