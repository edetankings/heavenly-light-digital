import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MapPin, Phone } from "lucide-react";
import { siteLinks } from "@/lib/site-navigation";
import { ChurchBrand, SiteButton, SiteContainer } from "./SitePrimitives";

export function Footer() {
  return (
    <footer className="site-footer">
      <SiteContainer>
        <div className="site-footer-invitation">
          <div>
            <p className="site-eyebrow">Faith. Fellowship. A place to belong.</p>
            <h2>
              There is a place
              <br />
              <em>for you here.</em>
            </h2>
          </div>
          <SiteButton asChild tone="outline">
            <Link to="/about">
              Plan your visit <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </SiteButton>
        </div>
        <div className="site-footer-grid">
          <div className="site-footer-brand">
            <Link
              to="/"
              className="site-brand-link"
              aria-label="Risen Power Gospel Ministries home"
            >
              <ChurchBrand />
            </Link>
            <p>
              Where faith is ignited, lives are transformed, and God's power is revealed. Join us in
              Delta State as we encounter the living God together.
            </p>
          </div>
          <nav aria-label="Footer navigation">
            <h3 className="site-eyebrow">Explore</h3>
            <ul className="site-footer-links">
              {siteLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h3 className="site-eyebrow">Find us</h3>
            <address className="site-footer-address">
              <a
                href="https://maps.app.goo.gl/PtuwLzYDwzKFwocJ9?g_st=ac"
                target="_blank"
                rel="noreferrer"
              >
                <MapPin size={18} aria-hidden="true" />
                <span>
                  VITAFOAM Comfort Center, DSC Expressway, Effurun GRA, Warri 330102, Delta State,
                  Nigeria
                </span>
              </a>
              <a href="tel:09072523125">
                <Phone size={18} aria-hidden="true" />
                <span>09072523125</span>
              </a>
            </address>
          </div>
          <div>
            <h3 className="site-eyebrow">Gather with us</h3>
            <dl className="site-service-times">
              <div>
                <dt>Sunday</dt>
                <dd>8:00 AM Divine Service</dd>
              </div>
              <div>
                <dt>Wednesday</dt>
                <dd>5:00 PM Bible Study</dd>
              </div>
              <div>
                <dt>Friday</dt>
                <dd>5:00 PM Revival Service</dd>
              </div>
              <div>
                <dt>1st &amp; 3rd Saturday</dt>
                <dd>8:00 AM Morning Prayer</dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="site-footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} Risen Power Gospel Ministries. All rights reserved.
          </p>
          <p>
            &ldquo;For the kingdom of God is not in word, but in power.&rdquo; &mdash; 1 Cor 4:20
          </p>
        </div>
      </SiteContainer>
    </footer>
  );
}
