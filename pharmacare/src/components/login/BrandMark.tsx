import Image from "next/image";

type BrandMarkTone = "light" | "dark";

export function BrandMark({
  kicker,
  tone,
}: {
  kicker: string;
  tone: BrandMarkTone;
}) {
  const kickerClassName =
    tone === "light" ? "text-[#a8d8d2]" : "text-[#168b83]";

  return (
    <div className={`flex items-center gap-3 ${tone === "dark" ? "text-[#102a43]" : "text-white"}`}>
      <Image
        alt="Canadian Pharmacy OS logo"
        className="h-12 w-12 shrink-0 object-contain drop-shadow-[0_3px_5px_rgba(0,35,55,0.12)]"
        height={48}
        src="/images/cpos-logo.png"
        width={48}
      />
      <div className="flex flex-col gap-[3px] leading-[1.12]">
        <strong className="text-[clamp(15px,1.45vw,19px)] font-extrabold tracking-[-0.035em]">
          Canadian Pharmacy OS
        </strong>
        <small className={`text-[9px] font-extrabold tracking-[0.16em] uppercase ${kickerClassName}`}>
          {kicker}
        </small>
      </div>
    </div>
  );
}
