"use client";

import Link from "next/link";
import { Syne } from "next/font/google";
import {
  ArrowRight,
  CheckCircle2,
  Handshake,
  Leaf,
  Route,
  Truck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const display = Syne({ subsets: ["latin"], weight: ["700", "800"] });

const ticker = [
  "Return-trip matching",
  "Harvest-first routing",
  "Transparent pricing",
  "Live tracking",
  "Fewer empty miles",
];

const steps = [
  {
    icon: Leaf,
    title: "Post Harvest",
    body: "Share volume, origin, and the pickup window in minutes.",
  },
  {
    icon: Route,
    title: "Smart Match",
    body: "Nearby return trips are paired with the harvest that needs to move.",
  },
  {
    icon: Handshake,
    title: "Transparent Pricing",
    body: "Agree on a clear rate before the truck leaves the field.",
  },
  {
    icon: Truck,
    title: "Live Tracking",
    body: "Follow the shipment until it reaches the buyer.",
  },
];

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-in");
          observer.disconnect();
        }
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

export default function Landing() {
  const [solidNav, setSolidNav] = useState(false);
  const missionRef = useReveal<HTMLElement>();
  const howRef = useReveal<HTMLElement>();
  const personaRef = useReveal<HTMLElement>();
  const closeRef = useReveal<HTMLElement>();

  useEffect(() => {
    const onScroll = () => setSolidNav(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav className={`landing-nav${solidNav ? " is-solid" : ""}`}>
        <b className={display.className}>
          <svg className="landing-mark" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4.8 19.2C5.2 11.2 12 4.6 20.8 4.2C20.2 12.4 13.4 19 4.8 19.2Z" />
            <path d="M7 18.4C9.4 14.2 13.8 11 19.2 9.8" />
          </svg>
          PanenLink
        </b>
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
          <div className="hero-media" aria-hidden="true" />
          <div className="hero-copy">
            <b className={`hero-brand ${display.className}`}>PanenLink</b>
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
            <div className="hero-actions">
              <Link className="button secondary" href="/register">
                Get Started Now
              </Link>
              <a className="button glass" href="#how">
                See How It Works
              </a>
            </div>
          </div>
        </section>

        <div id="features" className="landing-ticker">
          <div className="landing-ticker-track">
            {[...ticker, ...ticker].map((item, index) => (
              <span key={`${item}-${index}`}>{item}</span>
            ))}
          </div>
        </div>

        <section id="about" className="mission reveal" ref={missionRef}>
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
            <a href="#how">
              Learn more about our impact <ArrowRight />
            </a>
          </div>
          <div className="mission-image" />
        </section>

        <section id="how" className="how reveal" ref={howRef}>
          <h2>How PanenLink Works</h2>
          <p>
            A seamless, transparent process designed to get your harvest moving
            quickly.
          </p>
          <ol className="how-flow">
            {steps.map(({ icon: Icon, title, body }, index) => (
              <li key={title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <Icon />
                <h3>{title}</h3>
                <p>{body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="persona" className="personas reveal" ref={personaRef}>
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

        <section className="landing-close reveal" ref={closeRef}>
          <b className={display.className}>PanenLink</b>
          <h2>Move harvest with fewer empty miles.</h2>
          <p>
            Join farmers and drivers who already treat every return trip as
            another harvest opportunity.
          </p>
          <Link className="button secondary" href="/register">
            Get Started Now
          </Link>
        </section>
      </main>

      <footer>
        PanenLink <span>© 2026 PanenLink Agritech Logistics.</span>
      </footer>
    </>
  );
}
