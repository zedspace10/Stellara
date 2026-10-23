// The one page header used across PALE, so every page opens the same way.
export default function PageHeader({ title, lede, children }: { title: string; lede?: string; children?: React.ReactNode }) {
  return (
    <header className="max-w-[1100px] mx-auto px-6 pt-14 pb-10">
      <h1 className="m-0 text-4xl md:text-5xl font-bold tracking-[-0.02em]" style={{ color: "#F5FAFF" }}>
        {title}
      </h1>
      {lede && (
        <p className="mt-3 mb-0 text-lg leading-relaxed max-w-[620px]" style={{ color: "#A7B6C6" }}>
          {lede}
        </p>
      )}
      {children}
    </header>
  );
}
