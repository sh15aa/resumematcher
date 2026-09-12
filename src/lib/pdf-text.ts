/** Browser-side text extraction from an uploaded resume file (PDF or plain text). */

type TextItem = { str?: string; transform?: number[] };

export async function extractFileText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (file.type.startsWith("text/") || name.endsWith(".txt") || name.endsWith(".md")) {
    return (await file.text()).trim();
  }
  if (!name.endsWith(".pdf") && file.type !== "application/pdf") {
    throw new Error("Please upload a PDF or a plain text file.");
  }

  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;

  const pages: string[] = [];
  for (let index = 1; index <= doc.numPages; index += 1) {
    const page = await doc.getPage(index);
    const content = await page.getTextContent();
    let text = "";
    let lastY: number | null = null;
    for (const raw of content.items as TextItem[]) {
      const str = raw.str ?? "";
      const y = raw.transform?.[5] ?? null;
      if (lastY !== null && y !== null && Math.abs(y - lastY) > 2) text += "\n";
      text += str;
      lastY = y;
    }
    pages.push(text);
  }

  const out = pages
    .join("\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!out) throw new Error("That PDF has no selectable text — it may be a scan.");
  return out;
}
