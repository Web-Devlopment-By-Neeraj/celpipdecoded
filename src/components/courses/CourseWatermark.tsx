export function CourseWatermark({
  email,
  brand,
  tone,
  className,
}: {
  email: string | null;
  brand: string;
  tone: "page" | "video";
  className?: string;
}) {
  const address = email?.trim() || null;
  // Half of the first pass: 9 on the video, 12 on the lesson page.
  const count = tone === "video" ? 9 : 12;
  const cells = Array.from({ length: count }, (_, index) => index);

  return (
    <div aria-hidden="true" className={`pointer-events-none ${className ?? ""}`}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
        <div
          className={
            tone === "video"
              ? "absolute left-1/2 top-1/2 grid h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2 grid-cols-3 grid-rows-3 place-items-center -rotate-[18deg] motion-safe:animate-[course-watermark-drift_42s_linear_infinite]"
              : "absolute left-1/2 top-1/2 grid w-[150%] -translate-x-1/2 -translate-y-1/2 -rotate-[18deg] grid-cols-4 gap-x-12 gap-y-24 motion-safe:animate-[course-watermark-drift_42s_linear_infinite]"
          }
        >
          {cells.map((index) => (
            <Mark key={index} email={address} brand={brand} tone={tone} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Mark({
  email,
  brand,
  tone,
}: {
  email: string | null;
  brand: string;
  tone: "page" | "video";
}) {
  const lines = (
    <>
      {email ? <span className="block">{email}</span> : null}
      <span className="block">{brand}</span>
    </>
  );

  if (tone === "page") {
    return (
      <span className="text-center text-[11px] font-normal leading-5 tracking-wide text-[rgba(48,62,80,0.14)]">
        {lines}
      </span>
    );
  }

  // Two faint copies, one white and one black. The picture stays easy to
  // watch. A still of the video still shows the email and the brand.
  return (
    <span className="relative text-center text-[12px] font-normal leading-5 tracking-wide">
      <span className="absolute inset-0 text-black/20">{lines}</span>
      <span className="relative text-white/25">{lines}</span>
    </span>
  );
}
