import Link from 'next/link';

export default function SubmitPage() {
  // ⚠️ REPLACE with your real email before pushing
  const FORM_EMAIL = "gauravbhatia2190@gmail.com";
  const FORM_ACTION = `https://formsubmit.co/${FORM_EMAIL}`;

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="text-purple-400 hover:text-purple-300 text-sm font-medium inline-block mb-6"
        >
          ← Back to all tools
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Submit a Tool
            </span>
          </h1>
          <p className="text-lg text-gray-400">
            Know an AI tool worth listing? Send it over. We review every
            submission and add the best ones.
          </p>
        </div>

        <form
          action={FORM_ACTION}
          method="POST"
          className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur p-6 sm:p-8 space-y-5"
        >
          <input type="hidden" name="_subject" value="AI Universe — New tool submission" />
          <input type="hidden" name="_captcha" value="false" />
          <input type="hidden" name="_template" value="table" />

          {/* Tool name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tool Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="tool_name"
              required
              placeholder="e.g. DeepSeek"
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none"
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Website URL <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              name="tool_url"
              required
              placeholder="https://example.com"
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              name="category"
              required
              className="w-full rounded-lg border border-white/10 bg-[#0a0a0f] px-4 py-2.5 text-sm text-white focus:border-purple-500/50 focus:outline-none"
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

          {/* Tagline */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              One-line tagline <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="tagline"
              required
              maxLength={140}
              placeholder="What does it do in one sentence?"
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none"
            />
          </div>

          {/* Pricing */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Pricing <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="pricing"
              required
              placeholder="e.g. Free / Pro $20/mo"
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none"
            />
          </div>

          {/* Best for */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Best for (optional)
            </label>
            <input
              type="text"
              name="best_for"
              placeholder="Who is this tool best for?"
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Why should we feature it? (optional)
            </label>
            <textarea
              name="why"
              rows={4}
              placeholder="What makes this tool stand out?"
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none resize-none"
            />
          </div>

          {/* Your email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your email (so we can follow up)
            </label>
            <input
              type="email"
              name="submitter_email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 text-white font-medium px-6 py-3 transition shadow-lg shadow-purple-500/20"
          >
            Submit Tool →
          </button>

          <p className="text-xs text-gray-500 text-center">
            We review every submission. Featured listings coming soon.
          </p>
        </form>
      </div>
    </main>
  );
}