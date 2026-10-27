import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
};

export default function Privacy() {
  return (
    <div style={{ backgroundColor: "#0B1B33", minHeight: "100vh", color: "#FFFFFF", fontFamily: "Arial, Helvetica, sans-serif" }}>

      {/* Navbar */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Link href="/en" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#FFFFFF" }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #3B7BF6, #13294B)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#E3B341", border: "1px solid #E3B341" }}>
            GTH
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: 1 }}>Global Tariff Hub</span>
        </Link>
        <Link href="/privacidad" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>Ver en español</Link>
      </nav>

      {/* Content */}
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "60px 40px 80px" }}>
        <div style={{ marginBottom: 40 }}>
          <span style={{ background: "rgba(227,179,65,0.15)", border: "1px solid #E3B341", borderRadius: 20, padding: "5px 16px", color: "#E3B341", fontSize: 12, fontWeight: 600 }}>
            Legal
          </span>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginTop: 20, marginBottom: 8 }}>Privacy Policy</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Last updated: June 2026</p>
        </div>

        {[
          {
            title: "1. Who we are",
            body: "Global Tariff Hub is a tariff research platform for entrepreneurs and small and medium-sized businesses operating in international trade. The data controller is Global Tariff Hub. Contact: globaltariffhub@gmail.com."
          },
          {
            title: "2. What data we collect",
            body: "We collect only the email address you voluntarily provide in the early-access registration form. We do not collect browsing data, tracking cookies, or any additional personal information at this stage of the platform."
          },
          {
            title: "3. How we use your data",
            body: "Your email is used solely to: (a) send you a registration confirmation email, (b) notify you when the platform becomes available, (c) send you updates about tariff news and the service launch. We do not sell or share your email with third parties."
          },
          {
            title: "4. Third-party services",
            body: "GTH uses the following third-party providers that may process your data: (a) Supabase (supabase.com) — user account management and authentication; your login credentials are stored on their infrastructure. (b) Anthropic (anthropic.com) — the AI engine that processes the queries you submit through the platform's modules; queries may include product descriptions or images you upload. (c) Resend (resend.com) — delivery of confirmation emails and notifications. Each provider operates under its own privacy policy. GTH does not sell or share your data with third parties for advertising purposes."
          },
          {
            title: "5. Data retention",
            body: "We retain your email for as long as the service is active or until you request deletion. You may request removal at any time by writing to globaltariffhub@gmail.com with the subject line 'Unsubscribe'."
          },
          {
            title: "6. Your rights",
            body: "You have the right to access, rectify, delete, or object to the processing of your personal data. To exercise any of these rights, write to us at globaltariffhub@gmail.com. We respond within a maximum of 30 business days."
          },
          {
            title: "7. Security",
            body: "We take reasonable measures to protect your information. However, no data transmission over the Internet is 100% secure. We use providers that meet industry-recognized security standards."
          },
          {
            title: "8. Changes to this policy",
            body: "We may update this policy periodically. Any significant changes will be communicated by email to registered users. The date of last update will always be visible at the top of this document."
          },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: "#FFFFFF" }}>{section.title}</h2>
            <p style={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.8, fontSize: 15 }}>{section.body}</p>
          </div>
        ))}

        <div style={{ marginTop: 48, padding: "24px", background: "#13294B", borderRadius: 12, border: "1px solid rgba(59,123,246,0.2)" }}>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
            Questions about this policy? Write to us at{" "}
            <a href="mailto:globaltariffhub@gmail.com" style={{ color: "#3B7BF6" }}>globaltariffhub@gmail.com</a>
          </p>
        </div>
      </main>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "24px 40px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>© 2026 Global Tariff Hub. All rights reserved.</p>
      </footer>
    </div>
  );
}
