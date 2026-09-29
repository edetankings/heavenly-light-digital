import type { ComponentProps } from "react";
import { Slot } from "@radix-ui/react-slot";
import logo from "@/assets/church-logo.jpg";

export function ChurchLogo(props: Omit<ComponentProps<"img">, "src" | "width" | "height">) {
  return (
    <img
      alt="Risen Power Gospel Ministries"
      {...props}
      src={logo}
      width={1254}
      height={1254}
      className={`site-logo ${props.className ?? ""}`}
    />
  );
}

export function ChurchBrand() {
  return (
    <span className="site-brand">
      <ChurchLogo alt="" />
      <span className="site-brand-name">
        <span>Risen Power</span>
        <span>Gospel Ministries</span>
      </span>
    </span>
  );
}

export function SiteButton({
  asChild = false,
  tone = "gold",
  className = "",
  ...props
}: ComponentProps<"button"> & { asChild?: boolean; tone?: "gold" | "outline" }) {
  const Component = asChild ? Slot : "button";
  return (
    <Component
      {...(!asChild ? { type: "button" as const } : {})}
      {...props}
      className={`site-button site-button--${tone} ${className}`}
    />
  );
}

export function SiteContainer({ className = "", ...props }: ComponentProps<"div">) {
  return <div {...props} className={`site-container ${className}`} />;
}

export function SiteCard({ className = "", ...props }: ComponentProps<"article">) {
  return <article {...props} className={`site-card ${className}`} />;
}
