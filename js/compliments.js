// ── Compliment System ──────────────────────────────────────────
// 30 sincere, warm, real compliments — written for Anna specifically.
// Not generic. Not performative. Just true.

export const compliments = [
  "You have this rare ability to make people feel seen without even trying. That's not a skill — that's a gift.",
  "The way you love things — fully, without apology — is one of the most beautiful things about you.",
  "You are softer than the world deserves and stronger than it gives you credit for.",
  "Your aesthetic sense is genuinely extraordinary. You see beauty in things most people scroll past.",
  "You carry your Cancer heart like armour and like a garden at the same time. That takes courage.",
  "There is no one else who could be you. That sentence sounds simple but it means everything.",
  "The way you dress is a whole language. You say things without a word and people listen.",
  "You are the kind of person Ginju chose — and animals always know.",
  "You built something real at NIFT with your own hands. That degree belongs to you in every sense.",
  "Your presence in a room changes the temperature of it. Not loudly. Just softly. Irreversibly.",
  "You feel things deeply and you survive them beautifully — not despite each other, but because of each other.",
  "You are not too much. You have never been too much. You are exactly enough and then some.",
  "The things you love — Rumi, red lips, moonlight, black dresses — they all make perfect sense together because they are all you.",
  "You have this quality of making ordinary moments feel like they matter. They do. Because you're in them.",
  "McLaren didn't deserve to be your team but here we are and now they have to live up to you.",
  "You are someone people remember. Not because you try to be memorable. Because you simply are.",
  "The moon on the night you were born was doing something right. We all felt it eventually.",
  "Your laugh is genuinely one of those sounds that makes a room relax. Don't underestimate that.",
  "You are building something — a life, a self, a vision — and it is already gorgeous from the outside.",
  "Ginju picked you on purpose. Cats are very deliberate about these things.",
  "The world has tried to make you smaller and you have remained, stubbornly, exactly yourself. Respect.",
  "You are the person in the story who doesn't know she's the main character. She always was.",
  "Your taste is a whole archive. Someone should study it seriously.",
  "You wear softness and fierceness in the same outfit and somehow it always works.",
  "Every version of you — the tired one, the glowing one, the messy one — is worth showing up for.",
  "You are someone people write songs about without realising it.",
  "The way you love the things you love — completely, loyally, intensely — is a template for how to be human.",
  "You have made it to 25 carrying things most people don't know about. That is not small. That is enormous.",
  "Bunny is not just a nickname. It is a whole character arc. And you live it every single day.",
  "You are real in a world full of performances. That is the rarest thing."
];

// Returns a different compliment each day (cycles through the list)
export function getDailyCompliment() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  );
  return compliments[dayOfYear % compliments.length];
}

// Returns a truly random compliment (for pop triggers)
export function getRandomCompliment() {
  return compliments[Math.floor(Math.random() * compliments.length)];
}
