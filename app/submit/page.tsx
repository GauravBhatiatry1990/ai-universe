import Link from 'next/link';

export default function SubmitPage() {
  const FORM_EMAIL = 'gauravbhatia2190@gmail.com';
  const FORM_ACTION = `https://formsubmit.co/${FORM_EMAIL}`;

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="text-purple-600 hover:text-purple-700 text-sm font-medium inline-block mb-6"
        >
          ← Back to all tools
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Submit a Tool
            </span>
          </h1>
          <p className="text-lg text-gray-700">
            Know an AI tool worth listing? Send it over. We review every
            submission and add the best ones.
          </p>
        </div>

        <form
          action={FORM_ACTION}
          method="POST"
          className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 space-y-5 shadow-sm"
        >
          <input type="hidden" name="_subject" value="AI Universe — New tool submission" />
          <input type="hidden" name="_captcha" value="false" />
          <input type="hidden" name="_template" value="table" />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tool Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="tool_name"
              required
              placeholder="e.g. DeepSeek"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              name="tool_url"
              required
              placeholder="https://example.com"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              One-line tagline <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="tagline"
              required
              maxLength={140}
              placeholder="What does it do in one sentence?"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pricing <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="pricing"
              required
              placeholder="e.g. Free / Pro $20/mo"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Best for (optional)
            </label>
            <input
              type="text"
              name="best_for"
              placeholder="Who is this tool best for?"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Why should we feature it? (optional)
            </label>
            <textarea
              name="why"
              rows={4}
              placeholder="What makes this tool stand out?"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your email (so we can follow up)
            </label>
            <input
              type="email"
              name="submitter_email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold px-6 py-3 transition shadow-md shadow-purple-200"
          >
            Submit Tool →
          </button>

          <p className="text-xs text-gray-500 text-center">
            Free listing. We review every submission.
          </p>
        </form>
      </div>
    </main>
  );
}