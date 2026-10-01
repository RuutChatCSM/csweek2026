"use client";

import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useEffectEvent, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { CardPreview } from "@/components/card/CardPreview";
import { PixelSprite } from "@/components/home/PixelSprite";
import { BrandLockup } from "@/components/site/Brand";
import { ShareActions } from "@/components/share/ShareActions";
import { applyStyle, prepareSquarePhoto } from "@/lib/photo";
import { THEME_LIST, getTheme, type ThemeId } from "@/lib/themes";
import { LIMITS, type CardData, type CelebrationMode, type EmailStatus } from "@/lib/types";

type Result = { id: string; email: { status: EmailStatus; recipientFirstName?: string } };

const STEPS = ["Who", "Photo", "About", "Message", "Send"] as const;

const ROLE_IDEAS = [
  "Customer Support Agent",
  "Customer Success Manager",
  "Support Engineer",
  "Head of Customer Experience",
  "Contact Centre Agent",
  "Community Manager",
];

const MESSAGE_IDEAS: Record<CelebrationMode, string[]> = {
  other: [
    "Thank you for always showing up for our customers and making every interaction feel human. Happy Customer Service Week!",
    "You make the hard conversations look easy. Thank you for your patience, your kindness and every extra mile.",
    "Customers remember how you made them feel. Thank you for making them feel heard.",
    "The team is better because you're on it. Happy CS Week!",
  ],
  self: [
    "This year I kept showing up, even on the hard days, and I'm proud of every customer I helped.",
    "I turned a lot of “this isn't working” into “thank you so much”. That counts.",
    "I learned, I grew, and I made customers' lives a little easier. Here's to me.",
  ],
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const firstNameOf = (name: string) => name.trim().split(/\s+/)[0] ?? "";

export function CreateFlow({ initialMode, fromEmail }: { initialMode: CelebrationMode; fromEmail: boolean }) {
  const [mode, setMode] = useState<CelebrationMode>(initialMode);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [org, setOrg] = useState("");
  const [message, setMessage] = useState("");
  const [senderName, setSenderName] = useState("");
  const [theme, setTheme] = useState<ThemeId>("ruut");
  const [rawPhoto, setRawPhoto] = useState("");
  const [photoStyle, setPhotoStyle] = useState<"duotone" | "natural">("natural");
  const [photo, setPhoto] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [sendEnabled, setSendEnabled] = useState(true);
  const [recipientFirst, setRecipientFirst] = useState("");
  const [recipientFirstTouched, setRecipientFirstTouched] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [listed, setListed] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [peekOpen, setPeekOpen] = useState(false);

  const self = mode === "self";
  const first = firstNameOf(name);
  const who = self ? "you" : first || "them";

  // Re-apply the photo treatment whenever the photo, style or theme colours change.
  const duo = getTheme(theme).duo;
  useEffect(() => {
    if (!rawPhoto) return;
    let cancelled = false;
    applyStyle(rawPhoto, photoStyle, duo).then((out) => !cancelled && setPhoto(out));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawPhoto, photoStyle, duo[0], duo[1]]);

  const effectiveRecipientFirst = recipientFirstTouched ? recipientFirst : first;

  const data: CardData = useMemo(
    () => ({ mode, name, role, org, message, photo: rawPhoto ? photo : "", theme, senderName: self ? "" : senderName }),
    [mode, name, role, org, message, photo, rawPhoto, theme, senderName, self],
  );

  const canContinue = [
    name.trim().length > 0,
    true,
    role.trim().length > 0 && org.trim().length > 0,
    message.trim().length > 0,
    self || !sendEnabled || (effectiveRecipientFirst.trim().length > 0 && EMAIL_RE.test(recipientEmail.trim())),
  ][step];

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          website: honeypot,
          listed,
          send: { enabled: !self && sendEnabled, firstName: effectiveRecipientFirst, email: recipientEmail },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong. Please try again.");
      setResult(json as Result);
      window.scrollTo({ top: 0, behavior: "smooth" });
      celebrate();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  const next = () => {
    if (!canContinue) return;
    if (step < STEPS.length - 1) setStep(step + 1);
    else void submit();
  };
  const back = () => setStep((s) => Math.max(0, s - 1));
  const onEnter = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      next();
    }
  };

  // The photo step has no text field, so let Enter advance from anywhere on the page.
  const advance = useEffectEvent(() => next());
  useEffect(() => {
    if (step !== 1 || result) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "Enter" && !["BUTTON", "INPUT", "TEXTAREA", "A"].includes(t.tagName)) advance();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, result]);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setPhotoError("");
    try {
      setRawPhoto(await prepareSquarePhoto(file));
    } catch (e) {
      setPhotoError((e as Error).message);
    }
  }

  function restart(nextMode: CelebrationMode = "other") {
    setResult(null);
    setMode(nextMode);
    setStep(0);
    setName("");
    setRole("");
    setOrg("");
    setMessage("");
    setRawPhoto("");
    setPhoto("");
    setRecipientFirst("");
    setRecipientFirstTouched(false);
    setRecipientEmail("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const preview = <CardPreview data={data} className="shadow-[0_40px_80px_-30px_rgba(22,22,26,.55)]" />;

  return (
    <div className="relative min-h-dvh">
      <div aria-hidden className="dot-grid pointer-events-none fixed inset-0 opacity-70" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-8">
        <BrandLockup />
        {!result && <Progress step={step} onJump={(i) => i < step && setStep(i)} />}
      </header>

      <main className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 pb-24 pt-4 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,480px)] lg:gap-16 lg:pt-10">
        <section className="min-w-0">
          {result ? (
            <Done result={result} data={data} listed={listed} onRestart={restart} />
          ) : (
            <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {fromEmail && step === 0 && (
                <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-bold text-paper">
                  <span aria-hidden>💌</span> Someone celebrated you. Now pass it on.
                </p>
              )}
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-ink/50">
                Mile {step + 1} of {STEPS.length}
              </p>

              {step === 0 && (
                <Step
                  title={self ? "Let’s celebrate you." : "Who are we celebrating?"}
                  lede={
                    self
                      ? "Customer support isn’t always easy. Take a moment to celebrate yourself and the work you’ve done this year."
                      : "Think of someone who makes customers feel looked after. A teammate, a lead, the agent who saved your week."
                  }
                >
                  <div className="mb-8 inline-flex rounded-full border-2 border-ink bg-white p-1" role="radiogroup" aria-label="Who is this card for?">
                    {(["other", "self"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        role="radio"
                        aria-checked={mode === m}
                        onClick={() => setMode(m)}
                        className={`rounded-full px-4 py-2 text-sm font-bold transition ${mode === m ? "bg-ink text-paper" : "text-ink/70 hover:text-ink"}`}
                      >
                        {m === "other" ? "Someone else" : "Myself 🎉"}
                      </button>
                    ))}
                  </div>
                  <BigInput
                    label={self ? "Your name" : "Their name"}
                    value={name}
                    onChange={setName}
                    onKeyDown={onEnter}
                    placeholder={self ? "Your full name" : "e.g. Amara Okafor"}
                    maxLength={LIMITS.name}
                    autoFocus
                    autoComplete={self ? "name" : "off"}
                  />
                </Step>
              )}

              {step === 1 && (
                <Step
                  title={self ? "Add your best photo." : `Add a photo of ${who}.`}
                  lede="A clear, smiley headshot works best. It stays on your device until you create the card."
                >
                  <PhotoPicker
                    photo={rawPhoto ? photo || rawPhoto : ""}
                    error={photoError}
                    onFile={onFile}
                    onRemove={() => {
                      setRawPhoto("");
                      setPhoto("");
                    }}
                  />
                  {rawPhoto && (
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <span className="text-sm font-bold">Photo style</span>
                      {(["natural", "duotone"] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setPhotoStyle(s)}
                          aria-pressed={photoStyle === s}
                          className={`rounded-full border-2 border-ink px-4 py-1.5 text-sm font-bold transition ${photoStyle === s ? "bg-ink text-paper" : "bg-white hover:bg-road"}`}
                        >
                          {s === "duotone" ? "Duotone" : "Original colours"}
                        </button>
                      ))}
                    </div>
                  )}
                </Step>
              )}

              {step === 2 && (
                <Step title={self ? "Tell us about you." : `What does ${who} do?`} lede="This goes right under the name on the card.">
                  <BigInput
                    label="Role / job title"
                    value={role}
                    onChange={setRole}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), document.getElementById("org")?.focus())}
                    placeholder="e.g. Senior Support Specialist"
                    maxLength={LIMITS.role}
                    autoFocus
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {ROLE_IDEAS.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className="rounded-full border border-ink/20 bg-white/80 px-3 py-1.5 text-sm font-semibold transition hover:border-ink hover:bg-road"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <div className="mt-8">
                    <BigInput
                      id="org"
                      label="Organisation"
                      value={org}
                      onChange={setOrg}
                      onKeyDown={onEnter}
                      placeholder="e.g. Ruut"
                      maxLength={LIMITS.org}
                      autoComplete="organization"
                    />
                  </div>
                </Step>
              )}

              {step === 3 && (
                <Step
                  title={self ? "What are you proud of this year?" : `What would you like to tell ${who}?`}
                  lede={self ? "Big or small. You earned this." : "Say it like you would in person. Short and heartfelt wins."}
                >
                  <label className="block">
                    <span className="sr-only">Your message</span>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value.slice(0, LIMITS.message))}
                      onKeyDown={onEnter}
                      rows={4}
                      autoFocus
                      placeholder={self ? "This year I…" : "Thank you for…"}
                      className="w-full resize-none rounded-3xl border-2 border-ink bg-white p-5 font-serif text-2xl italic leading-snug shadow-[5px_5px_0_#141414] outline-none transition placeholder:text-ink/30 focus:shadow-[5px_5px_0_#F6C343] sm:text-3xl"
                    />
                  </label>
                  <div className="mt-2 flex justify-end text-sm font-semibold text-ink/50">
                    {message.length}/{LIMITS.message}
                  </div>
                  <p className="mt-4 text-sm font-bold">Need a nudge?</p>
                  <div className="mt-2 flex flex-col gap-2">
                    {MESSAGE_IDEAS[mode].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMessage(m)}
                        className="rounded-2xl border border-ink/15 bg-white/80 px-4 py-3 text-left font-serif text-lg italic leading-snug transition hover:border-ink hover:bg-road/60"
                      >
                        “{m}”
                      </button>
                    ))}
                  </div>
                  {!self && (
                    <div className="mt-8 max-w-sm">
                      <SmallInput
                        label="From (your name, optional)"
                        value={senderName}
                        onChange={setSenderName}
                        placeholder="So they know who’s celebrating them"
                        maxLength={LIMITS.senderName}
                        autoComplete="name"
                        onKeyDown={onEnter}
                      />
                    </div>
                  )}
                </Step>
              )}

              {step === 4 && (
                <Step
                  title={self ? "Looking good. Ready?" : `Ready to celebrate ${who}?`}
                  lede="Pick a colourway, then create the card. You can share it anywhere once it’s made."
                >
                  <div className="lg:hidden">{preview}</div>
                  <div className="mt-6 lg:mt-0">
                    <ThemePicker value={theme} onChange={setTheme} />
                  </div>

                  {!self && (
                    <div className="mt-8 rounded-3xl border-2 border-ink bg-white p-5 shadow-[5px_5px_0_#141414] sm:p-6">
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={sendEnabled}
                          onChange={(e) => setSendEnabled(e.target.checked)}
                          className="mt-1 h-5 w-5 shrink-0 accent-ink"
                        />
                        <span>
                          <span className="block text-lg font-bold">Send this celebration directly to {who}</span>
                          <span className="block text-sm text-ink/60">
                            They’ll get a beautiful email with their card, delivered by Convert by Ruut.
                          </span>
                        </span>
                      </label>
                      {sendEnabled && (
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                          <SmallInput
                            label="Their first name"
                            value={effectiveRecipientFirst}
                            onChange={(v) => {
                              setRecipientFirstTouched(true);
                              setRecipientFirst(v);
                            }}
                            maxLength={LIMITS.name}
                            onKeyDown={onEnter}
                          />
                          <SmallInput
                            label="Their email address"
                            type="email"
                            value={recipientEmail}
                            onChange={setRecipientEmail}
                            placeholder="name@company.com"
                            maxLength={254}
                            onKeyDown={onEnter}
                            inputMode="email"
                          />
                          <div className="sm:col-span-2">
                            <SmallInput
                              label="Your name (shown in the email)"
                              value={senderName}
                              onChange={setSenderName}
                              placeholder="Optional"
                              maxLength={LIMITS.senderName}
                              autoComplete="name"
                              onKeyDown={onEnter}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl bg-white/70 p-4">
                    <input
                      type="checkbox"
                      checked={listed}
                      onChange={(e) => setListed(e.target.checked)}
                      className="mt-1 h-5 w-5 shrink-0 accent-ink"
                    />
                    <span>
                      <span className="block font-bold">Add this celebration to the public wall</span>
                      <span className="block text-sm text-ink/60">
                        Name, role, organisation, photo and message appear on the home page. Email addresses are never shown.
                      </span>
                    </span>
                  </label>
                  {/* Honeypot: hidden from people, irresistible to bots */}
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    className="absolute left-[-9999px] h-0 w-0 opacity-0"
                    aria-hidden
                  />
                </Step>
              )}

              {error && (
                <p role="alert" className="mt-6 rounded-2xl bg-stop/20 px-4 py-3 font-semibold text-ink">
                  {error}
                </p>
              )}

              <div className="mt-10 flex items-center gap-4">
                {step > 0 && (
                  <button type="button" onClick={back} className="rounded-full px-4 py-3 font-bold text-ink/60 transition hover:text-ink">
                    ← Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={next}
                  disabled={!canContinue || submitting}
                  className="group inline-flex items-center gap-3 rounded-full bg-ink py-3.5 pl-6 pr-3.5 text-lg font-bold text-paper transition enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  {step === STEPS.length - 1
                    ? submitting
                      ? "Creating your card…"
                      : !self && sendEnabled
                        ? "Create & send card"
                        : "Create my card"
                    : step === 1 && !rawPhoto
                      ? "Skip, use initials"
                      : "Continue"}
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-road text-ink transition-transform group-enabled:group-hover:translate-x-1">
                    {step === STEPS.length - 1 ? "🎉" : "→"}
                  </span>
                </button>
                {step < STEPS.length - 1 && canContinue && (
                  <span className="hidden text-sm text-ink/40 sm:inline">
                    or press <kbd className="rounded border border-ink/20 bg-white px-1.5 py-0.5 font-sans text-xs">Enter</kbd>
                  </span>
                )}
              </div>
            </motion.div>
            </AnimatePresence>
          )}
        </section>

        {/* Live preview (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-8">
            {result ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/cards/${result.id}/image`}
                alt={`CS Week card for ${data.name}`}
                className="pop w-full rounded-[clamp(14px,3.6%,40px)] shadow-[0_40px_80px_-30px_rgba(22,22,26,.55)]"
              />
            ) : (
              <>
                <div className="-rotate-1 transition-transform duration-500 hover:rotate-0">{preview}</div>
                {step !== 4 && (
                  <div className="mt-6">
                    <ThemePicker value={theme} onChange={setTheme} compact />
                  </div>
                )}
              </>
            )}
          </div>
        </aside>
      </main>

      {/* Live preview (mobile): a peek thumbnail that expands */}
      {!result && step !== 4 && (
        <>
          <button
            type="button"
            onClick={() => setPeekOpen(true)}
            className="fixed bottom-4 right-4 z-30 w-[96px] rotate-3 rounded-xl ring-4 ring-paper drop-shadow-xl transition hover:rotate-0 lg:hidden"
            aria-label="Open card preview"
          >
            <CardPreview data={data} />
            <span className="absolute -left-3 -top-3 rounded-full bg-ink px-2 py-0.5 text-[11px] font-bold text-paper">Live</span>
          </button>
          {peekOpen && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Card preview"
              className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-ink/80 p-6 backdrop-blur lg:hidden"
              onClick={() => setPeekOpen(false)}
            >
              <div className="pop w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                {preview}
                <div className="mt-4">
                  <ThemePicker value={theme} onChange={setTheme} compact dark />
                </div>
              </div>
              <button type="button" className="rounded-full bg-paper px-5 py-2 font-bold" onClick={() => setPeekOpen(false)}>
                Keep editing
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function celebrate() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const colors = ["#F6C343", "#0059FF", "#CADB8A", "#8E55D9", "#FF6B4A"];
  confetti({ particleCount: 140, spread: 90, origin: { y: 0.3 }, colors });
  window.setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0 }, colors }), 250);
  window.setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1 }, colors }), 400);
}

