
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  Mail,
  ShieldCheck,
  LogOut,
} from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();

  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("finoraUser") || "{}");
  } catch {
    user = {};
  }

  const name = user.name || user.fullName || "Finora User";
  const email = user.email || "Email not available";

  const handleLogout = () => {
    localStorage.removeItem("finoraToken");
    sessionStorage.removeItem("finoraToken");
    localStorage.removeItem("finoraUser");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#F3F5F8] px-6 py-8 sm:px-10">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-8 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#24407A]"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <p className="text-sm font-semibold text-[#24407A]">
            PREFERENCES
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#101A2B]">
            Settings
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage your account and preferences.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="font-semibold text-[#101A2B]">
              Profile Information
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your account details.
            </p>
          </div>

          <div className="space-y-6 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#24407A] text-lg font-semibold text-white">
                {name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-[#101A2B]">{name}</p>
                <p className="text-sm text-slate-500">{email}</p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center gap-2 text-slate-400">
                  <UserRound size={18} />
                  <span className="text-xs font-medium uppercase tracking-wide">
                    Full Name
                  </span>
                </div>
                <p className="text-sm font-medium text-[#101A2B]">
                  {name}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center gap-2 text-slate-400">
                  <Mail size={18} />
                  <span className="text-xs font-medium uppercase tracking-wide">
                    Email Address
                  </span>
                </div>
                <p className="break-all text-sm font-medium text-[#101A2B]">
                  {email}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
            <ShieldCheck size={20} className="text-[#24407A]" />
            <div>
              <h2 className="font-semibold text-[#101A2B]">
                Account Security
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your account is protected by secure authentication.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-sm font-semibold text-[#101A2B]">
                Sign out of Finora
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                You will need to sign in again to access your account.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={17} />
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
