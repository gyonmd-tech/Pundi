export function BackgroundPattern() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage: "radial-gradient(circle at 2% 0%, rgba(111,88,255,.16), transparent 28rem), radial-gradient(circle at 100% 24%, rgba(62,134,237,.11), transparent 26rem), radial-gradient(circle at 48% 100%, rgba(233,87,102,.08), transparent 28rem)",
        }}
      />
      <div className="absolute inset-0 opacity-[0.18]" style={{ backgroundImage: "radial-gradient(circle at center, rgba(91,74,239,.22) 0.7px, transparent 0.8px)", backgroundSize: "24px 24px", maskImage: "linear-gradient(to bottom, black, transparent 76%)" }} />
    </div>
  );
}
