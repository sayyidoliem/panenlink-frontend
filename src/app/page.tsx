import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Handshake,
  Leaf,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Route,
  Truck,
  type LucideIcon,
} from "lucide-react";

const whatsappNumber = "6281234567890";
const whatsappMessage =
  "Halo PanenLink, saya mau tanya soal muatan balik.";

const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  whatsappMessage,
)}`;

type ContactItem = {
  label: string;
  href?: string;
  icon: LucideIcon;
};

type WorkStep = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const contactItems: ContactItem[] = [
  {
    label: "+62 812-3456-7890 (Sen-Sab, 08.00-18.00 WIB)",
    href: "tel:+6281234567890",
    icon: Phone,
  },
  {
    label: "halo@panenlink.id",
    href: "mailto:halo@panenlink.id",
    icon: Mail,
  },
  {
    label: "Jl. Raya Pasar Induk Kramat Jati, Jakarta Timur",
    icon: MapPin,
  },
];

const workSteps: WorkStep[] = [
  {
    title: "1. Post Harvest",
    description: "Daftarkan hasil panen dan kebutuhan pengirimanmu.",
    icon: Leaf,
  },
  {
    title: "2. Smart Match",
    description: "PanenLink mencarikan armada dan rute yang paling sesuai.",
    icon: Route,
  },
  {
    title: "3. Transparent Pricing",
    description: "Dapatkan estimasi biaya yang jelas dan transparan.",
    icon: Handshake,
  },
  {
    title: "4. Real-time Tracking",
    description: "Pantau proses pengiriman komoditas dengan lebih mudah.",
    icon: Truck,
  },
];

const farmerBenefits = [
  "Guaranteed timely pickups",
  "Lower logistics costs",
  "Access to vetted drivers",
];

const driverBenefits = [
  "Zero empty return miles",
  "Instant transparent payouts",
  "Flexible route control",
];

export default function Landing() {
  return (
    <>
      <nav className="landing-nav" aria-label="Navigasi utama">
        <Link href="/">
          PanenLink
        </Link>

        <div className="landing-nav-links">
          <a href="#how">How It Works</a>
          <a href="#persona">Dual Persona</a>
          <a href="#about">About Us</a>
          <a href="#kontak">Kontak</a>
        </div>

        <span className="landing-nav-actions">
          <Link href="/login">Masuk</Link>

          <Link href="/register">
            Daftar
          </Link>
        </span>
      </nav>

      <main className="landing">
        <section className="hero">
          <div>
            <h1>
              Stop Empty Miles,
              <br />
              Maximize Harvest Profits
            </h1>

            <p>
              PanenLink connects harvest owners with reliable logistics to
              ensure every mile counts. Reduce deadheading and increase your
              earnings today.
            </p>

            <span>
              <Link href="/register">
                Get Started Now
              </Link>

              <a href="#how">
                See How It Works
              </a>
            </span>
          </div>
        </section>

        <section id="about" className="mission">
          <div>
            <em>
              <Leaf aria-hidden="true" />
              Our Mission
            </em>

            <h2>Eliminating Wasted Logistics, One Truck at a Time</h2>

            <p>
              The agricultural supply chain is plagued by inefficiencies.
              PanenLink matches return trips with nearby harvest owners needing
              transport.
            </p>

            <a href="#how">
              Learn more about our impact
              <ArrowRight aria-hidden="true" />
            </a>
          </div>

          <div
            className="mission-image"
            role="img"
            aria-label="Transportasi hasil panen PanenLink"
          />
        </section>

        <section id="how" className="how">
          <h2>How PanenLink Works</h2>

          <p>
            A seamless, transparent process designed to get your harvest moving
            quickly.
          </p>

          <div>
            {workSteps.map(({ icon: Icon, title, description }) => (
              <article key={title}>
                <Icon aria-hidden="true" />
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="persona" className="personas">
          <article>
            <Leaf aria-hidden="true" />
            <h2>For Farmers</h2>

            {farmerBenefits.map((item) => (
              <p key={item}>
                <CheckCircle2 aria-hidden="true" />
                <span>{item}</span>
              </p>
            ))}
          </article>

          <article>
            <Truck aria-hidden="true" />
            <h2>For Drivers</h2>

            {driverBenefits.map((item) => (
              <p key={item}>
                <CheckCircle2 aria-hidden="true" />
                <span>{item}</span>
              </p>
            ))}
          </article>
        </section>

        <section
          id="kontak"
          className="contact-section"
          aria-labelledby="contact-heading"
        >
          <div className="contact-container">
            <div className="contact-intro">
              <span className="contact-eyebrow">Hubungi PanenLink</span>

              <h2 id="contact-heading">Ngobrol dulu?</h2>

              <p>
                Tim kami siap membantu setup armada dan daftar komoditas kamu
                dalam sehari.
              </p>

              <div className="contact-actions">
                <a href={whatsappUrl}>
                  <MessageCircle aria-hidden="true" />
                  <span>Chat WhatsApp</span>
                </a>

                <a
                  href="mailto:halo@panenlink.id"
                  className="contact-button contact-button-secondary"
                  aria-label="Kirim email ke halo@panenlink.id"
                >
                  <Mail aria-hidden="true" />
                  <span>Email Kami</span>
                </a>
              </div>
            </div>

            <div className="contact-card">
              <h3>Informasi Kontak</h3>

              <ul>
                {contactItems.map(({ label, href, icon: Icon }) => (
                  <li key={label}>
                    <span className="contact-icon">
                      <Icon aria-hidden="true" />
                    </span>

                    <div>
                      {href ? (
                        <a href={href}>{label}</a>
                      ) : (
                        <span>{label}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <strong>PanenLink</strong>

        <span>© 2026 PanenLink Agritech Logistics.</span>

        <div>
          <a href="#about">About</a>
          <a href="#how">How It Works</a>
          <a href="#kontak">Contact</a>
        </div>
      </footer>
    </>
  );
}