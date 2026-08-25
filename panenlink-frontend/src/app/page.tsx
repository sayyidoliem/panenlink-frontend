import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Handshake,
  Leaf,
  Route,
  Truck,
} from "lucide-react";
export default function Landing() {
  return (
    <>
      <nav className="landing-nav">
        <b>PanenLink</b>
        <div>
          <a href="#features">Features</a>
          <a href="#how">How It Works</a>
          <a href="#persona">Dual Persona</a>
          <a href="#about">About Us</a>
        </div>
        <span>
          <Link href="/login">Masuk</Link>
          <Link className="button secondary" href="/register">
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
              <Link className="button secondary" href="/register">
                Get Started Now
              </Link>
              <a className="button glass" href="#how">
                See How It Works
              </a>
            </span>
          </div>
        </section>
        <section id="about" className="mission">
          <div>
            <em>
              <Leaf /> Our Mission
            </em>
            <h2>Eliminating Wasted Logistics, One Truck at a Time</h2>
            <p>
              The agricultural supply chain is plagued by inefficiencies.
              PanenLink matches return trips with nearby harvest owners needing
              transport.
            </p>
            <a>
              Learn more about our impact <ArrowRight />
            </a>
          </div>
          <div className="mission-image" />
        </section>
        <section id="how" className="how">
          <h2>How PanenLink Works</h2>
          <p>
            A seamless, transparent process designed to get your harvest moving
            quickly.
          </p>
          <div>
            {[
              [Leaf, "1. Post Harvest"],
              [Route, "2. Smart Match"],
              [Handshake, "3. Transparent Pricing"],
              [Truck, "4. Real-time Tracking"],
            ].map(([I, t]) => {
              const X = I as typeof Leaf;
              return (
                <article key={String(t)}>
                  <X />
                  <h3>{String(t)}</h3>
                  <p>
                    Fast, transparent, and designed for better agricultural
                    logistics.
                  </p>
                </article>
              );
            })}
          </div>
        </section>
        <section id="persona" className="personas">
          <article>
            <Leaf />
            <h2>For Farmers</h2>
            {[
              "Guaranteed timely pickups",
              "Lower logistics costs",
              "Access to vetted drivers",
            ].map((x) => (
              <p key={x}>
                <CheckCircle2 />
                {x}
              </p>
            ))}
          </article>
          <article>
            <Truck />
            <h2>For Drivers</h2>
            {[
              "Zero empty return miles",
              "Instant transparent payouts",
              "Flexible route control",
            ].map((x) => (
              <p key={x}>
                <CheckCircle2 />
                {x}
              </p>
            ))}
          </article>
        </section>
      </main>
      <footer>
        PanenLink <span>© 2026 PanenLink Agritech Logistics.</span>
      </footer>
    </>
  );
}
