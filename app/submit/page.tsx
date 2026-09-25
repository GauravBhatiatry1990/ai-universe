import Link from 'next/link';
import AppShell from '../../components/AppShell';

export default function SubmitPage() {
  const FORM_EMAIL = 'gauravbhatia2190@gmail.com';
  const FORM_ACTION = `https://formsubmit.co/${FORM_EMAIL}`;

  const inputClass =
    'w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition';

  return (
    <AppShell>
      <div className="px-4 lg:px-8 py-8 max-w-2xl mx-auto">
        <Link
          href="/"
          className="text-purple-400 hover:text-purple-300 text-sm font-medium inline-block mb-6 transition"
        >
          ← Back to all tools
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Submit a Tool
            </span>
          </h1>
          <p className="text-lg text-zinc-400">
            Know an AI tool worth listing? Send it over. We review every
            submission and add the best ones.
          </p>
        </div>

        <form
          action={FORM_ACTION}
          method="POST"
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 space-y-5 shadow-sm"
        >
          <input type="hidden" name="_subject" value="AI Universe — New tool submission" />
          <input type="hidden" name="_captcha" value="false" />
          <input type="hidden" name="_template" value="table" />

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Tool Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="tool_name"
              required
              placeholder="e.g. DeepSeek"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Website URL <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              name="tool_url"
              required
              placeholder="https://example.com"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              name="category"
              required
              className={inputClass}
            >
              <option value="">Select a category...</option>
              <option>Chatbots & LLMs</option>
              <option>Coding</option>
              <option>Image</option>
              <option>Video</option>
              <option>Audio</option>
              <option>Writing</option>
              <option>Productivity</option>
              <option>Research</option>
              <option>Presentations</option>
              <option>Website Builders</option>
              <option>Note-Taking</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              One-line tagline <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="tagline"
              required
              maxLength={140}
              placeholder="What does it do in one sentence?"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Pricing <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="pricing"
              required
              placeholder="e.g. Free / Pro $20/mo"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Best for (optional)
            </label>
            <input
              type="text"
              name="best_for"
              placeholder="Who is this tool best for?"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Why should we feature it? (optional)
            </label>
            <textarea
              name="why"
              rows={4}
              placeholder="What makes this tool stand out?"
              className={inputClass + ' resize-none'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Your email (so we can follow up)
            </label>
            <input
              type="email"
              name="submitter_email"
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold px-6 py-3 transition shadow-md shadow-purple-500/20"
          >
            Submit Tool →
          </button>

          <p className="text-xs text-zinc-500 text-center">
            Free listing. We review every submission.
          </p>
        </form>
      </div>
    </AppShell>
  );
}