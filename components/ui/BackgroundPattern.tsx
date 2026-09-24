export function BackgroundPattern() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="absolute -left-36 -top-44 h-[34rem] w-[34rem] rounded-full bg-pine-20/45 blur-3xl" />
      <div className="absolute -right-40 top-[18%] h-[30rem] w-[30rem] rounded-full bg-sky-10/80 blur-3xl" />
      <div className="absolute bottom-[-14rem] left-[36%] h-[30rem] w-[30rem] rounded-full bg-ember-10/60 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.24]"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, rgba(91,74,239,.2) 0.7px, transparent 0.8px)",
          backgroundSize: "24px 24px",
          maskImage: "linear-gradient(to bottom, black, transparent 76%)",
        }}
      />
    </div>
  );
}
