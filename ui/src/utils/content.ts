import { marked } from "marked";
import DOMPurify from "dompurify";

// 链接统一新窗口打开，并防止 window.opener 泄露
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A" && node.getAttribute("href")) {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  }
});

export type ContentFormat = "markdown" | "html";

/** 将 Markdown / HTML 正文渲染为经过净化的 HTML（防 XSS）。 */
export const renderContent = (format: ContentFormat | string, body: string): string => {
  const raw = format === "html" ? body || "" : (marked.parse(body || "", { gfm: true, breaks: true, async: false }) as string);
  return DOMPurify.sanitize(raw);
};

/** 读取上传文件：.md/.markdown/.txt/.html 读文本；.docx 通过 mammoth 转为 HTML。 */
export const readContentFile = async (
  file: File
): Promise<{ format: ContentFormat; body: string; title: string }> => {
  const name = file.name;
  const title = name.replace(/\.[^.]+$/, "");
  const ext = (name.split(".").pop() || "").toLowerCase();
  if (ext === "docx") {
    const mammoth = await import("mammoth");
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    return { format: "html", body: result.value, title };
  }
  if (ext === "doc") {
    throw new Error("暂不支持旧版 .doc，请另存为 .docx 后上传");
  }
  if (["md", "markdown", "txt", "html", "htm"].includes(ext)) {
    const text = await file.text();
    return { format: ext === "html" || ext === "htm" ? "html" : "markdown", body: text, title };
  }
  throw new Error("仅支持 .md / .markdown / .txt / .html / .docx 文件");
};

// 公告卡片使用的内置图标（内联 SVG，避免走图片代理）
export const contentIcon =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect x="8" y="5" width="32" height="38" rx="5" fill="#4f8cff"/><rect x="14" y="14" width="20" height="3" rx="1.5" fill="#fff"/><rect x="14" y="22" width="20" height="3" rx="1.5" fill="#fff"/><rect x="14" y="30" width="12" height="3" rx="1.5" fill="#fff"/></svg>`
  );

export const CONTENT_CATELOG = "公告";
export const CONTENT_URL_PREFIX = "content:";
