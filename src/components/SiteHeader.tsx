const nav = [
  { label: "Work", href: "#work" },
  { label: "Experience", href: "#experience" },
  { label: "Writing", href: "#writing" },
  { label: "Reading", href: "#reading" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:px-10">
        <a href="#top" className="font-display text-[15px] font-bold tracking-tight">
          Isabelle Reksopuro
        </a>
        <nav className="flex items-center gap-6 text-[13px] text-muted">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hidden transition-colors hover:text-ink md:inline"
            >
              {item.label}
            </a>
          ))}
          <a href="#contact" className="transition-colors hover:text-ink">
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}
