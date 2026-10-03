import { Link } from "@tanstack/react-router";
import { ChurchBrand, SiteContainer } from "./SitePrimitives";

export function Footer() {
  return (
    <footer className="site-footer site-footer--simple">
      <SiteContainer>
        <div className="site-footer-brand">
          <Link to="/" className="site-brand-link" aria-label="Risen Power Gospel Ministries home">
            <ChurchBrand />
          </Link>
          <p>
            Where faith is ignited, lives are transformed, and God's power is revealed. Join us in
            Delta State as we encounter the living God together.
          </p>
        </div>
      </SiteContainer>
    </footer>
  );
}
