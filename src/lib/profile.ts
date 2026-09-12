/** Browser-local career profile that can be turned into resume text. */

export type ProfileRole = {
  title: string;
  company: string;
  dates: string;
  bullets: string;
};

export type ProfileStudy = {
  qualification: string;
  school: string;
  dates: string;
};

export type CustomSectionItem = {
  id: string;
  name: string;
  subtitle?: string;
  dates?: string;
  description?: string;
};

export type ProfileCustomSection = {
  id: string;
  title: string;
  content: string;
  items?: CustomSectionItem[];
};

export type Profile = {
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  about: string;
  roles: ProfileRole[];
  studies: ProfileStudy[];
  skills: string;
  certifications: string;
  customSections: ProfileCustomSection[];
};

const KEY = "resume-tailor:profile";

export const emptyRole: ProfileRole = { title: "", company: "", dates: "", bullets: "" };
export const emptyStudy: ProfileStudy = { qualification: "", school: "", dates: "" };

export const emptyProfile: Profile = {
  name: "",
  headline: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  website: "",
  about: "",
  roles: [{ ...emptyRole }],
  studies: [{ ...emptyStudy }],
  skills: "",
  certifications: "",
  customSections: [],
};

export function loadProfile(): Profile {
  if (typeof window === "undefined") return { ...emptyProfile };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...emptyProfile };
    const parsed = JSON.parse(raw) as Partial<Profile>;
    return {
      ...emptyProfile,
      ...parsed,
      roles: parsed.roles?.length ? parsed.roles : [{ ...emptyRole }],
      studies: parsed.studies?.length ? parsed.studies : [{ ...emptyStudy }],
      customSections: Array.isArray(parsed.customSections) ? parsed.customSections : [],
    };
  } catch {
    return { ...emptyProfile };
  }
}

export function saveProfile(profile: Profile): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(profile));
  } catch {
    /* storage may be unavailable */
  }
}

export function hasProfile(profile: Profile): boolean {
  return Boolean(
    profile.name.trim() || profile.about.trim() || profile.roles.some((r) => r.title.trim()),
  );
}

function bulletLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.replace(/^\s*[-*•]\s*/, "").trim())
    .filter(Boolean);
}

/** Turn the saved profile into the plain-text resume the tailor understands. */
export function profileToResume(profile: Profile): string {
  const out: string[] = [];
  if (profile.name.trim()) out.push(profile.name.trim());

  const contact = [
    profile.email,
    profile.phone,
    profile.location,
    profile.linkedin,
    profile.website,
  ]
    .map((item) => item.trim())
    .filter(Boolean);
  if (contact.length) out.push(contact.join(" | "));

  if (profile.headline.trim()) out.push("", profile.headline.trim());

  if (profile.about.trim()) out.push("", "SUMMARY", profile.about.trim());

  const roles = profile.roles.filter((role) => role.title.trim() || role.company.trim());
  if (roles.length) {
    out.push("", "EXPERIENCE");
    for (const role of roles) {
      const head = [role.title.trim(), role.company.trim()].filter(Boolean).join(", ");
      out.push(role.dates.trim() ? `${head} (${role.dates.trim()})` : head);
      for (const line of bulletLines(role.bullets)) out.push(`- ${line}`);
    }
  }

  if (profile.skills.trim()) out.push("", "SKILLS", profile.skills.trim());

  const studies = profile.studies.filter((s) => s.qualification.trim() || s.school.trim());
  if (studies.length) {
    out.push("", "EDUCATION");
    for (const study of studies) {
      const head = [study.qualification.trim(), study.school.trim()].filter(Boolean).join(", ");
      out.push(study.dates.trim() ? `${head}, ${study.dates.trim()}` : head);
    }
  }

  if (profile.certifications.trim()) {
    out.push("", "CERTIFICATIONS");
    for (const line of bulletLines(profile.certifications)) out.push(`- ${line}`);
  }

  if (profile.customSections?.length) {
    for (const section of profile.customSections) {
      if (section.title.trim()) {
        out.push("", section.title.trim().toUpperCase());
        if (section.items && section.items.length > 0) {
          for (const item of section.items) {
            if (item.name.trim() || item.subtitle?.trim()) {
              const headParts = [item.name.trim(), item.subtitle?.trim()].filter(Boolean);
              let head = headParts.join(", ");
              if (item.dates?.trim()) {
                head += ` (${item.dates.trim()})`;
              }
              out.push(head);
              if (item.description?.trim()) {
                for (const line of bulletLines(item.description)) {
                  out.push(`- ${line}`);
                }
              }
            }
          }
        } else if (section.content.trim()) {
          for (const line of bulletLines(section.content)) {
            out.push(`- ${line}`);
          }
        }
      }
    }
  }

  return out.join("\n").trim();
}
