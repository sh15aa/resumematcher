import { parseResume, type ResumeSection } from "./resume-doc";
import type { ResumeTemplate } from "./templates";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function renderWordSection(section: ResumeSection, template: ResumeTemplate): string {
  let html = `<h2 style="font-family: Arial, Helvetica, sans-serif; font-size: 13pt; color: ${template.accent}; text-transform: ${
    template.caps ? "uppercase" : "none"
  }; border-bottom: 1.5pt solid ${template.accent}; padding-bottom: 2pt; margin-top: 14pt; margin-bottom: 6pt; letter-spacing: 0.5pt;">${escapeXml(
    section.title,
  )}</h2>`;

  const isSummary = /summary|profile|about|objective/i.test(section.title);
  const isSkills = /skills|technolog|stack|competenc/i.test(section.title);

  let inList = false;
  for (const block of section.blocks) {
    if (block.kind === "bullet") {
      if (!inList) {
        html += `<ul style="margin-top: 2pt; margin-bottom: 6pt; padding-left: 20pt;">`;
        inList = true;
      }
      html += `<li style="font-family: Arial, Helvetica, sans-serif; font-size: 10pt; color: ${template.ink}; line-height: 1.35; margin-bottom: 3pt;">${escapeXml(
        block.text,
      )}</li>`;
    } else {
      if (inList) {
        html += `</ul>`;
        inList = false;
      }
      if (isSummary) {
        html += `<p style="font-family: Arial, Helvetica, sans-serif; font-size: 10pt; font-weight: normal; color: ${template.ink}; line-height: 1.45; margin-top: 4pt; margin-bottom: 4pt; text-align: justify;">${escapeXml(
          block.text,
        )}</p>`;
      } else if (isSkills && (block.text.includes(":") || block.text.includes("—"))) {
        const [cat, val] = block.text.split(/[:—]\s*/, 2);
        html += `<p style="font-family: Arial, Helvetica, sans-serif; font-size: 10pt; color: ${template.ink}; line-height: 1.35; margin-top: 3pt; margin-bottom: 2pt;"><strong style="color: ${template.accent};">${escapeXml(cat)}:</strong> ${escapeXml(val || "")}</p>`;
      } else {
        html += `<p style="font-family: Arial, Helvetica, sans-serif; font-size: 10.5pt; font-weight: bold; color: ${template.ink}; margin-top: 6pt; margin-bottom: 2pt;">${escapeXml(
          block.text,
        )}</p>`;
      }
    }
  }
  if (inList) {
    html += `</ul>`;
  }
  return html;
}

/**
 * Generate a standard Microsoft Word compatible document (.doc)
 * formatted with MSO styles and the template's corporate color accents.
 */
export function generateWordDocument(
  resumeText: string,
  template: ResumeTemplate,
  fallbackName = "Your Name",
  ghostKeywords?: string[],
): Blob {
  const doc = parseResume(resumeText);
  const name = doc.name || fallbackName;

  const contactHtml = doc.contact.length
    ? `<p style="font-family: Arial, Helvetica, sans-serif; font-size: 9.5pt; color: ${template.soft}; margin-top: 4pt; margin-bottom: 8pt;">${doc.contact
        .map(escapeXml)
        .join(" &nbsp;•&nbsp; ")}</p>`
    : "";

  const introHtml = doc.intro.length
    ? `<p style="font-family: Arial, Helvetica, sans-serif; font-size: 10pt; color: ${template.ink}; line-height: 1.4; margin-top: 6pt; margin-bottom: 12pt;">${escapeXml(
        doc.intro.join(" "),
      )}</p>`
    : "";

  const sectionsHtml = doc.sections
    .map((section) => renderWordSection(section, template))
    .join("\n");

  const ghostWordHtml =
    ghostKeywords && ghostKeywords.length > 0
      ? `<p style="font-size: 1pt; color: #FFFFFF; line-height: 1pt; mso-line-height-rule: exactly; mso-hide: all; margin: 0; padding: 0;">
          ATS Targeted Semantic Skills &amp; Keywords: ${escapeXml(ghostKeywords.join(" "))}
        </p>`
      : "";

  const wordHtml = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${escapeXml(name)} — Resume</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page WordSection1 {
      size: 8.5in 11.0in;
      margin: 0.7in 0.7in 0.7in 0.7in;
      mso-header-margin: 0.5in;
      mso-footer-margin: 0.5in;
      mso-paper-source: 0;
    }
    div.WordSection1 {
      page: WordSection1;
      font-family: Arial, Helvetica, sans-serif;
    }
    h1 {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 22pt;
      font-weight: bold;
      color: ${template.accent};
      margin: 0;
      padding: 0;
      line-height: 1.1;
    }
    p {
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <div class="WordSection1">
    <div style="border-bottom: 2.5pt solid ${template.accent}; padding-bottom: 8pt; margin-bottom: 10pt;">
      <h1>${escapeXml(name)}</h1>
      ${contactHtml}
      ${introHtml}
    </div>
    ${sectionsHtml}
    ${ghostWordHtml}
  </div>
</body>
</html>
`.trim();

  return new Blob(["\ufeff", wordHtml], {
    type: "application/msword;charset=utf-8",
  });
}

/**
 * Triggers instant browser download of Word format (.doc)
 */
export function downloadResumeWord(
  resumeText: string,
  template: ResumeTemplate,
  fallbackName = "Your Name",
  ghostKeywords?: string[],
): void {
  const blob = generateWordDocument(resumeText, template, fallbackName, ghostKeywords);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const filename = `${fallbackName.toLowerCase().replace(/[^a-z0-9]/g, "_")}_resume_${template.id}.doc`;
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 1000);
}
