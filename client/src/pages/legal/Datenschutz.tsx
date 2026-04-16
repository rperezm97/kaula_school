import { Link } from "wouter";

export default function Datenschutz() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border/50 px-6 py-4">
        <Link href="/"><span className="font-serif text-xl tracking-widest text-primary">KAULA SCHOOL</span></Link>
      </nav>

      <main className="container max-w-2xl mx-auto py-16 px-6 space-y-10">
        <div>
          <p className="text-primary/60 text-xs tracking-widest uppercase mb-2">Rechtliches</p>
          <h1 className="font-serif text-4xl tracking-wide mb-2">Datenschutzerklärung</h1>
          <p className="text-muted-foreground text-sm">Gemäß DSGVO (EU) 2016/679</p>
        </div>

        <section className="space-y-3">
          <h2 className="font-serif text-xl text-foreground">1. Verantwortlicher</h2>
          <p className="text-foreground/80 leading-relaxed">
            Verantwortlicher im Sinne der DSGVO ist [VOLLSTÄNDIGER NAME], [ADRESSE], Deutschland.
            Kontakt: <a href="mailto:feral.awareness@gmail.com" className="text-primary hover:underline">feral.awareness@gmail.com</a>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl text-foreground">2. Erhobene Daten und Zweck</h2>
          <p className="text-foreground/80 leading-relaxed">
            Bei der Registrierung und Nutzung der Plattform verarbeiten wir folgende personenbezogene Daten:
          </p>
          <ul className="list-disc list-inside space-y-1 text-foreground/70 ml-2">
            <li>Name und E-Mail-Adresse (Registrierung, Kommunikation, Rechnungsstellung)</li>
            <li>Zahlungsdaten (verarbeitet durch Stripe, Inc. — wir speichern keine Kartendaten)</li>
            <li>Lernfortschritt und Lesezeichen (zur Bereitstellung des Kursangebots)</li>
            <li>IP-Adresse und technische Zugriffsdaten (Serversicherheit, gesetzliche Pflicht)</li>
          </ul>
          <p className="text-foreground/80 leading-relaxed">
            Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigte Interessen).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl text-foreground">3. Drittanbieter</h2>
          <div className="space-y-4 text-foreground/80 leading-relaxed">
            <div>
              <p className="font-medium text-foreground">Stripe, Inc.</p>
              <p>Zahlungsabwicklung. Stripe verarbeitet Zahlungsdaten unter eigener Datenschutzverantwortung (USA, EU-Standardvertragsklauseln). Datenschutzerklärung: stripe.com/de/privacy</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Resend, Inc.</p>
              <p>Transaktionale E-Mails (Anmeldebestätigung, Zahlungsbelege). Datenschutzerklärung: resend.com/privacy</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Cloudflare, Inc.</p>
              <p>Hosting und CDN. Cloudflare kann technische Zugriffsdaten verarbeiten. Datenschutzerklärung: cloudflare.com/privacypolicy/</p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl text-foreground">4. Cookies</h2>
          <p className="text-foreground/80 leading-relaxed">
            Wir verwenden ausschließlich ein technisch notwendiges Session-Cookie zur Authentifizierung (<code className="bg-muted px-1 rounded text-sm">app_session_id</code>). Dieses Cookie ist für den Betrieb der Plattform erforderlich und enthält keine personenbezogenen Daten. Es werden keine Tracking- oder Analyse-Cookies eingesetzt.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl text-foreground">5. Speicherdauer</h2>
          <p className="text-foreground/80 leading-relaxed">
            Personenbezogene Daten werden gelöscht, sobald sie für den ursprünglichen Zweck nicht mehr erforderlich sind und keine gesetzlichen Aufbewahrungsfristen bestehen (Buchführungsdaten: 10 Jahre gemäß HGB/AO).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl text-foreground">6. Ihre Rechte</h2>
          <p className="text-foreground/80 leading-relaxed">Sie haben das Recht auf:</p>
          <ul className="list-disc list-inside space-y-1 text-foreground/70 ml-2">
            <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
            <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
            <li>Löschung Ihrer Daten (Art. 17 DSGVO)</li>
            <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
            <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
            <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
          </ul>
          <p className="text-foreground/80 leading-relaxed">
            Zur Ausübung Ihrer Rechte wenden Sie sich an:{" "}
            <a href="mailto:feral.awareness@gmail.com" className="text-primary hover:underline">feral.awareness@gmail.com</a>
          </p>
          <p className="text-foreground/80 leading-relaxed">
            Sie haben außerdem das Recht, sich bei der zuständigen Aufsichtsbehörde zu beschweren. In Berlin ist dies der Berliner Beauftragte für Datenschutz und Informationsfreiheit.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl text-foreground">7. Kontoanfragen</h2>
          <p className="text-foreground/80 leading-relaxed">
            Löschanfragen für Ihr Konto können Sie per E-Mail an{" "}
            <a href="mailto:feral.awareness@gmail.com" className="text-primary hover:underline">feral.awareness@gmail.com</a>{" "}
            stellen. Wir bearbeiten Anfragen innerhalb von 30 Tagen.
          </p>
        </section>

        <div className="pt-8 border-t border-border/30 text-xs text-muted-foreground">
          <Link href="/impressum"><span className="hover:text-primary mr-4 cursor-pointer">Impressum</span></Link>
          <Link href="/agb"><span className="hover:text-primary mr-4 cursor-pointer">AGB</span></Link>
          <Link href="/widerruf"><span className="hover:text-primary cursor-pointer">Widerrufsbelehrung</span></Link>
        </div>
      </main>
    </div>
  );
}
