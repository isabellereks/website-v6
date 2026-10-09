interface SectionProps {
  id: string;
  number: string;
  label: string;
  children: React.ReactNode;
}

export default function Section({ id, number, label, children }: SectionProps) {
  return (
    <section id={id} className="border-t border-rule py-14 md:py-20">
      <div className="grid gap-6 md:grid-cols-12 md:gap-10">
        <h2 className="flex items-baseline gap-3 text-[11px] font-normal uppercase tracking-[0.18em] text-muted md:col-span-3">
          <span className="tabular-nums">{number}</span>
          <span>{label}</span>
        </h2>
        <div className="md:col-span-9">{children}</div>
      </div>
    </section>
  );
}
