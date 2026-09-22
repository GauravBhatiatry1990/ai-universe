import Link from 'next/link';

type Plan = {
  name: string;
  price: string;
  period?: string;
  tagline: string;
  cta: string;
  ctaHref: string;
  highlight?: boolean;
  badge?: string;
  features: string[];
};

const PLANS: Plan[] = [
  {
    name: 'Free Listing',
    price: '$0',
    tagline: 'Get your tool discovered by the AI community.',
    cta: 'Submit your tool',
    ctaHref: '/submit',
    features: [
      'Standard tool page',
      'Indexed by Google',
      'Category placement',
      'Community visibility',
    ],
  },
  {
    name: 'Fast Track',
    price: '$49',
    period: 'one-time',
    tagline: 'Skip the queue. Get reviewed and live within 24 hours.',
    cta: 'Get Fast Track',
    ctaHref: 'mailto:hello@getaicosmos.com?subject=Fast%20Track%20Request',
    badge: 'Most popular',
    features: [
      'Everything in Free',
      'Priority review (24h)',
      'Dofollow backlink',
      'Logo + branding',
      'Featured badge for 30 days',
    ],
  },
  {
    name: 'Featured',
    price: '$99',
    period: '/month',
    tagline: 'Stay at the top of your category. Get real clicks.',
    cta: 'Get Featured',
    ctaHref: 'mailto:hello@getaicosmos.com?subject=Featured%20Listing%20Request',
    highlight: true,
    features: [
      'Everything in Fast Track',
      'Homepage featured slot',
      'Top of category placement',
      'Verified badge',
      'Click tracking dashboard',
      'Monthly performance report',
    ],
  },
  {
    name: 'Premium Spotlight',
    price: '$299',
    period: '/month',
    tagline: 'Maximum visibility. For funded startups ready to scale.',
    cta: 'Contact sales',
    ctaHref: 'mailto:hello@getaicosmos.com?subject=Premium%20Spotlight%20Request',
    features: [
      'Everything in Featured',
      'Hero placement on homepage',
      'Newsletter mention (2.8K+ subs)',
      'Social media push',
      'Dedicated account manager',
      'Custom analytics export',
    ],
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/"
          className="text-purple-600 hover:text-purple-700 text-sm font-medium inline-block mb-6"
        >
          ← Back to home
        </Link>

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-200 bg-purple-50 text-purple-700 text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            Get discovered by the AI community
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Simple, honest pricing
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            List your AI tool for free — forever. Upgrade only when you want
            more visibility.
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={
                'relative rounded-2xl border p-6 flex flex-col transition ' +
                (plan.highlight
                  ? 'border-purple-300 bg-gradient-to-b from-purple-50/60 to-white shadow-lg shadow-purple-100/50'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md')
              }
            >
              {plan.badge && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
                  {plan.badge}
                </span>
              )}

              <h2 className="text-lg font-bold text-gray-900 mb-1">
                {plan.name}
              </h2>

              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-3xl font-black text-gray-900">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-sm text-gray-500">{plan.period}</span>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-5 min-h-[40px]">
                {plan.tagline}
              </p>

              <a
                href={plan.ctaHref}
                className={
                  'block text-center rounded-lg px-4 py-2.5 text-sm font-semibold transition mb-5 ' +
                  (plan.highlight
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-md shadow-purple-200'
                    : 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-900')
                }
              >
                {plan.cta}
              </a>

              <ul className="space-y-2 mt-auto">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-xs text-gray-700"
                  >
                    <span className="text-purple-500 mt-0.5 font-bold">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Common questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'Is the free listing really free?',
                a: 'Yes. Forever. No credit card, no hidden fees. Submit your tool and we review it within 7 days.',
              },
              {
                q: 'What happens after I pay for Featured?',
                a: 'Your tool gets priority placement across the site, a verified badge, and a tracking dashboard showing exactly how many clicks you get.',
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Yes. Monthly plans can be cancelled anytime. No long-term contracts, no cancellation fees.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'Fast Track is non-refundable once reviewed. Featured and Premium are refundable within the first 7 days if you are not satisfied.',
              },
              {
                q: 'How do I know Featured actually works?',
                a: 'Every Featured customer gets a live dashboard showing clicks, unique visitors, and traffic sources. Real numbers, not vanity metrics.',
              },
            ].map((item) => (
              <div
                key={item.q}
                className="rounded-xl border border-gray-200 bg-white p-5"
              >
                <h3 className="font-semibold text-gray-900 mb-1.5">
                  {item.q}
                </h3>
                <p className="text-sm text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Not sure which plan fits?
          </h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Start with the free listing. Upgrade anytime once you see the
            results.
          </p>
          <Link
            href="/submit"
            className="inline-block rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold px-8 py-3 transition shadow-lg shadow-purple-200"
          >
            Submit your tool free →
          </Link>
        </div>
      </div>
    </main>
  );
}