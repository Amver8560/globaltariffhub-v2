import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Global Tariff Hub",
};

export default function Privacy() {
  return (
    <div style={{ backgroundColor: "#0A0A0F", minHeight: "100vh", color: "#FFFFFF", fontFamily: "Arial, Helvetica, sans-serif" }}>

      {/* Navbar */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Link href="/en" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#FFFFFF" }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #0057FF, #0D1B3E)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#C9A84C", border: "1px solid #C9A84C" }}>
            GTH
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: 1 }}>Global Tariff Hub</span>
        </Link>
        <Link href="/privacidad" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>Ver en español</Link>
      </nav>

      {/* Content */}
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "60px 40px 80px" }}>
        <div style={{ marginBottom: 40 }}>
          <span style={{ background: "rgba(201,168,76,0.15)", border: "1px solid #C9A84C", borderRadius: 20, padding: "5px 16px", color: "#C9A84C", fontSize: 12, fontWeight: 600 }}>
            Legal
          </span>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginTop: 20, marginBottom: 8 }}>Privacy Policy</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Last updated: June 2026</p>
        </div>

        {[
          {
            title: "1. Who we are",
            body: "Global Tariff Hub is a tariff research platform for entrepreneurs and small and medium-sized businesses operating in international trade. The data controller is Global Tariff Hub. Contact: analia@globaltariffhub.com."
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
            body: "We use Resend (resend.com) as our email delivery provider. Your email may be processed by their servers in accordance with their own privacy policy. We do not use tracking cookies or behavioral analytics platforms at this stage."
          },
          {
            title: "5. Data retention",
            body: "We retain your email for as long as the service is active or until you request deletion. You may request removal at any time by writing to analia@globaltariffhub.com with the subject line 'Unsubscribe'."
          },
          {
            title: "6. Your rights",
            body: "You have the right to access, rectify, delete, or object to the processing of your personal data. To exercise any of these rights, write to us at analia@globaltariffhub.com. We respond within a maximum of 30 business days."
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

        <div style={{ marginTop: 48, padding: "24px", background: "#0D1B3E", borderRadius: 12, border: "1px solid rgba(0,87,255,0.2)" }}>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
            Questions about this policy? Write to us at{" "}
            <a href="mailto:analia@globaltariffhub.com" style={{ color: "#0057FF" }}>analia@globaltariffhub.com</a>
          </p>
        </div>
      </main>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "24px 40px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>© 2025 Global Tariff Hub. All rights reserved.</p>
      </footer>
    </div>
  );
}
