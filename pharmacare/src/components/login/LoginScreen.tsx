import { LoginForm } from "@/components/login/LoginForm";
import { BrandMark } from "@/components/login/BrandMark";

const points = [
  "Centralized master administration",
  "Connected pharmacy workflow modules",
  "Activity visibility and audit readiness",
] as const;

export function LoginScreen() {
  return (
    <main className="font-sans grid min-h-dvh bg-white text-[#183247] lg:grid-cols-[1.05fr_0.95fr]">
      <section
        className="relative hidden flex-col justify-between px-[clamp(30px,6vw,78px)] py-[clamp(30px,6vw,78px)] text-white lg:flex"
        style={{
          background:
            "radial-gradient(circle at 80% 15%, #267d80 0, transparent 28%), linear-gradient(145deg, #0b2238, #164b66 65%, #13766f)",
        }}
      >
        <BrandMark kicker="Pharmacy Management System" tone="light" />
        <div className="max-w-[520px]">
          <p className="text-[11px] font-extrabold tracking-[0.15em] text-[#79d7c9] uppercase">
            One connected pharmacy workspace
          </p>
          <h1 className="mt-4 text-[clamp(34px,4.5vw,58px)] leading-[1.08] font-bold tracking-[-0.045em] text-white">
            Care operations,
            <br />
            made clearer.
          </h1>
          <p className="mt-4 max-w-[430px] text-sm leading-[1.8] text-[#d0dce5]">
            A secure, role-based workspace for pharmacy administration, prescription workflows, inventory
            visibility and operational oversight.
          </p>
          <ul className="mt-7 grid gap-3 text-[13px] text-[#e1edf3]">
            {points.map((point) => (
              <li key={point}>
                <span className="mr-2.5 text-[#8de2d2]">✓</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-[10px] tracking-[0.04em] text-[#9db7c7] uppercase">
          Authorized access only · Canadian Pharmacy Operations
        </p>
      </section>

      <section className="grid place-items-center bg-white px-6 py-9">
        <div className="w-full max-w-[410px]">
          <div className="mb-7">
            <BrandMark kicker="Master Admin Portal" tone="dark" />
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
