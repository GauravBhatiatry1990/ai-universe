import agents from '../../../data/agents.json';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AppShell from '../../../components/AppShell';
import ToolLogo from '../../../components/ToolLogo';
import ClaimProfileForm from '../../../components/ClaimProfileForm';

type Agent = {
  slug: string;
  name: string;
};

export default async function ClaimPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agent = (agents as Agent[]).find((a) => a.slug === slug);

  if (!agent) {
    notFound();
  }

  return (
    <AppShell>
      <div className="px-4 lg:px-8 py-8 max-w-2xl mx-auto">
        <Link
          href={`/agent/${agent.slug}`}
          className="text-purple-400 hover:text-purple-300 text-sm font-medium inline-block mb-6 transition"
        >
          ← Back to {agent.name}
        </Link>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="shrink-0">
              <ToolLogo
                slug={agent.slug}
                size={44}
                className="rounded-xl border border-white/10 bg-white/5 p-1.5"
              />
            </div>
            <h1 className="text-2xl font-semibold text-white">
              Claim this profile: {agent.name}
            </h1>
          </div>

          <p className="text-sm text-zinc-400 leading-relaxed mb-6">
            This listing is currently managed by the community. Claim it to
            control its description, contact info, and visibility once
            ownership is confirmed.
          </p>

          <ClaimProfileForm agentName={agent.name} />
        </div>
      </div>
    </AppShell>
  );
}