
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Invoice Generation",
    description:
      "Create professional invoices from simple text instructions. Review and approve before saving.",
  },
  {
    icon: Wallet,
    title: "Seamless Payments",
    description:
      "Connect invoices with PayPal checkout and keep track of every payment.",
  },
  {
    icon: Bot,
    title: "AI Finance Assistant",
    description:
      "Get helpful insights about invoices, pending payments and your business finances.",
  },
];

const steps = [
  ["01", "Describe", "Tell Finora what invoice you need."],
  ["02", "Review", "Check and approve your AI-generated invoice."],
  ["03", "Get Paid", "Share the invoice and receive payments."],
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#F3F5F8] text-[#101A2B]">
      {/* Navbar */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#24407A] text-white">
            <Wallet size={20} />
          </div>
          <span className="text-2xl font-bold tracking-tight">finora</span>
        </Link>

        <div className="hidden items-center gap-9 text-sm font-medium text-[#647187] md:flex">
          <a href="#features" className="transition hover:text-[#24407A]">
            Features
          </a>
          <a href="#how-it-works" className="transition hover:text-[#24407A]">
            How it works
          </a>
          <a href="#about" className="transition hover:text-[#24407A]">
            About
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden px-4 py-2 text-sm font-semibold text-[#24407A] sm:block"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="rounded-lg bg-[#24407A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1B3263]"
          >
            Get Started <ArrowUpRight size={15} className="ml-1 inline" />
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-7xl items-center gap-16 px-6 pb-24 pt-16 lg:grid-cols-2 lg:px-10 lg:pb-32 lg:pt-24">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#DFE6F3] bg-white px-4 py-2 text-xs font-semibold text-[#24407A]">
              <Sparkles size={14} />
              SMARTER FINANCIAL WORKFLOWS
            </div>

            <h1 className="max-w-xl text-5xl font-semibold leading-[1.12] tracking-tight sm:text-6xl lg:text-[68px]">
              Your business finances,{" "}
              <span className="text-[#24407A]">simplified.</span>
            </h1>

            <p className="mt-7 max-w-lg text-base leading-8 text-[#647187] sm:text-lg">
              Create invoices, manage payments and understand your business
              finances — all with the help of AI.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/signup"
                className="rounded-lg bg-[#24407A] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1B3263]"
              >
                Start for free <ArrowRight size={17} className="ml-2 inline" />
              </Link>

              <a
                href="#how-it-works"
                className="rounded-lg border border-[#D6DEEA] bg-white px-6 py-3.5 text-sm font-semibold text-[#24407A] transition hover:bg-[#DFE6F3]"
              >
                Explore how it works
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs text-[#647187]">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#2E7D5B]" />
                AI-powered invoicing
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-[#2E7D5B]" />
                Secure payment workflow
              </span>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="relative">
            <div className="absolute -right-5 -top-8 h-48 w-48 rounded-full bg-[#DFE6F3] blur-3xl" />

            <div className="relative rounded-2xl border border-[#E1E6EE] bg-white p-5 shadow-[0_24px_70px_-35px_rgba(16,26,43,0.20)] sm:p-7">
              <div className="flex items-center justify-between border-b border-[#EDF0F5] pb-5">
                <div>
                  <p className="text-xs text-[#7D899C]">Business overview</p>
                  <h3 className="mt-1 text-lg font-semibold">Dashboard</h3>
                </div>
                <span className="rounded-md bg-[#EAF3ED] px-3 py-1.5 text-xs font-medium text-[#2E7D5B]">
                  Live preview
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#F3F5F8] p-4">
                  <p className="text-xs text-[#7D899C]">Total invoiced</p>
                  <p className="mt-2 text-2xl font-semibold">₹48,500</p>
                  <p className="mt-2 text-xs text-[#2E7D5B]">This month</p>
                </div>
                <div className="rounded-xl bg-[#F3F5F8] p-4">
                  <p className="text-xs text-[#7D899C]">Payments received</p>
                  <p className="mt-2 text-2xl font-semibold">₹32,000</p>
                  <p className="mt-2 text-xs text-[#2E7D5B]">Demo data</p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-[#E8ECF2] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Recent invoices</p>
                  <FileText size={17} className="text-[#71809A]" />
                </div>

                {[
                  ["INV-001", "Website Development", "₹18,000", "Paid"],
                  ["INV-002", "UI Design", "₹12,000", "Pending"],
                  ["INV-003", "Consultation", "₹8,500", "Paid"],
                ].map((invoice) => (
                  <div
                    key={invoice[0]}
                    className="flex items-center justify-between border-b border-[#EDF0F5] py-4 last:border-0 last:pb-1"
                  >
                    <div>
                      <p className="text-sm font-medium">{invoice[1]}</p>
                      <p className="mt-1 text-xs text-[#8490A2]">
                        {invoice[0]}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{invoice[2]}</p>
                      <p
                        className={`mt-1 text-xs ${
                          invoice[3] === "Paid"
                            ? "text-[#2E7D5B]"
                            : "text-[#B8894B]"
                        }`}
                      >
                        {invoice[3]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#24407A] p-4 text-white">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                  <Bot size={19} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Finora AI Assistant</p>
                  <p className="mt-0.5 text-xs text-white/70">
                    Your financial workflow companion
                  </p>
                </div>
                <Sparkles size={18} className="ml-auto text-[#DFE6F3]" />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="border-y border-[#E3E8F0] bg-white py-24"
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="max-w-xl">
              <p className="text-xs font-bold tracking-[0.18em] text-[#24407A]">
                WHAT FINORA DOES
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Everything you need to manage your workflow.
              </h2>
              <p className="mt-4 leading-7 text-[#647187]">
                Spend less time managing paperwork and more time growing your
                business.
              </p>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {features.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-xl border border-[#E3E8F0] bg-[#F8F9FB] p-7 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-[#101A2B]/5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#DFE6F3] text-[#24407A]">
                    <Icon size={23} />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#647187]">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section id="how-it-works" className="py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="text-center">
              <p className="text-xs font-bold tracking-[0.18em] text-[#2E7D5B]">
                SIMPLE BY DESIGN
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                From invoice to payment in three steps.
              </h2>
            </div>

            <div className="mt-16 grid gap-10 md:grid-cols-3">
              {steps.map(([number, title, description]) => (
                <div key={number} className="text-center">
                  <p className="text-sm font-bold tracking-widest text-[#24407A]">
                    {number}
                  </p>
                  <h3 className="mt-4 text-xl font-semibold">{title}</h3>
                  <p className="mx-auto mt-3 max-w-xs text-sm leading-7 text-[#647187]">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="about" className="px-6 pb-24">
          <div className="mx-auto max-w-7xl rounded-2xl bg-[#101A2B] px-7 py-16 text-center text-white sm:px-14">
            <Zap size={25} className="mx-auto text-[#DFE6F3]" />
            <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Make your financial workflow work smarter.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#B5C0D1]">
              Bring invoicing, payments and AI-powered insights together with
              Finora.
            </p>
            <Link
              to="/signup"
              className="mt-8 inline-flex items-center rounded-lg bg-[#24407A] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#315394]"
            >
              Get started <ArrowRight size={17} className="ml-2" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E3E8F0] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 py-8 text-sm text-[#7D899C] sm:flex-row lg:px-10">
          <span className="font-semibold text-[#101A2B]">finora.</span>
          <span>AI-powered financial workflows.</span>
          <span>© 2026 Finora. Built for smarter business.</span>
        </div>
      </footer>
    </div>
  );
}
