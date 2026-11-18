import { MedicalMarkIcon } from "@/components/ui/icons";

export function BrandHeader() {
  return (
    <header className="w-full pt-2">
      <div className="flex items-center justify-between">
        <a
          aria-label="PharmaCare Home"
          className="group inline-flex items-center gap-3 focus:outline-none"
          href="#home"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-brand text-white shadow-md shadow-teal-brand/30 transition-transform group-hover:scale-105">
            <MedicalMarkIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                Pharma<span className="text-teal-brand">Care</span>
              </span>
              <span className="inline-flex items-center rounded-md border border-teal-brand/20 bg-teal-brand/10 px-2 py-0.5 text-xs font-semibold text-teal-brand">
                v2.4 Enterprise
              </span>
            </div>
            <p className="text-xs font-medium tracking-wide text-slate-500">
              Smarter Pharmacy Management, Simplified.
            </p>
          </div>
        </a>
      </div>
    </header>
  );
}
