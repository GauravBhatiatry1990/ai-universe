import agents from '../data/agents.json';
import AppShell from '../components/AppShell';
import LivePulse from '../components/LivePulse';
import NewsGrid from '../components/NewsGrid';
import AgentExplorer from '../components/AgentExplorer';
import CategoriesGrid from '../components/CategoriesGrid';
import CommunityReviews from '../components/CommunityReviews';
import NewsletterSignup from '../components/NewsletterSignup';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q || '';

  return (
    <AppShell rightRail={<LivePulse />}>
      <div className="px-4 lg:px-8 py-8 max-w-[1100px] mx-auto space-y-12">
        <NewsGrid />
        <AgentExplorer agents={agents} initialQuery={q} />
        <CategoriesGrid />
        <CommunityReviews />
        <NewsletterSignup />
      </div>
    </AppShell>
  );
}