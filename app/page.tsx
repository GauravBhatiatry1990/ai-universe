import agents from '../data/agents.json';
import AppShell from '../components/AppShell';
import LivePulse from '../components/LivePulse';
import NewsGrid from '../components/NewsGrid';
import Matchmaker from '../components/Matchmaker';
import AgentExplorer from '../components/AgentExplorer';
import CommunityReviews from '../components/CommunityReviews';
import CategoriesGrid from '../components/CategoriesGrid';
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
        <Matchmaker agents={agents} />
        <AgentExplorer agents={agents} initialQuery={q} />
        <CommunityReviews />
        <CategoriesGrid />
        <NewsletterSignup />
      </div>
    </AppShell>
  );
}