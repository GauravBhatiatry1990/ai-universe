import agents from '../data/agents.json';

export type AgentMeta = { slug: string; name: string; tagline: string };

const INDEX = new Map<string, AgentMeta>();
for (const a of agents as AgentMeta[]) {
  INDEX.set(a.slug, a);
}

export function getAgentMeta(slug: string): AgentMeta | null {
  return INDEX.get(slug) ?? null;
}