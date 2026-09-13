import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { ArrowLeft, ArrowRight, Plus, Save, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/sonner";
import {
  emptyProfile,
  emptyRole,
  emptyStudy,
  loadProfile,
  profileToResume,
  saveProfile,
  type Profile,
} from "@/lib/profile";

export const PENDING_RESUME_KEY = "resume-tailor:pending-resume";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your Career Profile — Build a Resume From Your Details | Resume Tailor" },
      {
        name: "description",
        content:
          "Enter your name, headline, contact details, work history, education and skills once. Resume Tailor turns them into a resume that every tailored PDF and cover letter is built from.",
      },
      { property: "og:title", content: "Your Career Profile — Build a Resume From Your Details" },
      {
        property: "og:description",
        content:
          "Fill in your profile once and every tailored resume and cover letter reads like the real you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://cv.fitt.workers.dev/profile" }],
  }),
  component: ProfilePage,
});

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="bg-card"
      />
    </label>
  );
}

function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>(emptyProfile);

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  const preview = useMemo(() => profileToResume(profile), [profile]);

  function persist() {
    saveProfile(profile);
    toast.success("Profile saved on this device");
  }

  function useInTailor() {
    if (!preview.trim()) {
      toast.error("Add at least your name and one role first.");
      return;
    }
    saveProfile(profile);
    sessionStorage.setItem(PENDING_RESUME_KEY, preview);
    navigate({ to: "/" });
  }

  return (
    <main className="min-h-screen bg-background text-foreground w-full max-w-[100vw] overflow-x-hidden box-border">
      <Toaster />
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 md:px-8 py-12 md:py-20 box-border">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4 text-primary" /> Back to the tailor
        </Link>

        <header className="mt-6 max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary font-semibold">
            Career Profile Studio
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl leading-[1.08] font-bold tracking-tight hero-gradient-text">
            Fill this in once, and every resume reads like you.
          </h1>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-muted-foreground">
            Your details stay on this device. They build the resume that the tailored PDF and cover
            letter are written from.
          </p>
        </header>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.15fr_1fr] items-start">
          <div className="space-y-8">
            <section className="rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-xs">
              <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <UserRound className="size-4 text-primary" /> Basics
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Full name"
                  value={profile.name}
                  onChange={(v) => set("name", v)}
                  placeholder="Priya Raman"
                />
                <Field
                  label="Headline"
                  value={profile.headline}
                  onChange={(v) => set("headline", v)}
                  placeholder="Senior Product Designer"
                />
                <Field
                  label="Email"
                  value={profile.email}
                  onChange={(v) => set("email", v)}
                  placeholder="you@example.com"
                />
                <Field
                  label="Phone"
                  value={profile.phone}
                  onChange={(v) => set("phone", v)}
                  placeholder="+1 415 555 0134"
                />
                <Field
                  label="Location"
                  value={profile.location}
                  onChange={(v) => set("location", v)}
                  placeholder="Berlin, Germany"
                />
                <Field
                  label="LinkedIn"
                  value={profile.linkedin}
                  onChange={(v) => set("linkedin", v)}
                  placeholder="linkedin.com/in/yourname"
                />
                <Field
                  label="Website or portfolio"
                  value={profile.website}
                  onChange={(v) => set("website", v)}
                  placeholder="yoursite.com"
                />
              </div>
              <label className="mt-4 block">
                <span className="mb-1.5 block text-sm font-medium text-foreground">About you</span>
                <Textarea
                  value={profile.about}
                  onChange={(event) => set("about", event.target.value)}
                  placeholder="Two or three sentences about what you do and what you're known for."
                  className="min-h-36 bg-background text-sm sm:text-base leading-relaxed p-4 rounded-xl border border-border/80"
                />
              </label>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Work experience</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => set("roles", [...profile.roles, { ...emptyRole }])}
                >
                  <Plus className="size-3.5 mr-1" /> Add role
                </Button>
              </div>
              <div className="mt-5 space-y-5">
                {profile.roles.map((role, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-border/70 bg-muted/20 p-4 sm:p-5 space-y-3"
                  >
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Field
                        label="Job title"
                        value={role.title}
                        onChange={(v) =>
                          set(
                            "roles",
                            profile.roles.map((r, i) => (i === index ? { ...r, title: v } : r)),
                          )
                        }
                        placeholder="Product Designer"
                      />
                      <Field
                        label="Company"
                        value={role.company}
                        onChange={(v) =>
                          set(
                            "roles",
                            profile.roles.map((r, i) => (i === index ? { ...r, company: v } : r)),
                          )
                        }
                        placeholder="Northwind Analytics"
                      />
                      <Field
                        label="Dates"
                        value={role.dates}
                        onChange={(v) =>
                          set(
                            "roles",
                            profile.roles.map((r, i) => (i === index ? { ...r, dates: v } : r)),
                          )
                        }
                        placeholder="2021 – now"
                      />
                    </div>
                    <label className="mt-3 block">
                      <span className="mb-1.5 block text-sm font-medium text-foreground">
                        What you did — one line each
                      </span>
                      <Textarea
                        value={role.bullets}
                        onChange={(event) =>
                          set(
                            "roles",
                            profile.roles.map((r, i) =>
                              i === index ? { ...r, bullets: event.target.value } : r,
                            ),
                          )
                        }
                        placeholder={
                          "Led the reporting redesign used by 12,000 people a week\nRan the research that shaped billing"
                        }
                        className="min-h-32 bg-background text-sm sm:text-base leading-relaxed p-4 rounded-xl border border-border/80 font-mono sm:font-sans"
                      />
                    </label>
                    {profile.roles.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          set(
                            "roles",
                            profile.roles.filter((_, i) => i !== index),
                          )
                        }
                        aria-label={`Remove role ${role.title || index + 1}`}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer min-h-[44px] sm:min-h-0 py-2 sm:py-0"
                      >
                        <Trash2 className="size-3.5" /> Remove this role
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Education & skills</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => set("studies", [...profile.studies, { ...emptyStudy }])}
                >
                  <Plus className="size-3.5 mr-1" /> Add study
                </Button>
              </div>
              <div className="mt-5 space-y-4">
                {profile.studies.map((study, index) => (
                  <div
                    key={index}
                    className="grid gap-3 sm:grid-cols-3 rounded-xl border border-border/70 bg-muted/20 p-4"
                  >
                    <Field
                      label="Qualification"
                      value={study.qualification}
                      onChange={(v) =>
                        set(
                          "studies",
                          profile.studies.map((s, i) =>
                            i === index ? { ...s, qualification: v } : s,
                          ),
                        )
                      }
                      placeholder="B.Des Communication Design"
                    />
                    <Field
                      label="School"
                      value={study.school}
                      onChange={(v) =>
                        set(
                          "studies",
                          profile.studies.map((s, i) => (i === index ? { ...s, school: v } : s)),
                        )
                      }
                      placeholder="NID Ahmedabad"
                    />
                    <Field
                      label="Year"
                      value={study.dates}
                      onChange={(v) =>
                        set(
                          "studies",
                          profile.studies.map((s, i) => (i === index ? { ...s, dates: v } : s)),
                        )
                      }
                      placeholder="2018"
                    />
                  </div>
                ))}
              </div>
              <label className="mt-5 block">
                <span className="mb-1.5 block text-sm font-medium text-foreground">Skills</span>
                <Textarea
                  value={profile.skills}
                  onChange={(event) => set("skills", event.target.value)}
                  placeholder="Figma, design systems, user research, accessibility"
                  className="min-h-28 bg-background text-sm sm:text-base leading-relaxed p-4 rounded-xl border border-border/80"
                />
              </label>
              <label className="mt-4 block">
                <span className="mb-1.5 block text-sm font-medium text-foreground">
                  Certifications — one per line
                </span>
                <Textarea
                  value={profile.certifications}
                  onChange={(event) => set("certifications", event.target.value)}
                  placeholder={"Google UX Certificate, 2022"}
                  className="min-h-28 bg-background text-sm sm:text-base leading-relaxed p-4 rounded-xl border border-border/80"
                />
              </label>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Custom Sections</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Add projects, publications, awards, or custom tabs.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const id = `cs-${Date.now()}`;
                    set("customSections", [
                      ...(profile.customSections || []),
                      {
                        id,
                        title: "Key Projects",
                        content: "Lead Project Architect: Designed and shipped core platform.",
                      },
                    ]);
                  }}
                >
                  <Plus className="size-3.5 mr-1" /> Add section
                </Button>
              </div>
              <div className="mt-5 space-y-4">
                {(profile.customSections || []).map((sec, idx) => (
                  <div
                    key={sec.id}
                    className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Input
                        value={sec.title}
                        onChange={(e) =>
                          set(
                            "customSections",
                            profile.customSections.map((s, i) =>
                              i === idx ? { ...s, title: e.target.value } : s,
                            ),
                          )
                        }
                        placeholder="Section Title"
                        className="h-8 text-xs font-semibold max-w-xs"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          set(
                            "customSections",
                            profile.customSections.filter((_, i) => i !== idx),
                          )
                        }
                        aria-label={`Remove section ${sec.title || idx + 1}`}
                        className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 cursor-pointer transition-colors min-h-[44px] sm:min-h-0 py-2 sm:py-0"
                      >
                        <Trash2 className="size-3.5" /> Remove
                      </button>
                    </div>
                    <Textarea
                      value={sec.content}
                      onChange={(e) =>
                        set(
                          "customSections",
                          profile.customSections.map((s, i) =>
                            i === idx ? { ...s, content: e.target.value } : s,
                          ),
                        )
                      }
                      placeholder="Bullet points or paragraph entries (one per line)..."
                      className="min-h-18 bg-background text-xs leading-5"
                    />
                  </div>
                ))}
              </div>
            </section>

            <div className="flex flex-wrap gap-3 pt-2 w-full sm:w-auto">
              <Button variant="outline" onClick={persist} className="w-full sm:w-auto">
                <Save className="size-4 mr-1.5" /> Save profile
              </Button>
              <Button onClick={useInTailor} className="shadow-xs w-full sm:w-auto">
                Use this in the tailor <ArrowRight className="size-4 ml-1.5" />
              </Button>
            </div>
          </div>

          <aside className="lg:sticky lg:top-8 lg:self-start w-full max-w-full">
            <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden w-full max-w-full">
              <div className="border-b border-border bg-muted/40 px-5 py-3">
                <h2 className="text-sm font-semibold text-foreground">Resume preview</h2>
              </div>
              <pre className="max-h-[640px] overflow-auto whitespace-pre-wrap px-5 py-4 font-sans text-sm leading-6 text-muted-foreground break-words max-w-full">
                {preview || "Start filling in your details and the resume builds itself here."}
              </pre>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
