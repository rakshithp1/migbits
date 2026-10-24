"use client";
import { useId, useState, type CSSProperties, type FormEvent } from "react";
import { defaultPreset, presetVariables, type BrandPreset } from "../../tokens/preset";
import { sampleProfile, validateProfile, type Profile } from "./model";
import "./profile-settings.css";

export type PreviewState = "default" | "loading" | "error" | "empty" | "success";
export function ProfileSettings({ preset = defaultPreset, initialProfile = sampleProfile, state = "default", onSave }: { preset?: BrandPreset; initialProfile?: Profile; state?: PreviewState; onSave?: (profile: Profile) => Promise<void> }) {
  const id = useId();
  const [profile, setProfile] = useState<Profile>(state === "empty" ? { name: "", email: "", bio: "", updates: false } : initialProfile);
  const [errors, setErrors] = useState<ReturnType<typeof validateProfile>>({});
  const [result, setResult] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  const saving = state === "loading" || result === "saving";
  const failed = state === "error" || result === "failed";
  const saved = state === "success" || result === "saved";
  const update = (patch: Partial<Profile>) => { setProfile(current => ({ ...current, ...patch })); setResult("idle"); };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (saving) return;
    const validation = validateProfile(profile); setErrors(validation);
    if (Object.keys(validation).length) { const first = Object.keys(validation)[0]; event.currentTarget.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus(); return; }
    if (!onSave) { setResult("failed"); return; }
    setResult("saving");
    try { await onSave({ ...profile, name: profile.name.trim(), email: profile.email.trim() }); setResult("saved"); } catch { setResult("failed"); }
  };
  return <div className="mb-profile" data-theme={preset.theme} style={presetVariables(preset) as CSSProperties}><div className="mb-profile-heading"><div><span className="mb-profile-kicker">YOUR WORKSPACE</span><h2>Personal profile</h2><p>A little about the person behind the work.</p></div><span className="mb-profile-avatar" aria-hidden="true">{profile.name.trim().split(/\s+/).map(part=>part[0]).slice(0,2).join("").toUpperCase() || "+"}</span></div><form onSubmit={submit} noValidate aria-busy={saving}><fieldset disabled={saving}><legend className="mb-sr-only">Profile details</legend><div className="mb-profile-row"><div><label htmlFor={`${id}-name`}>Full name</label><input id={`${id}-name`} name="name" autoComplete="name" value={profile.name} maxLength={81} onChange={e=>update({name:e.target.value})} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name?`${id}-name-error`:undefined}/>{errors.name&&<p className="mb-field-error" id={`${id}-name-error`}>{errors.name}</p>}</div><div><label htmlFor={`${id}-email`}>Email address</label><input id={`${id}-email`} name="email" type="email" autoComplete="email" value={profile.email} onChange={e=>update({email:e.target.value})} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email?`${id}-email-error`:undefined}/>{errors.email&&<p className="mb-field-error" id={`${id}-email-error`}>{errors.email}</p>}</div></div><label htmlFor={`${id}-bio`}>Short bio <span>Optional</span></label><textarea id={`${id}-bio`} name="bio" rows={3} maxLength={201} value={profile.bio} onChange={e=>update({bio:e.target.value})} aria-invalid={Boolean(errors.bio)} aria-describedby={`${id}-bio-help${errors.bio?` ${id}-bio-error`:""}`}/><div className="mb-field-help" id={`${id}-bio-help`}><span>A sentence or two is plenty.</span><span>{profile.bio.length}/200</span></div>{errors.bio&&<p className="mb-field-error" id={`${id}-bio-error`}>{errors.bio}</p>}<label className="mb-profile-toggle"><span><strong>Product updates</strong><small>Occasional news about what&apos;s new.</small></span><input type="checkbox" checked={profile.updates} onChange={e=>update({updates:e.target.checked})}/></label></fieldset>{failed&&<p className="mb-profile-alert" role="alert">We couldn&apos;t save your changes. Your edits are still here. Please try again.</p>}{saved&&<p className="mb-profile-success" role="status">Profile saved. You&apos;re all set.</p>}<div className="mb-profile-actions"><span>Your details stay in your workspace.</span><button type="submit" disabled={saving}>{saving?"Saving changes...":"Save changes"}<span aria-hidden="true">&#8599;</span></button></div></form></div>;
}
