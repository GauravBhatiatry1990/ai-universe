import agents from '../data/agents.json';
import Link from 'next/link';
import { Container, Heading, Text, Button } from '@radix-ui/themes';
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
        <Container size="4" className="pt-8 pb-4">
          <Heading size="8" align="center" as="h1">
            Discover the Best AI Tools
          </Heading>
          <Text size="4" color="gray" align="center" as="p" className="mt-3">
            The living brain of the AI ecosystem. Discover, compare, and choose
            from 46+ AI tools across chatbots, coding, image, video, audio, and
            more.
          </Text>
          <div className="mt-6 flex justify-center">
            <Button size="3" variant="solid" asChild>
              <Link href="/#tools">Browse All Tools</Link>
            </Button>
          </div>
        </Container>
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