export default function Privacy() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-20">
      <div className="max-w-2xl mx-auto">

        <a href="/" className="text-yellow-600 tracking-widest text-sm mb-16 block hover:text-yellow-400">
          STELLARA
        </a>

        <h1 className="text-3xl font-light tracking-widest text-yellow-600 mb-2">
          Privacy Policy
        </h1>
        <p className="text-xs text-gray-600 tracking-widest mb-16">
          Last updated: 17 June 2026
        </p>

        <p className="text-gray-400 mb-8">
          Stellara operates the PALE mobile application and the STELLARA web
          platform at stellaraspace.com.
        </p>

        <h2 className="text-xs tracking-widest text-yellow-600 mt-10 mb-3">
          DATA COLLECTION
        </h2>
        <p className="text-gray-400 mb-4">We do not collect any personal data.</p>
        <p className="text-gray-400 mb-4">
          PALE stores all data — including your birthday, journal entries and
          location — locally on your device only. Nothing is transmitted to us
          or any third party.
        </p>
        <p className="text-gray-400 mb-4">
          STELLARA does not require an account or login. No personal data is
          collected by visiting or using the platform.
        </p>

        <h2 className="text-xs tracking-widest text-yellow-600 mt-10 mb-3">
          LOCATION
        </h2>
        <p className="text-gray-400 mb-4">
          PALE requests location permission only to show which stars are visible
          above you tonight. Your location is processed entirely on your device
          and never transmitted anywhere.
        </p>

        <h2 className="text-xs tracking-widest text-yellow-600 mt-10 mb-3">
          THIRD PARTIES
        </h2>
        <p className="text-gray-400 mb-4">
          We do not use advertising, analytics or any form of tracking on PALE
          or STELLARA.
        </p>

        <h2 className="text-xs tracking-widest text-yellow-600 mt-10 mb-3">
          CONTACT
        </h2>
        <p className="text-gray-400 mb-4">
          Questions? Contact us at{" "}
          <a
            href="mailto:hello@stellaraspace.com"
            className="text-yellow-600 hover:underline"
          >
            hello@stellaraspace.com
          </a>
        </p>

        <div className="border-t border-gray-900 mt-16 pt-8">
          <p className="text-xs text-gray-700">
            Stellara — making space accessible to everyone. No ads. No tracking.
            No data collection.
          </p>
          <a
            href="/"
            className="text-xs text-gray-600 tracking-widest mt-6 block hover:text-yellow-600"
          >
            ← BACK TO STELLARA
          </a>
        </div>

      </div>
    </div>
  );
}
