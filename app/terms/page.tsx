import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use — Global Tariff Hub",
  description: "Terms and conditions of use for the Global Tariff Hub platform.",
};

export default function Terms() {
  return (
    <div style={{ backgroundColor: "#0A0A0F", minHeight: "100vh", color: "#FFFFFF", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>

      {/* Navbar */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Link href="/en" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#FFFFFF" }}>
          <div style={{ width: 34, height: 34, borderRadius: 7, background: "linear-gradient(135deg, #0057FF, #0D1B3E)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11, color: "#C9A84C", border: "1px solid rgba(201,168,76,0.5)" }}>GTH</div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Global Tariff Hub</span>
        </Link>
        <div style={{ display: "flex", gap: 20 }}>
          <Link href="/terminos" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>Ver en español</Link>
          <Link href="/privacy" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>Privacy Policy</Link>
        </div>
      </nav>

      {/* Content */}
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "60px 40px 80px" }}>

        <div style={{ marginBottom: 40 }}>
          <span style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.4)", borderRadius: 20, padding: "5px 16px", color: "#C9A84C", fontSize: 12, fontWeight: 600 }}>Legal</span>
          <h1 style={{ fontSize: 34, fontWeight: 800, marginTop: 20, marginBottom: 8, letterSpacing: -0.5 }}>Terms of Use</h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>Last updated: June 2026</p>
        </div>

        {[
          {
            title: "1. Acceptance of terms",
            body: "By accessing and using Global Tariff Hub (hereinafter 'the platform' or 'GTH'), you agree to these Terms of Use in their entirety. If you do not agree with any of these terms, you must not use the platform.",
          },
          {
            title: "2. Description of service",
            body: "Global Tariff Hub is a support platform for international trade analysis. It enables users to search tariff codes (HS, NCM, TARIC), simulate transactions using certificates of origin, calculate CIF costs, and analyze the viability of import operations. All data is provided for reference purposes and is sourced from public sources such as the WTO (WTO API), Brazil's Siscomex, and the European Union's TARIC database, all of which are subject to changes that may not be reflected in real time.",
          },
          {
            title: "3. Informational nature of data",
            body: "All information provided by GTH is strictly informational and for reference purposes only. GTH is a research intermediary, not a database redistributor or customs advisor. Data may contain inaccuracies or may not reflect recent regulatory updates. The user is solely responsible for verifying all information with the relevant official authorities before conducting any international trade transaction.",
          },
          {
            title: "4. What GTH does not do",
            body: "GTH does not issue certificates of origin, customs documents, or any other official documents. GTH does not provide legal, tax, or customs advice. The simulators and calculators are estimation tools and do not replace consultation with a licensed customs broker, legal advisor, or accountant specializing in international trade.",
          },
          {
            title: "5. Reference sources and limitation of liability",
            body: "GTH uses data from public sources (WTO API, BrasilAPI/Siscomex, TARIC EU) as reference. These sources are subject to frequent regulatory changes. We do not guarantee the accuracy, completeness, or real-time currency of the data provided. AI-generated results are indicative only and do not constitute legal, tax, or customs advice. GTH shall not be liable for economic losses, customs penalties, classification errors, or any other damages arising from use of the platform.",
          },
          {
            title: "6. Intellectual property",
            body: "The design, code, brand, texts, and original content of GTH are the property of Global Tariff Hub and are protected by applicable intellectual property law. Tariff data is sourced from public reference sources and cited with appropriate attribution. GTH does not claim rights over such data. Reproduction, distribution, or commercial exploitation of GTH content without express written authorization is prohibited.",
          },
          {
            title: "7. Acceptable use",
            body: "Users agree to use the platform lawfully and in accordance with these terms. The following are prohibited: (a) using GTH for illegal purposes; (b) attempting to access systems or data without authorization; (c) reproducing or redistributing platform databases; (d) conducting mass or automated scraping without GTH's written consent.",
          },
          {
            title: "8. User accounts",
            body: "By registering with GTH, you are responsible for maintaining the confidentiality of your access credentials. GTH may suspend or cancel accounts that violate these terms without prior notice. Free consultations are for personal use only and are non-transferable.",
          },
          {
            title: "9. Modifications to the service and terms",
            body: "GTH reserves the right to modify, suspend, or discontinue the service at any time. These Terms of Use may be updated periodically. Significant changes will be communicated by email to registered users. Continued use of the platform following notification constitutes acceptance of the updated terms.",
          },
          {
            title: "10. Governing law and jurisdiction",
            body: "These terms are governed by the laws of the Argentine Republic. Any dispute shall be submitted to the ordinary courts of the Autonomous City of Buenos Aires, with express waiver of any other jurisdiction that may apply.",
          },
          {
            title: "11. Contact",
            body: "For questions about these Terms of Use, write to analia@globaltariffhub.com.",
          },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: 32, paddingBottom: 32, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: "#FFFFFF" }}>{section.title}</h2>
            <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.85, fontSize: 14 }}>{section.body}</p>
          </div>
        ))}

        {/* Support tool notice */}
        <div style={{ marginTop: 16, padding: "24px 28px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: "rgba(239,68,68,0.8)", fontWeight: 700, marginBottom: 8 }}>⚠ Support tool — not legal advice</p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.75 }}>
            GTH provides support tools for international trade analysis. Definitive tariff classification, application of trade agreements, and regulatory requirements must be verified by <strong style={{ color: "rgba(255,255,255,0.75)" }}>qualified professionals</strong> and/or the relevant customs authorities.
          </p>
        </div>

        {/* AI notice */}
        <div style={{ padding: "20px 28px", background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: 12 }}>
          <p style={{ fontSize: 13, color: "rgba(168,85,247,0.85)", fontWeight: 700, marginBottom: 8 }}>🤖 AI Notice</p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.75 }}>
            Results generated by artificial intelligence are <strong style={{ color: "rgba(255,255,255,0.75)" }}>indicative only</strong> and do not constitute legal, tax, or customs advice.
          </p>
        </div>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Link href="/en" style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, textDecoration: "none" }}>← Back to home</Link>
        </div>
      </main>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px 40px", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>© 2025 Global Tariff Hub. All rights reserved.</p>
      </footer>
    </div>
  );
}
