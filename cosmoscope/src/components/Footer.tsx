import { Link } from "wouter";
import MailingListForm from "./MailingListForm";
import { CONTACT_EMAIL } from "@/lib/links";

const LINKS = [
  { href: "/", label: "Universe" },
  { href: "/tonight", label: "Tonight" },
  { href: "/scale", label: "Scale" },
  { href: "/simulations", label: "Simulations" },
  { href: "/about", label: "About" },
  { href: "/credits", label: "Sources and credits" },
  { href: "/privacy", label: "Privacy" },
];

export default function Footer() {
  return (
    <footer className="mt-16 px-5 md:px-8 pt-12 pb-10" style={{ borderTop: "1px solid #1C2533", background: "#05070C" }}>
      <div className="max-w-[1100px] mx-auto grid gap-10 md:grid-cols-[1fr_auto]">
        <div>
          <p className="m-0 font-serif text-[22px] leading-snug" style={{ color: "#E8ECF1" }}>
            Hear when something is worth looking up for.
          </p>
          <p className="mt-2 mb-4 text-[15px]" style={{ color: "#A3AFBC" }}>
            An occasional note about meteor showers, eclipses and new things on PALE.
          </p>
          <MailingListForm />
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-10 gap-y-2 content-start text-[15px]">
          {LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="no-underline transition-colors hover:text-white" style={{ color: "#A3AFBC" }}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="max-w-[1100px] mx-auto mt-12 pt-6 flex flex-col md:flex-row md:justify-between gap-2 text-[13px]" style={{ borderTop: "1px solid #141B26", color: "#7C8794" }}>
        <p className="m-0">PALE is made by Stellara, a space education project in the UK. Free, with no ads.</p>
        <a href={`mailto:${CONTACT_EMAIL}`} className="no-underline hover:text-white" style={{ color: "#7C8794" }}>{CONTACT_EMAIL}</a>
      </div>
    </footer>
  );
}
