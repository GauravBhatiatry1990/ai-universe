export type DifficultyLevel = 'beginner' | 'intermediate' | 'expert';

export type MatchAgent = {
  slug: string;
  name: string;
  tagline?: string;
  category: string;
  pricing?: string;
  difficulty?: string;
  featured?: boolean;
  url?: string;
};

export type UseCaseOption = {
  id: string;
  label: string;
  categories: string[];
};

export const USE_CASES: UseCaseOption[] = [
  { id: 'chat', label: 'Chat & AI assistants', categories: ['Chatbots & LLMs'] },
  { id: 'coding', label: 'Coding & dev tools', categories: ['Coding', 'Agents & Frameworks'] },
  { id: 'writing', label: 'Writing & content', categories: ['Writing'] },
  { id: 'images', label: 'Images & design', categories: ['Image', 'Design'] },
  { id: 'video', label: 'Video creation', categories: ['Video'] },
  { id: 'audio', label: 'Audio & voice', categories: ['Audio'] },
  { id: 'research', label: 'Research & learning', categories: ['Research'] },
  { id: 'search', label: 'Search & knowledge', categories: ['Search', 'Note-Taking'] },
  { id: 'productivity', label: 'Productivity & work', categories: ['Productivity'] },
  { id: 'presentations', label: 'Presentations & slides', categories: ['Presentations'] },
  { id: 'automation', label: 'Automation & no-code', categories: ['Integration & Automation', 'Website Builders'] },
];

export const BUDGET_OPTIONS: { id: string; label: string; limit: number | null }[] = [
  { id: 'free', label: 'Free only', limit: null },
  { id: 'under10', label: 'Under $10/mo', limit: 10 },
  { id: 'under25', label: 'Under $25/mo', limit: 25 },
  { id: 'any', label: 'No budget limit', limit: Infinity },
];

export const SKILL_LEVELS: DifficultyLevel[] = ['beginner', 'intermediate', 'expert'];

function parseAmounts(pricing: string): number[] {
  return Array.from(pricing.matchAll(/\$(\d+(?:\.\d+)?)/g), (m) => Number.parseFloat(m[1]));
}

export function parsePricing(pricing: string = ''): { free: boolean; cheapestPaid: number | null } {
  const text = pricing.toLowerCase();
  const amounts = parseAmounts(text);
  const containsDollar = /[$]/.test(text);
  const free = text.includes('free') || text.includes('open-source') || !containsDollar;
  return { free, cheapestPaid: amounts.length ? Math.min(...amounts) : null };
}

const SKILL_INDEX: Record<DifficultyLevel, number> = { beginner: 0, intermediate: 1, expert: 2 };

export function skillPoints(tool: MatchAgent, chosen: DifficultyLevel): number {
  const raw = tool.difficulty;
  const level: DifficultyLevel =
    raw === 'beginner' || raw === 'intermediate' || raw === 'expert' ? raw : 'intermediate';
  const diff = Math.abs(SKILL_INDEX[level] - SKILL_INDEX[chosen]);
  return 3 - diff;
}

export function budgetPoints(tool: MatchAgent, budgetId: string): number {
  const option = BUDGET_OPTIONS.find((b) => b.id === budgetId);
  const { free, cheapestPaid } = parsePricing(tool.pricing);
  if (option?.id === 'free') return free ? 3 : 0;
  if (option?.id === 'any') return 3;
  if (option?.limit == null) return 0;
  if (free) return 3;
  if (cheapestPaid === null) return 1;
  if (cheapestPaid <= option.limit) return 3;
  if (cheapestPaid <= option.limit * 1.5) return 2;
  return 1;
}

export function useCasePoints(tool: MatchAgent, useCaseId: string): number {
  const option = USE_CASES.find((u) => u.id === useCaseId);
  if (!option) return 0;
  return option.categories.includes(tool.category) ? 3 : 0;
}

export type MatchAnswers = { useCase?: string; budget?: string; skill?: string };

export function scoreTools(agents: MatchAgent[], answers: MatchAnswers) {
  return agents
    .map((agent) => {
      let score = 0;
      if (answers.useCase) score += useCasePoints(agent, answers.useCase);
      if (answers.budget) score += budgetPoints(agent, answers.budget);
      if (answers.skill) score += skillPoints(agent, answers.skill as DifficultyLevel);
      if (agent.featured) score += 1;
      return { agent, score };
    })
    .filter((m) => m.score >= 5)
    .sort((a, b) => b.score - a.score || a.agent.name.localeCompare(b.agent.name));
}