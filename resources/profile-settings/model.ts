export interface Profile { name: string; email: string; bio: string; updates: boolean }
export const sampleProfile: Profile = { name: "Alex Morgan", email: "alex@example.com", bio: "Building thoughtful things for the web.", updates: true };
export function validateProfile(profile: Profile): Partial<Record<"name" | "email" | "bio", string>> {
  const errors: Partial<Record<"name" | "email" | "bio", string>> = {};
  if (!profile.name.trim()) errors.name = "Enter your name.";
  else if (profile.name.trim().length > 80) errors.name = "Keep your name under 80 characters.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) errors.email = "Enter a valid email address.";
  if (profile.bio.length > 200) errors.bio = "Keep your bio under 200 characters.";
  return errors;
}
