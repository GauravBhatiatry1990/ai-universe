export default function NewsletterSignup({
  variant = "card",
}: {
  variant?: "card" | "compact";
}) {
  // ⚠️ REPLACE with your real email before pushing
  const FORM_EMAIL = "gauravbhatia2190@gmail.com";
  const FORM_ACTION = `https://formsubmit.co/${FORM_EMAIL}`;

  if (variant === "compact") {
    return (
      <form
        action={FORM_ACTION}
        method="POST"
        className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
      >
        <input type="hidden" name="_subject" value="AI Universe — Newsletter signup" />
        <input type="hidden" name="_captcha" value="false" />
        <input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-purple-500/50 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 text-white text-sm font-medium px-5 py-2.5 transition whitespace-nowrap"
        >
          Subscribe
        </button>
      </form>
    );
  }

  return (
    <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-purple-500/40 via-blue-500/30 to-cyan-400/40">
      <div className="rounded-2xl bg-[#0a0a0f] p-6 sm:p-8 text-center">
        <p className="text-xs font-semibold text-purple-300 mb-2 tracking-wider uppercase">
          📬 Weekly Newsletter
        </p>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
          Get 5 new AI tools every Monday
        </h3>
        <p className="text-sm text-zinc-400 mb-5 max-w-md mx-auto">
          Hand-picked tools, free alternatives, and one underrated pick. No
          spam. Unsubscribe anytime.
        </p>
        <form
          action={FORM_ACTION}
          method="POST"
          className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
        >
          <input type="hidden" name="_subject" value="AI Universe — Newsletter signup" />
          <input type="hidden" name="_captcha" value="false" />
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-purple-500/50 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 text-white text-sm font-medium px-5 py-2.5 transition whitespace-nowrap"
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
}