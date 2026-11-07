"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Mietvertrag" },
  { href: "/etikette", label: "Etikette" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="nav">
      {LINKS.map((l) => {
        const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} className={active ? "nav-link is-active" : "nav-link"}>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
