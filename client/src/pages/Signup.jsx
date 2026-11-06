import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  UserRound,
  Wallet,
  Sparkles,
} from "lucide-react";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#F3F5F8] flex">
      <div className="hidden lg:flex lg:w-1/2 bg-[#101A2B] text-white p-14 flex-col justify-between">
        <Link to="/" className="flex items-center gap-2 text-2xl font-semibold">
          <Wallet size={28} />
          Finora
        </Link>

        <div className="max-w-lg">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-7">
            <Sparkles size={24} />
          </div>

          <h1 className="text-4xl font-semibold leading-tight">
            Start managing your finances smarter.
          </h1>

          <p className="text-slate-300 mt-5 leading-7">
            Create your Finora account and bring invoicing, payments and
            financial insights together in one place.
          </p>
        </div>

        <p className="text-slate-400 text-sm">
          © 2026 Finora. All rights reserved.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="text-sm text-slate-500 hover:text-[#24407A] flex items-center gap-2 mb-10"
          >
            <ArrowRight className="rotate-180" size={16} />
            Back to home
          </Link>

          <div className="mb-8">
            <div className="flex items-center gap-2 text-[#101A2B] text-xl font-semibold mb-8 lg:hidden">
              <Wallet size={24} />
              Finora
            </div>

            <h2 className="text-3xl font-semibold text-[#101A2B]">
              Create your account
            </h2>
            <p className="text-slate-500 mt-2">
              Get started with Finora today.
            </p>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-[#101A2B] mb-2">
                Full name
              </label>
              <div className="flex items-center border border-slate-200 bg-white rounded-lg px-3 focus-within:border-[#24407A]">
                <UserRound size={18} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter your full name"
                  required
                  className="w-full p-3 outline-none text-sm bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#101A2B] mb-2">
                Email address
              </label>
              <div className="flex items-center border border-slate-200 bg-white rounded-lg px-3 focus-within:border-[#24407A]">
                <Mail size={18} className="text-slate-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="w-full p-3 outline-none text-sm bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#101A2B] mb-2">
                Password
              </label>
              <div className="flex items-center border border-slate-200 bg-white rounded-lg px-3 focus-within:border-[#24407A]">
                <LockKeyhole size={18} className="text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  required
                  minLength={8}
                  className="w-full p-3 outline-none text-sm bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-[#24407A]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Use at least 8 characters.
              </p>
            </div>

            <label className="flex items-start gap-2 text-sm text-slate-500">
              <input type="checkbox" required className="mt-1 accent-[#24407A]" />
              <span>
                I agree to the{" "}
                <span className="text-[#24407A] font-medium">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-[#24407A] font-medium">
                  Privacy Policy
                </span>
                .
              </span>
            </label>

            <button
              type="submit"
              className="w-full bg-[#24407A] hover:bg-[#1B3261] text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition"
            >
              Create account <ArrowRight size={18} />
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-7">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#24407A] font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}