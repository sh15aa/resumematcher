/** Print an HTML document via a hidden iframe so the browser can save it as a PDF. */
export async function printHtmlDocument(html: string): Promise<void> {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.position = "fixed";
  frame.style.right = "0";
  frame.style.bottom = "0";
  frame.style.width = "0";
  frame.style.height = "0";
  frame.style.border = "0";
  frame.style.opacity = "0";
  document.body.appendChild(frame);

  await new Promise<void>((resolve) => {
    frame.addEventListener("load", () => resolve(), { once: true });
    frame.srcdoc = html;
  });

  const win = frame.contentWindow;
  if (!win) {
    frame.remove();
    throw new Error("Could not open the print view.");
  }

  try {
    await (win.document as Document & { fonts?: FontFaceSet }).fonts?.ready;
  } catch {
    /* fonts are optional */
  }
  await new Promise((resolve) => setTimeout(resolve, 350));

  win.focus();
  win.print();
  setTimeout(() => frame.remove(), 60000);
}
