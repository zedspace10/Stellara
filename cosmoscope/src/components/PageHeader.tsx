// The one page header used across PALE, so every page opens the same way.
export default function PageHeader({ title, lede, children }: { title: string; lede?: string; children?: React.ReactNode }) {
  return (
    <header className="max-w-[1100px] mx-auto px-5 md:px-8 pt-14 pb-10">
      <h1 className="m-0 text-[40px] md:text-[56px] leading-[1.05]" style={{ color: "#E8ECF1" }}>
        {title}
      </h1>
      {lede && (
        <p className="mt-4 mb-0 text-[17px] leading-relaxed max-w-[34rem]" style={{ color: "#A3AFBC" }}>
          {lede}
        </p>
      )}
      {children}
    </header>
  );
}
