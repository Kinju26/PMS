import { CheckIcon, PadlockIcon, ShieldIcon } from "@/components/ui/icons";

const badges = [
  { label: "HIPAA Compliant", icon: ShieldIcon, iconClassName: "text-mint-emerald" },
  { label: "256-Bit SSL", icon: PadlockIcon, iconClassName: "text-teal-brand" },
  { label: "SOC-2 Certified", icon: CheckIcon, iconClassName: "text-mint-accent" },
] as const;

export function SecurityBadges() {
  return (
    <div className="mt-8 rounded-xl border border-slate-200/80 bg-white/70 p-3 backdrop-blur-sm">
      <div className="flex items-center justify-around gap-2 text-center text-xs font-semibold text-slate-600">
        {badges.map((badge, index) => (
          <div className="contents" key={badge.label}>
            {index > 0 ? <span className="text-slate-300">•</span> : null}
            <div className="flex items-center gap-1.5">
              <badge.icon className={`h-4 w-4 ${badge.iconClassName}`} />
              <span>{badge.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
