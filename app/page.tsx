import agents from '../data/agents.json';
import Link from 'next/link';
import { Badge, Button, Container, Heading, Text } from '@radix-ui/themes';
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
        <Container size="4" className="relative isolate pt-12 pb-8 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.14),transparent_55%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_65%)]" />
          </div>
          <Badge variant="soft" color="gray" className="mb-5">
            ✨ Now featuring {agents.length}+ tools
          </Badge>
          <Heading
            size="8"
            align="center"
            as="h1"
            style={{
              backgroundImage: 'linear-gradient(to bottom, #ffffff, #a1a1aa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
            }}
          >
            Discover the Best AI Tools
          </Heading>
          <Text size="4" color="gray" align="center" as="p" className="mt-3">
            The living brain of the AI ecosystem. Discover, compare, and choose
            from {agents.length}+ AI tools across chatbots, coding, image,
            video, audio, and more.
          </Text>
          <div className="mt-6 flex justify-center">
            <Button
              size="4"
              variant="solid"
              asChild
              className="transition hover:brightness-110"
            >
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