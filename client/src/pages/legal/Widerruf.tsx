import { Link } from "wouter";

export default function Widerruf() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border/50 px-6 py-4">
        <Link href="/"><span className="font-serif text-xl tracking-widest text-primary">KAULA SCHOOL</span></Link>
      </nav>

      <main className="container max-w-2xl mx-auto py-16 px-6 space-y-10">
        <div>
          <p className="text-primary/60 text-xs tracking-widest uppercase mb-2">Rechtliches</p>
          <h1 className="font-serif text-4xl tracking-wide mb-2">Widerrufsbelehrung</h1>
          <p className="text-muted-foreground text-sm">Gemäß §§ 355, 356 BGB</p>
        </div>

        <section className="space-y-3">
          <h2 className="font-serif text-xl text-foreground">Widerrufsrecht</h2>
          <p className="text-foreground/80 leading-relaxed">
            Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.
          </p>
          <p className="text-foreground/80 leading-relaxed">
            Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsschlusses.
          </p>
          <p className="text-foreground/80 leading-relaxed">
            Um Ihr Widerrufsrecht auszuüben, müssen Sie uns ([VOLLSTÄNDIGER NAME], [ADRESSE], Deutschland, E-Mail: <a href="mailto:feral.awareness@gmail.com" className="text-primary hover:underline">feral.awareness@gmail.com</a>) mittels einer eindeutigen Erklärung (z. B. eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.
          </p>
          <p className="text-foreground/80 leading-relaxed">
            Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl text-foreground">Folgen des Widerrufs</h2>
          <p className="text-foreground/80 leading-relaxed">
            Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart.
          </p>
        </section>

        <section className="space-y-4 bg-muted/30 border border-border/50 rounded-xl p-6">
          <h2 className="font-serif text-xl text-foreground">Erlöschen des Widerrufsrechts bei digitalen Inhalten</h2>
          <p className="text-foreground/80 leading-relaxed font-medium">
            Das Widerrufsrecht erlischt vorzeitig, wenn:
          </p>
          <ul className="list-disc list-inside space-y-2 text-foreground/70 ml-2">
            <li>der Anbieter mit der Ausführung des Vertrags begonnen hat,</li>
            <li>Sie ausdrücklich zugestimmt haben, dass der Anbieter vor Ablauf der Widerrufsfrist mit der Ausführung beginnt, <strong>und</strong></li>
            <li>Sie Ihre Kenntnis davon bestätigt haben, dass Sie durch Ihre Zustimmung Ihr Widerrufsrecht verlieren.</li>
          </ul>
          <p className="text-foreground/80 leading-relaxed">
            Durch Ankreuzen des entsprechenden Kästchens im Bestellprozess haben Sie dieser Bedingung ausdrücklich zugestimmt (§ 356 Abs. 5 BGB). Der Zugang zur Plattform wird unmittelbar nach erfolgreicher Zahlung gewährt.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl text-foreground">Muster-Widerrufsformular</h2>
          <p className="text-foreground/80 leading-relaxed text-sm">
            (Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.)
          </p>
          <div className="border border-border/50 rounded-lg p-4 text-sm text-foreground/70 space-y-2 font-mono">
            <p>An: [VOLLSTÄNDIGER NAME], [ADRESSE], feral.awareness@gmail.com</p>
            <p>Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Dienstleistungen (*):</p>
            <p>Bestellt am (*): ___________</p>
            <p>Name des/der Verbraucher(s): ___________</p>
            <p>Anschrift des/der Verbraucher(s): ___________</p>
            <p>Unterschrift (nur bei Mitteilung auf Papier): ___________</p>
            <p>Datum: ___________</p>
            <p className="text-xs text-muted-foreground">(*) Unzutreffendes streichen.</p>
          </div>
        </section>

        <div className="pt-8 border-t border-border/30 text-xs text-muted-foreground">
          <Link href="/impressum"><span className="hover:text-primary mr-4 cursor-pointer">Impressum</span></Link>
          <Link href="/datenschutz"><span className="hover:text-primary mr-4 cursor-pointer">Datenschutz</span></Link>
          <Link href="/agb"><span className="hover:text-primary cursor-pointer">AGB</span></Link>
        </div>
      </main>
    </div>
  );
}