function Progress({ step, onJump }: { step: number; onJump: (i: number) => void }) {
  return (
    <nav aria-label="Progress" className="hidden items-center gap-1 sm:flex">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-1">
          {i > 0 && (
            <div aria-hidden className={`h-1 w-6 rounded-full md:w-10 ${i <= step ? "text-ink" : "text-ink/20"}`}>
              <div className="road-dashes h-full" style={{ backgroundSize: "10px 100%" }} />
            </div>
          )}
          <button
            type="button"
            onClick={() => onJump(i)}
            disabled={i >= step}
            aria-current={i === step ? "step" : undefined}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition ${
              i === step ? "bg-ink text-paper" : i < step ? "bg-road text-ink hover:bg-ink hover:text-paper" : "text-ink/40"
            }`}
          >
            {i < step ? "✓" : i + 1}
            <span className="hidden md:inline">{label}</span>
          </button>
        </div>
      ))}
    </nav>
  );
}

function Step({ title, lede, children }: { title: string; lede: string; children: ReactNode }) {
  return (
    <div>
      <h1 className="poster mt-3 max-w-3xl text-balance text-[clamp(44px,6.4vw,96px)] leading-[0.92]">
        {title}
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink/65">{lede}</p>
      <div className="mt-8">{children}</div>
    </div>
  );
}

type InputProps = {
  id?: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  maxLength?: number;
  autoFocus?: boolean;
  autoComplete?: string;
  type?: string;
  inputMode?: "email" | "text";
};

function BigInput({ id, label, value, onChange, ...rest }: InputProps) {
  return (
    <label className="block max-w-2xl">
      <span className="text-sm font-bold">{label}</span>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full border-b-4 border-ink bg-transparent py-2 font-display text-4xl font-extrabold tracking-tight outline-none transition placeholder:text-ink/20 focus:border-highway sm:text-5xl"
        {...rest}
      />
    </label>
  );
}

function SmallInput({ id, label, value, onChange, ...rest }: InputProps) {
  return (
    <label className="block">
      <span className="text-sm font-bold">{label}</span>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 block w-full rounded-xl border-2 border-ink/80 bg-white px-3.5 py-2.5 text-base font-semibold outline-none transition placeholder:font-normal placeholder:text-ink/35 focus:border-ink focus:ring-4 focus:ring-road/60"
        {...rest}
      />
    </label>
  );
}

function PhotoPicker({
  photo,
  error,
  onFile,
  onRemove,
}: {
  photo: string;
  error: string;
  onFile: (f: File | undefined) => void;
  onRemove: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          onFile(e.dataTransfer.files[0]);
        }}
        className={`flex flex-col items-center gap-5 rounded-[2rem] border-[3px] border-dashed p-6 text-center transition sm:flex-row sm:text-left ${
          over ? "border-highway bg-highway/5" : "border-ink/40 bg-white/70"
        }`}
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="Selected photo" className="h-36 w-36 -rotate-3 rounded-3xl border-[6px] border-white object-cover shadow-lg" />
        ) : (
          <div className="grid h-36 w-36 shrink-0 place-items-center rounded-3xl bg-road">
            <PixelSprite name="headset" color="#E23B2E" className="h-20 w-20" />
          </div>
        )}
        <div>
          <p className="poster text-3xl">{photo ? "Looking great." : "Drop a photo here"}</p>
          <p className="mt-1 text-ink/60">JPG or PNG. We’ll crop it to a square.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
            <button
              type="button"
              onClick={() => input.current?.click()}
              className="rounded-full border-2 border-ink bg-white px-5 py-2.5 font-bold transition hover:bg-road"
            >
              {photo ? "Change photo" : "Choose a photo"}
            </button>
            {photo && (
              <button type="button" onClick={onRemove} className="rounded-full px-4 py-2.5 font-bold text-ink/60 hover:text-ink">
                Remove
              </button>
            )}
          </div>
        </div>
        <input
          ref={input}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      {error && (
        <p role="alert" className="mt-3 font-semibold text-stop">
          {error}
        </p>
      )}
    </div>
  );
}

function ThemePicker({
  value,
  onChange,
  compact = false,
  dark = false,
}: {
  value: ThemeId;
  onChange: (t: ThemeId) => void;
  compact?: boolean;
  dark?: boolean;
}) {
  return (
    <fieldset>
      <legend className={`mb-3 text-sm font-bold ${dark ? "text-paper" : ""}`}>Colourway</legend>
      <div className="flex flex-wrap gap-2">
        {THEME_LIST.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            aria-pressed={value === t.id}
            className={`flex items-center gap-2 rounded-full border-2 py-1 pl-1 text-sm font-bold transition ${
              compact ? "pr-1" : "pr-4"
            } ${value === t.id ? "border-ink bg-white shadow-[3px_3px_0_#141414]" : "border-transparent bg-white/70 hover:border-ink/40"}`}
            title={t.label}
          >
            <span className="h-7 w-7 rounded-full border border-ink/20" style={{ background: `linear-gradient(135deg, ${t.bg} 55%, ${t.panel} 55%)` }} />
            <span className={compact ? "sr-only" : ""}>{t.label}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Done({
  result,
  data,
  listed,
  onRestart,
}: {
  result: Result;
  data: CardData;
  listed: boolean;
  onRestart: (mode?: CelebrationMode) => void;
}) {
  // Only ever rendered after a client-side submit, so `window` is available.
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const url = `${origin}/c/${result.id}`;
  const self = data.mode === "self";
  const recipient = result.email.recipientFirstName;

  return (
    <div className="pop">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-ink/50">You went the extra mile</p>
      <h1 className="poster mt-3 max-w-3xl text-[clamp(48px,7vw,104px)] leading-[0.92]">
        {self ? "Here’s to you. 🎉" : `${firstNameOf(data.name)}’s card is ready.`}
      </h1>

      {result.email.status === "sent" && (
        <Notice tone="lime">
          📬 On its way to {recipient}. Delivered with <strong>Convert by Ruut</strong>.
        </Notice>
      )}
      {result.email.status === "queued_dev" && (
        <Notice tone="signal">
          📬 Email to {recipient} prepared (dev mode, Convert isn’t configured yet).{" "}
          <a className="font-bold underline" href={`/dev/outbox/${result.id}`} target="_blank" rel="noreferrer">
            Preview the email
          </a>
        </Notice>
      )}
      {result.email.status === "failed" && (
        <Notice tone="coral">
          We couldn’t send the email to {recipient} just now. Copy the link below and send it to them directly.
        </Notice>
      )}

      <div className="mt-8 lg:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/cards/${result.id}/image`}
          alt={`CS Week card for ${data.name}`}
          className="w-full rounded-2xl shadow-[0_30px_60px_-20px_rgba(22,22,26,.5)]"
        />
      </div>

      <h2 className="poster mt-10 text-4xl">Share the celebration</h2>
      <p className="mt-1 text-ink/60">
        Post it, send it, drop it in your team channel.{" "}
        {origin && (
          <>
            <Link href={`/c/${result.id}`} className="font-semibold text-ink underline decoration-road decoration-2 underline-offset-2">
              View the card page
            </Link>
            {listed && (
              <>
                {" · "}
                <Link href="/#wall" className="font-semibold text-ink underline decoration-road decoration-2 underline-offset-2">
                  See it on the wall
                </Link>
              </>
            )}
          </>
        )}
      </p>
      <div className="mt-5 max-w-2xl">
        {origin && <ShareActions id={result.id} name={data.name} role={data.role} org={data.org} self={self} url={url} />}
      </div>

      <div className="mt-10 rounded-[2rem] bg-ink p-7 text-paper sm:p-9">
        <p className="font-serif text-2xl italic text-paper/70">Keep the road trip going</p>
        <p className="poster mt-1 text-4xl sm:text-5xl">Who else goes the extra mile?</p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => onRestart("other")}
            className="group inline-flex items-center gap-3 rounded-full bg-road py-3 pl-6 pr-3 text-lg font-bold text-ink transition hover:-translate-y-0.5"
          >
            Celebrate someone else
            <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-road transition-transform group-hover:translate-x-1">
              →
            </span>
          </button>
          {!self && (
            <button type="button" onClick={() => onRestart("self")} className="font-serif text-xl italic underline decoration-road underline-offset-4">
              Or celebrate yourself 🎉
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Notice({ tone, children }: { tone: "lime" | "signal" | "coral"; children: ReactNode }) {
  const bg = { lime: "bg-glow/50", signal: "bg-road", coral: "bg-stop/25" }[tone];
  return <p className={`mt-6 max-w-2xl rounded-2xl ${bg} px-5 py-4 text-base font-semibold`}>{children}</p>;
}
