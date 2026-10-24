import { useEffect } from "react";
import { Link } from "wouter";

export default function NotFound() {
  useEffect(() => {
    document.title = "Lost in space · PALE";
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-6" style={{ background: "#05070C" }}>
      <div className="max-w-md text-center">
        <div
          aria-hidden="true"
          className="mx-auto mb-8 rounded-full"
          style={{ width: 10, height: 10, background: "#8DEBFF", boxShadow: "0 0 18px 6px rgba(141,235,255,0.5)" }}
        />
        <h1 className="m-0 text-3xl md:text-4xl font-bold tracking-[-0.01em]" style={{ color: "#F5FAFF" }}>
          This page drifted off
        </h1>
        <p className="mt-3 mb-8 text-lg leading-relaxed" style={{ color: "#A7B6C6" }}>
          There is nothing at this address. The universe is still where you left it.
        </p>
        <Link
          href="/"
          className="inline-block rounded-full px-6 py-3 text-[15px] font-semibold no-underline"
          style={{ background: "#8DEBFF", color: "#05070C" }}
        >
          Back to the universe
        </Link>
      </div>
    </div>
  );
}
