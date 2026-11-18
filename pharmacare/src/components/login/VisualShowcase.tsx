import Image from "next/image";
import { BoltIcon, CheckIcon } from "@/components/ui/icons";
import { pharmacareHero } from "@/lib/assets";

export function VisualShowcase() {
  return (
    <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-teal-deep via-[#086772] to-[#04333c] p-8 text-white lg:flex lg:w-[52%] xl:w-[55%] xl:p-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-teal-brand/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-20 h-96 w-96 rounded-full bg-mint-accent/20 blur-3xl"
      />

      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-teal-light backdrop-blur-md">
          <span className="flex h-2 w-2 animate-pulse rounded-full bg-mint-accent" />
          Intelligent Pharmacy Operations Platform
        </div>
        <div className="text-xs font-medium tracking-wider text-white/60">
          SYSTEM STATUS: <span className="font-semibold text-mint-accent">ALL NODES ONLINE</span>
        </div>
      </div>

      <div className="relative my-auto flex items-center justify-center py-6">
        <div className="relative w-full max-w-[530px] rounded-3xl border border-white/20 bg-gradient-to-b from-white/20 to-white/5 p-3 shadow-2xl shadow-teal-deep/50 backdrop-blur-xl">
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-teal-900/30">
            <Image
              alt={pharmacareHero.alt}
              className="object-cover transition-transform duration-700 ease-out hover:scale-105"
              fill
              priority
              sizes="(min-width: 1280px) 530px, 40vw"
              src={pharmacareHero.src}
            />
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/15 ring-inset" />
          </div>

          <aside className="animate-float-slow absolute -top-5 -left-6 flex items-center gap-3 rounded-2xl border border-white/20 bg-slate-900/80 px-4 py-3 shadow-float-pill backdrop-blur-md">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint-accent/20 text-mint-accent">
              <CheckIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-wide text-white">99.98% Accuracy</p>
              <p className="text-[11px] text-white/70">Real-time inventory audit</p>
            </div>
          </aside>

          <aside className="animate-float-delayed absolute -right-6 -bottom-5 flex items-center gap-3 rounded-2xl border border-white/20 bg-slate-900/80 px-4 py-3 shadow-float-pill backdrop-blur-md">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-brand text-white shadow-sm">
              <BoltIcon className="h-5 w-5 text-mint-accent" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-wide text-white">Instant Rx Verification</p>
              <p className="text-[11px] text-teal-200">Automated e-Prescription billing</p>
            </div>
          </aside>
        </div>
      </div>

      <footer className="relative z-10 space-y-4">
        <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md">
          <div className="flex -space-x-2 overflow-hidden">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-teal-light text-[10px] font-bold text-teal-deep ring-2 ring-teal-deep">
              RX
            </span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-mint-accent text-[10px] font-bold text-teal-deep ring-2 ring-teal-deep">
              MS
            </span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-teal-300 text-[10px] font-bold text-teal-deep ring-2 ring-teal-deep">
              CP
            </span>
          </div>
          <div className="text-xs">
            <span className="block font-bold text-white">Trusted by 4,200+ Pharmacies & Clinics</span>
            <span className="block text-[11px] text-white/70">
              Across multi-location chains and acute health institutions.
            </span>
          </div>
        </div>
        <p className="text-center text-xs leading-relaxed text-white/60">
          “Streamlining clinical dispensing, DEA compliance, and multi-branch inventory seamlessly.”
        </p>
      </footer>
    </section>
  );
}
