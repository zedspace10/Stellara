import { useEffect } from "react";
import { Link } from "wouter";

export default function NotFound() {
  useEffect(() => {
    document.title = "Lost in space | PALE";
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-6" style={{ background: "#05070C" }}>
      <div className="max-w-md text-center">
        <div
          aria-hidden="true"
          className="mx-auto mb-8 rounded-full"
          style={{ width: 4, height: 4, background: "#BFD6F0" }}
        />
        <h1 className="m-0 text-[40px] leading-tight" style={{ color: "#E8ECF1" }}>
          This page drifted off
        </h1>
        <p className="mt-3 mb-8 text-lg leading-relaxed" style={{ color: "#A3AFBC" }}>
          There is nothing at this address. The universe is still where you left it.
        </p>
        <Link
          href="/"
          className="inline-block rounded-md px-5 py-2.5 text-[15px] font-medium no-underline transition-colors hover:bg-white/5"
          style={{ border: "1px solid #3A4658", color: "#E8ECF1" }}
        >
          Back to the universe
        </Link>
      </div>
    </div>
  );
}
