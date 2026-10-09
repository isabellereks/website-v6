import NowPlaying from "./NowPlaying";

const nav = [
  { label: "Work", href: "#work" },
  { label: "Writing", href: "#writing" },
  { label: "Contact", href: "#contact" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/85 backdrop-blur-md">
      <div className="mx-auto grid h-14 max-w-[1120px] grid-cols-[1fr_auto_1fr] items-center px-5 md:px-10">
        <a href="#top" className="font-display text-[15px] font-bold tracking-tight">
          Isabelle Reksopuro
        </a>
        <div className="pt-[10px]">
          <NowPlaying />
        </div>
        <nav className="flex items-center justify-end gap-5 text-[13px] text-muted">
          {nav.map((item, i) => (
            <a
              key={item.href}
              href={item.href}
              className={`transition-colors hover:text-ink ${i < nav.length - 1 ? "hidden md:inline" : ""}`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
