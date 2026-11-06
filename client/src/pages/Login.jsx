
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Wallet,
  Sparkles,
} from "lucide-react";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  return (
    <div className="min-h-screen bg-[#F3F5F8] text-[#101A2B]">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* Left Section */}
        <section className="relative hidden overflow-hidden bg-[#101A2B] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
          <div className="absolute -right-32 top-20 h-96 w-96 rounded-full bg-[#24407A]/50 blur-[100px]" />
          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#2E7D5B]/20 blur-[100px]" />

          <Link to="/" className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#24407A]">
              <Wallet size={21} />
            </div>
            <span className="text-2xl font-bold">finora</span>
          </Link>

          <div className="relative max-w-lg">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/10">
              <Sparkles size={23} className="text-[#DFE6F3]" />
            </div>

            <h1 className="text-4xl font-semibold leading-tight xl:text-5xl">
              Your business deserves a smarter way to work.
            </h1>

            <p className="mt-6 text-base leading-8 text-[#B5C0D1]">
              Manage invoices, track payments and get intelligent financial
              insights — all in one place.
            </p>

            <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#B5C0D1]">
                  Your business, at a glance
                </span>
                <span className="rounded-full bg-[#2E7D5B]/20 px-3 py-1 text-xs text-[#72D5A5]">
                  Smart workflow
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#929FB4]">Invoices managed</p>
                  <p className="mt-2 text-2xl font-semibold">120+</p>
                </div>
                <div>
                  <p className="text-xs text-[#929FB4]">Time saved</p>
                  <p className="mt-2 text-2xl font-semibold">10 hrs</p>
                </div>
              </div>
            </div>
          </div>

          <p className="relative text-xs text-[#8996AA]">
            © 2026 Finora. AI-powered financial workflows.
          </p>
        </section>

        {/* Right Section */}
        <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-12">
          <div className="w-full max-w-md">

            <Link
              to="/"
              className="mb-12 inline-flex items-center gap-2 text-sm font-medium text-[#647187] transition hover:text-[#24407A]"
            >
              <ArrowLeft size={16} />
              Back to home
            </Link>

            <div className="mb-9 lg:hidden">
              <Link to="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#24407A] text-white">
                  <Wallet size={19} />
                </div>
                <span className="text-2xl font-bold">finora</span>
              </Link>
            </div>

            <div>
              <p className="text-sm font-semibold text-[#24407A]">
                WELCOME BACK
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Sign in to Finora
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#647187]">
                Welcome back! Enter your details to access your workspace.
              </p>
            </div>

            <form
              className="mt-9 space-y-5"
              onSubmit={(e) => e.preventDefault()}
            >
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8490A2]"
                  />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-lg border border-[#DCE2EB] bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#A0A9B7] focus:border-[#24407A] focus:ring-4 focus:ring-[#24407A]/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs font-semibold text-[#24407A] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8490A2]"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    className="w-full rounded-lg border border-[#DCE2EB] bg-white py-3.5 pl-11 pr-12 text-sm outline-none transition placeholder:text-[#A0A9B7] focus:border-[#24407A] focus:ring-4 focus:ring-[#24407A]/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8490A2] hover:text-[#24407A]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 accent-[#24407A]"
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-[#647187]"
                >
                  Remember me
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#24407A] py-3.5 text-sm font-semibold text-white transition hover:bg-[#1B3263]"
              >
                Sign in <ArrowRight size={17} />
              </button>
            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#DFE6F3]" />
              <span className="text-xs text-[#8490A2]">OR</span>
              <div className="h-px flex-1 bg-[#DFE6F3]" />
            </div>

            <p className="text-center text-sm text-[#647187]">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-[#24407A] hover:underline"
              >
                Create an account
              </Link>
            </p>

            <p className="mt-10 text-center text-xs text-[#929DB5]">
              Your workspace. Your finances. One smarter platform.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
