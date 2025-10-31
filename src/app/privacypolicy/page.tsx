import type { Metadata } from "next";


export const metadata: Metadata = {
    title: "Privacy Policy – The Miracle",
    description: "Privacy policy describing cookies and other legal information for The Miracle project.",
};

export default function PrivacyPolicyPage() {
    return (
        <main style={{ maxWidth: 900, margin: "2rem auto", padding: "0 1rem", lineHeight: 1.6 }}>
            <h1>Privacy Policy</h1>
            <p>
                Effective date: {new Date().toISOString().slice(0, 10)}. This Privacy Policy explains how The
                Miracle (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, and shares information — including cookies —
                when you use our website or services. This is not legal advice; replace contact details and
                adapt text for your jurisdiction or consult counsel as needed.
            </p>

            <h2>Information We Collect</h2>
            <ul>
                <li>Information you provide directly (e.g., contact forms, account information).</li>
                <li>Automatically collected information (e.g., device, browser, IP address, usage data).</li>
                <li>Cookies and similar tracking technologies (described below).</li>
            </ul>

            <h2>Cookies and Similar Technologies</h2>
            <p>
                We use cookies and similar technologies to operate and improve the site. Cookies are small
                text files placed on your device. Below are the common cookie categories we use:
            </p>

            <h3>1. Strictly Necessary</h3>
            <p>
                These cookies are required for the website to function (session management, security). They
                cannot be turned off in our systems.
            </p>

            <h3>2. Performance / Analytics</h3>
            <p>
                These cookies collect anonymous information about how visitors use the site (pages visited,
                errors). We use this to improve performance and content. Example providers: Google Analytics,
                Plausible, or other analytics services you configure.
            </p>

            <h3>3. Functional</h3>
            <p>
                Functional cookies remember choices you make (language or region preferences) to improve
                your experience.
            </p>

            <h3>4. Advertising / Targeting</h3>
            <p>
                These cookies may be used to deliver ads relevant to your interests. They may be set by
                third-party advertising networks. We do not store sensitive personal data in cookies.
            </p>

            <h2>Third-Party Services</h2>
            <p>
                We may use third-party vendors to provide analytics, hosting, payments, error reporting, and
                other services. Those vendors may set cookies or collect information on our behalf. Typical
                examples include:
            </p>
            <ul>
                <li>Analytics providers (e.g., Google Analytics, Plausible)</li>
                <li>Hosting and infrastructure (e.g., Vercel, Netlify)</li>
                <li>Payment processors (e.g., Stripe) — only when payment features are used</li>
            </ul>

            <h2>How to Control Cookies</h2>
            <ul>
                <li>
                    Browser settings: most browsers allow you to block or delete cookies via preferences or
                    settings. See your browser&apos;s help pages for instructions.
                </li>
                <li>
                    Opt-out links: analytics providers often provide opt-out mechanisms (for example, Google
                    provides an opt-out browser add-on).
                </li>
                <li>
                    Consent management: if you add a consent banner, use it to manage analytics/marketing
                    cookie consent.
                </li>
            </ul>

            <h2>Legal Basis for Processing (where applicable)</h2>
            <p>
                Where required by law, we process personal data based on your consent and/or our legitimate
                interests (operating and improving the site, ensuring security, and providing services).
            </p>

            <h2>Data Retention</h2>
            <p>
                We retain personal information for as long as necessary to provide services, comply with
                legal obligations, resolve disputes, and enforce agreements. Retention periods vary by data
                type and purpose; shorten or extend these periods to match your operational needs.
            </p>

            <h2>Your Rights</h2>
            <p>Depending on your jurisdiction, you may have rights including:</p>
            <ul>
                <li>Access to personal data we hold about you</li>
                <li>Correction of inaccurate data</li>
                <li>Deletion or restriction of processing</li>
                <li>Objecting to processing or withdrawing consent</li>
                <li>Data portability</li>
            </ul>
            <p>
                To exercise these rights, contact us at the address below. We may ask for proof of identity
                and will respond in accordance with applicable law.
            </p>

            <h2>Security</h2>
            <p>
                We implement reasonable technical and organizational measures designed to protect personal
                data. However, no system is completely secure. Report suspected breaches to the contact
                below immediately.
            </p>

            <h2>Children</h2>
            <p>
                Our services are not directed to children under 16. We do not knowingly collect personal data
                from children. If you believe we have collected such data, contact us to request deletion.
            </p>

            <h2>Changes to This Policy</h2>
            <p>
                We may update this policy to reflect changes in our practices or legal requirements. We will
                post the updated policy with a new effective date.
            </p>

            <h2>Contact</h2>
            <p>
                Questions or requests about this policy: replace the address below with your project&apos;s
                contact.
            </p>
            <address>
                The Miracle<br />
                Email: <a href="mailto:info@themiracle.love">info@themiracle.love</a>
            </address>

            <hr />

            <p style={{ fontSize: 12, color: "#555" }}>
                Note: This privacy policy template is provided for convenience and should be adapted for your
                project and reviewed by legal counsel to ensure compliance with applicable laws (e.g., GDPR,
                CCPA/CPRA, ePrivacy Directive).
            </p>
        </main>
    );
}