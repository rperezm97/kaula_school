import { Link } from "wouter";

export default function Impressum() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border/50 px-6 py-4">
        <Link href="/"><span className="font-serif text-xl tracking-widest text-primary">KAULA SCHOOL</span></Link>
      </nav>

      <main className="container max-w-2xl mx-auto py-16 px-6 space-y-8">
        <div>
          <p className="text-primary/60 text-xs tracking-widest uppercase mb-2">Rechtliches</p>
          <h1 className="font-serif text-4xl tracking-wide mb-2">Impressum</h1>
          <p className="text-muted-foreground text-sm">Angaben gemäß § 5 TMG</p>
        </div>

        <section className="space-y-1 text-foreground/80 leading-relaxed">
          <p className="font-medium text-foreground">[VOLLSTÄNDIGER NAME]</p>
          <p>[STRAßE UND HAUSNUMMER]</p>
          <p>[PLZ] [STADT]</p>
          <p>Deutschland</p>
        </section>

        <section className="space-y-1">
          <h2 className="text-sm tracking-widest uppercase text-primary/60 mb-2">Kontakt</h2>
          <p className="text-foreground/80">E-Mail: <a href="mailto:feral.awareness@gmail.com" className="text-primary hover:underline">feral.awareness@gmail.com</a></p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm tracking-widest uppercase text-primary/60 mb-2">Verantwortlich für den Inhalt</h2>
          <p className="text-foreground/80">[VOLLSTÄNDIGER NAME], [ADRESSE WIE OBEN]</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm tracking-widest uppercase text-primary/60 mb-2">Umsatzsteuer</h2>
          <p className="text-foreground/80">
            Gemäß § 19 UStG wird keine Umsatzsteuer ausgewiesen (Kleinunternehmerregelung).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm tracking-widest uppercase text-primary/60 mb-2">Streitschlichtung</h2>
          <p className="text-foreground/80">
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
            <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              https://ec.europa.eu/consumers/odr/
            </a>
          </p>
          <p className="text-foreground/80">
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>

        <div className="pt-8 border-t border-border/30 text-xs text-muted-foreground">
          <Link href="/datenschutz"><span className="hover:text-primary mr-4 cursor-pointer">Datenschutz</span></Link>
          <Link href="/agb"><span className="hover:text-primary mr-4 cursor-pointer">AGB</span></Link>
          <Link href="/widerruf"><span className="hover:text-primary cursor-pointer">Widerrufsbelehrung</span></Link>
        </div>
      </main>
    </div>
  );
}
