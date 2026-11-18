import type { CSSProperties } from "react";
import {
  BarChart3,
  ClipboardList,
  HeartPulse,
  Package,
  Pill,
  Plus,
  ShieldCheck,
  Store,
  type LucideIcon,
} from "lucide-react";
import { LoginForm } from "@/components/login/LoginForm";
import { pharmacyInterior } from "@/lib/assets";

const motifs: { icon: LucideIcon; label: string; className: string; delay: string; dx: string; dy: string }[] = [
  { icon: Plus, label: "Medical cross", className: "left-[7%] top-[16%]", delay: "0s", dx: "8px", dy: "-16px" },
  { icon: Pill, label: "Medicine capsule", className: "right-[9%] top-[14%]", delay: "0.8s", dx: "-12px", dy: "-10px" },
  { icon: ShieldCheck, label: "Security", className: "left-[12%] top-[42%]", delay: "1.4s", dx: "10px", dy: "12px" },
  { icon: Package, label: "Inventory", className: "right-[11%] top-[40%]", delay: "0.3s", dx: "-8px", dy: "14px" },
  { icon: Store, label: "Pharmacy", className: "left-[18%] bottom-[18%]", delay: "1.1s", dx: "6px", dy: "-12px" },
  { icon: BarChart3, label: "Analytics", className: "right-[16%] bottom-[20%]", delay: "1.8s", dx: "-10px", dy: "-8px" },
  { icon: ClipboardList, label: "Prescription", className: "left-[38%] top-[8%]", delay: "0.5s", dx: "4px", dy: "12px" },
  { icon: HeartPulse, label: "Heartbeat", className: "right-[36%] bottom-[8%]", delay: "1.6s", dx: "-6px", dy: "-14px" },
];

const features = [
  {
    title: "Multi-Location Support",
    body: "Manage all your pharmacies seamlessly.",
    icon: Store,
    className: "top-16 left-8",
    delay: "0.35s",
  },
  {
    title: "Real-Time Inventory",
    body: "Track stock with precision.",
    icon: Package,
    className: "top-20 right-8",
    delay: "0.5s",
  },
  {
    title: "Advanced Analytics",
    body: "Make data-driven decisions.",
    icon: BarChart3,
    className: "bottom-10 left-10",
    delay: "0.65s",
  },
  {
    title: "Secure Platform",
    body: "Protect pharmacy operations.",
    icon: ShieldCheck,
    className: "right-8 bottom-12",
    delay: "0.8s",
  },
];

export function LoginScreen() {
  return (
    <main className="relative min-h-dvh overflow-x-hidden overflow-y-auto bg-navy text-ink">
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div
          className="login-scene absolute inset-[-4%] bg-cover bg-center"
          style={{ backgroundImage: `url("${pharmacyInterior.src}")` }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(244,247,246,0.18),rgba(16,35,58,0.62))]" />
        <div className="login-glow absolute -top-16 left-[12%] h-72 w-72 rounded-full bg-[#1D9E75]/35 blur-3xl" />
        <div className="login-glow login-glow-late absolute right-[8%] bottom-0 h-80 w-80 rounded-full bg-[#1A6F8A]/30 blur-3xl" />
      </div>

      <div className="pointer-events-none fixed inset-0 hidden md:block">
        {motifs.map((motif) => {
          const Icon = motif.icon;
          return (
            <span
              key={motif.label}
              className={`login-motif absolute grid h-12 w-12 place-items-center rounded-full border border-white/50 bg-white/70 text-[#178666] shadow-lg shadow-navy/10 backdrop-blur-md ${motif.className}`}
              style={{ animationDelay: motif.delay, "--dx": motif.dx, "--dy": motif.dy } as CSSProperties}
            >
              <Icon aria-hidden="true" className="h-5 w-5" />
              <span className="sr-only">{motif.label}</span>
            </span>
          );
        })}
      </div>

      <div className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-6">
        <div className="relative w-full max-w-[440px]">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <aside
                key={feature.title}
                className={`login-feature fixed hidden w-56 rounded-2xl border border-white/60 bg-white/75 p-3.5 shadow-lg shadow-navy/10 backdrop-blur-md lg:block ${feature.className}`}
                style={{ animationDelay: feature.delay } as CSSProperties}
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#E7F6F1] text-[#178666]">
                    <Icon aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{feature.title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-muted">{feature.body}</p>
                  </div>
                </div>
              </aside>
            );
          })}
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
