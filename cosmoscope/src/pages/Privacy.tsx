import { useEffect } from "react";
import { Link } from "wouter";
import { CONTACT_EMAIL } from "@/lib/links";

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 mb-3 text-sm font-semibold uppercase tracking-[0.14em]" style={{ color: "#8DEBFF" }}>
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-0 mb-4 leading-relaxed" style={{ color: "#A7B6C6" }}>{children}</p>;
}

export default function Privacy() {
  useEffect(() => {
    document.title = "Privacy · PALE";
  }, []);

  return (
    <div className="min-h-screen px-6 pt-28 pb-20" style={{ background: "#05070C", color: "#F5FAFF" }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="m-0 text-4xl font-bold tracking-[-0.01em]">Privacy policy</h1>
        <p className="mt-2 mb-12 text-sm" style={{ color: "#7C8C9C" }}>Last updated: 23 October 2026</p>

        <P>
          Stellara runs the PALE mobile app and the PALE website at stellaraspace.com. This page explains what
          information each of them handles.
        </P>

        <Heading>The PALE app</Heading>
        <P>
          The app does not collect personal data. Everything you enter, including your birthday, journal entries
          and location, is stored only on your device. Nothing is sent to us or to anyone else.
        </P>
        <P>
          The app asks for your location only to work out what is visible in your sky. Your location is processed on
          your device and never leaves it.
        </P>

        <Heading>The website</Heading>
        <P>
          You do not need an account to use the website, and we do not use advertising, analytics or tracking.
        </P>
        <P>
          If you allow it, Tonight's Sky uses your browser's location to work out what is above you. This happens in
          your browser and is not sent to us.
        </P>
        <P>
          Some pages load public data directly from other services, including NASA (partly through the corsproxy.io
          relay), The Space Devs and the Spaceflight News API, and the site loads its typeface from Google Fonts. As with any website, those
          services can see your IP address when your browser contacts them.
        </P>

        <Heading>Mailing list</Heading>
        <P>
          If you choose to join our mailing list, we store your email address with Mailchimp, which we use to send
          occasional emails. We only use it for that. Every email has an unsubscribe link, or you can ask us to
          remove you at any time.
        </P>

        <Heading>Contact</Heading>
        <P>
          Questions, or want your email removed? Write to{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline" style={{ color: "#8DEBFF" }}>{CONTACT_EMAIL}</a>.
        </P>

        <div className="mt-16 pt-8 border-t" style={{ borderColor: "#1D3040" }}>
          <Link href="/" className="text-sm no-underline" style={{ color: "#A7B6C6" }}>Back to PALE</Link>
        </div>
      </div>
    </div>
  );
}
