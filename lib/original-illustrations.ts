export const originalIllustrations = [
  [
    "workspace",
    "A little workspace",
    "A comfortable desk for your next good idea.",
  ],
  [
    "ideas",
    "Room for an idea",
    "A bright thought, a few experiments, a fresh direction.",
  ],
  [
    "collaboration",
    "Better together",
    "A conversation that makes the work better.",
  ],
  [
    "analytics",
    "Up and to the right",
    "A clear picture of the progress you are making.",
  ],
  ["launch", "Ready for lift-off", "A small launch with a lot of possibility."],
  [
    "secure",
    "In safe hands",
    "A friendly illustration for security and privacy.",
  ],
  [
    "design",
    "Make it your own",
    "A little color and a considered composition.",
  ],
  [
    "inbox",
    "Something good arrived",
    "An illustration for messages, invites and updates.",
  ],
  [
    "files",
    "Everything in its place",
    "A calmer home for your projects and documents.",
  ],
  ["commerce", "A good find", "A shopping bag and a very considered purchase."],
  [
    "learning",
    "Keep being curious",
    "A book, a bookmark and a new perspective.",
  ],
  [
    "community",
    "A few good people",
    "Connections that turn a group into a community.",
  ],
] as const;

export function illustrationSvg(id: string, accent = "#8B6CF8") {
  if (!/^#[a-f0-9]{6}$/i.test(accent))
    throw new Error("Invalid illustration accent");
  const ink = "#302B46",
    peach = "#FFD3AE",
    lime = "#DBECAD",
    paper = "#FFFFFF";
  const rect = (
    x: number,
    y: number,
    w: number,
    h: number,
    fill = paper,
    r = 14,
  ) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${ink}" stroke-width="3"/>`;
  const circle = (x: number, y: number, r: number, fill = paper) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${ink}" stroke-width="3"/>`;
  const line = (d: string) =>
    `<path d="${d}" fill="none" stroke="${ink}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
  const avatar = (x: number, y: number, color: string) =>
    `${circle(x, y, 30, peach)}<path d="M${x - 29} ${y - 5}q3-45 52-22l10 20q-21-8-31-19-9 18-31 21" fill="${ink}"/>${line(`M${x - 11} ${y + 1}v2m21-2v2m-15 11q7 7 15 0`)}<path d="M${x - 48} ${y + 83}q0-55 48-55t48 55" fill="${color}" stroke="${ink}" stroke-width="3"/>`;
  const browser = `${rect(105, 90, 270, 178)}<path d="M106 124h268" stroke="${ink}" stroke-width="3"/>${[123, 137, 151].map((x) => `<circle cx="${x}" cy="108" r="3" fill="${ink}"/>`).join("")}`;
  const art: Record<string, string> = {
    workspace: `${browser}${rect(127, 145, 101, 98, accent, 8)}${line("M245 153h101m-101 22h76m-76 22h88m-88 22h58")}${line("M221 269v27m38-27v27m-60 1h82M74 306h332M99 309v34m281-34v34")}${rect(335, 259, 47, 48, lime, 8)}${line("M358 259v-47m0 25q-32 1-28-27 28-1 28 27m0-8q29-5 27-29-25 1-27 29")}`,
    ideas: `<path d="M187 217q-54-65-13-114 48-56 112-20 77 43 15 132-23 18-22 39h-70q1-19-22-37" fill="${peach}" stroke="${ink}" stroke-width="3"/>${rect(206, 252, 76, 28, accent, 6)}${rect(214, 280, 60, 20, lime, 5)}${line("M226 250v-67l-21-22m58 89v-67l21-22m-57 23h35M243 40V22m106 54 15-15M130 74l-16-16M359 166h24M98 166h24")}${circle(342, 272, 24, lime)}${circle(133, 249, 15, accent)}`,
    collaboration: `${avatar(166, 198, accent)}${avatar(314, 198, lime)}${rect(117, 71, 143, 70, paper, 18)}${line("M137 96h94m-94 22h57")}<path d="m230 141 9 20 4-22" fill="white" stroke="${ink}" stroke-width="3"/>${rect(268, 108, 95, 49, peach, 16)}${[287, 309, 331].map((x) => circle(x, 132, 3, ink)).join("")}`,
    analytics: `${browser}${rect(139, 207, 35, 38, lime, 5)}${rect(190, 177, 35, 68, peach, 5)}${rect(241, 153, 35, 92, accent, 5)}${line("M137 188 194 154l54-16 77-43m-26 0h27v26")}${circle(338, 256, 33, lime)}${line("m324 257 10 10 19-24")}`,
    launch: `<path d="M205 233q-18-75 38-163 65 70 38 164l-39 21Z" fill="${paper}" stroke="${ink}" stroke-width="3"/><path d="m205 185-38 42-9 35 48-19m76-58 37 42 9 35-48-19" fill="${accent}" stroke="${ink}" stroke-width="3"/>${circle(244, 159, 25, peach)}<path d="M225 257q-15 44 18 71 34-27 18-71" fill="${peach}" stroke="${ink}" stroke-width="3"/>${line("M214 234h60M112 155v-16m-8 8h16m229 36v-16m-8 8h16")}${circle(349, 97, 16, lime)}${circle(124, 245, 10, lime)}`,
    secure: `<path d="m240 66 112 45v89q-9 75-112 111-103-36-112-111v-89Z" fill="${lime}" stroke="${ink}" stroke-width="3"/>${rect(192, 169, 96, 80, accent)}<path d="M210 169v-23q0-38 30-38t30 38v23" fill="none" stroke="${ink}" stroke-width="7"/>${circle(240, 202, 8, paper)}${line("M240 210v15")}${circle(116, 272, 22, peach)}${circle(371, 100, 11, accent)}`,
    design: `<g transform="rotate(-12 240 180)">${rect(104, 104, 183, 147, lime)}${line("M125 132h105m-105 20h77")}</g><g transform="rotate(8 240 180)">${rect(199, 116, 176, 152, paper)}${rect(218, 137, 139, 73, accent, 9)}${line("M220 228h109m-109 18h71")}</g><path d="m141 289 116-144 22 17-116 144-29 13Z" fill="${peach}" stroke="${ink}" stroke-width="3"/>${line("m246 159 22 17m-127 113 22 17")}${circle(370, 80, 16, peach)}`,
    inbox: `${rect(107, 164, 266, 132, accent, 16)}<path d="m110 176 130 85 130-85m-260 114 82-79m177 79-82-79" fill="none" stroke="${ink}" stroke-width="3"/>${rect(152, 76, 176, 151, paper, 10)}${line("M177 109h123m-123 25h91m-91 25h109")}${circle(324, 98, 31, lime)}${line("m311 99 9 9 19-24")}`,
    files: `${rect(131, 76, 205, 198, paper, 9)}${line("M158 107h146m-146 26h112m-112 26h130")}<path d="M93 161h112l24 26h156l-19 127H108Z" fill="${accent}" stroke="${ink}" stroke-width="3"/>${rect(129, 218, 68, 39, peach, 8)}${line("M143 237h39")}${circle(356, 92, 21, lime)}`,
    commerce: `<path d="M147 145h184l19 157H127Z" fill="${accent}" stroke="${ink}" stroke-width="3"/><path d="M197 160V117q0-49 42-49t42 49v43" fill="none" stroke="${ink}" stroke-width="5"/>${rect(240, 215, 151, 91, paper, 12)}${line("M241 241h149m-128 21h41")}${rect(357, 265, 15, 13, peach, 3)}${circle(117, 115, 18, lime)}`,
    learning: `<path d="M99 107q70-25 141 16 71-41 141-16v176q-70-22-141 17-71-39-141-17Z" fill="${paper}" stroke="${ink}" stroke-width="3"/><path d="M240 125v174m-116-160q46-8 89 16m-89 15q46-8 89 16m-89 15q46-8 89 16m54-62q43-24 88-16m-88 47q43-24 88-16m-88 47q43-24 88-16" fill="none" stroke="${ink}" stroke-width="3"/><path d="M296 112v83l20-15 20 10v-89" fill="${accent}" stroke="${ink}" stroke-width="3"/>${circle(132, 74, 15, peach)}`,
    community: `<path d="M146 236 239 112l99 124Z" fill="none" stroke="${ink}" stroke-width="3" stroke-dasharray="6 9"/>${avatar(239, 97, accent)}${avatar(125, 221, peach)}${avatar(354, 221, lime)}${circle(244, 255, 21, lime)}${line("M236 255h16m-8-8v16")}`,
  };
  if (!art[id]) throw new Error("Unknown illustration");
  const name = originalIllustrations.find((item) => item[0] === id)![1];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 360" fill="none" role="img" aria-label="${name}"><title>${name}</title><metadata>Original Migbits illustration. Copyright (c) 2026 Migbits contributors. MIT License. Source and complete license are included in the download package.</metadata><rect width="480" height="360" rx="24" fill="#F7F5FC"/><ellipse cx="240" cy="328" rx="170" ry="13" fill="#E7E1F3"/><g stroke-linecap="round" stroke-linejoin="round">${art[id]}</g></svg>`;
}
