import { Link } from "wouter";

export default function AGB() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border/50 px-6 py-4">
        <Link href="/"><span className="font-serif text-xl tracking-widest text-primary">KAULA SCHOOL</span></Link>
      </nav>

      <main className="container max-w-2xl mx-auto py-16 px-6 space-y-10">
        <div>
          <p className="text-primary/60 text-xs tracking-widest uppercase mb-2">Rechtliches</p>
          <h1 className="font-serif text-4xl tracking-wide mb-2">Allgemeine Geschäftsbedingungen</h1>
          <p className="text-muted-foreground text-sm">Stand: April 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="font-serif text-xl text-foreground">§ 1 Geltungsbereich</h2>
          <p className="text-foreground/80 leading-relaxed">
            Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge zwischen [VOLLSTÄNDIGER NAME] (nachfolgend „Anbieter") und den Nutzerinnen und Nutzern (nachfolgend „Kaulika") der Online-Plattform Kaula School, erreichbar unter kaula.feralawareness.com.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl text-foreground">§ 2 Leistungsbeschreibung</h2>
          <p className="text-foreground/80 leading-relaxed">
            Der Anbieter stellt gegen Entgelt Zugang zu einer Online-Lernplattform mit Videokursen, Übungsmaterialien und Texten zur Trika Kashmir Shaivite Tradition bereit. Alle angebotenen Inhalte sind digitaler Natur und werden ausschließlich online zur Verfügung gestellt.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl text-foreground">§ 3 Vertragsschluss und Laufzeit</h2>
          <p className="text-foreground/80 leading-relaxed">
            Der Vertrag kommt durch Registrierung auf der Plattform, Auswahl eines Abonnementtarifs und erfolgreicher Zahlung über Stripe zustande. Das Abonnement hat eine Mindestlaufzeit von 3 Monaten. Nach Ablauf der Mindestlaufzeit verlängert es sich automatisch um jeweils einen Monat, sofern es nicht mit einer Frist von 14 Tagen zum Ende des laufenden Abrechnungszeitraums gekündigt wird.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl text-foreground">§ 4 Preise und Zahlung</h2>
          <p className="text-foreground/80 leading-relaxed">
            Die Plattform bietet ein Sliding-Scale-Modell mit folgenden Tarifen:
          </p>
          <ul className="list-disc list-inside space-y-1 text-foreground/70 ml-2">
            <li>Sadhaka: € 30,00 / Monat</li>
            <li>Vira: € 50,00 / Monat (in Kürze verfügbar)</li>
            <li>Siddha: € 70,00 / Monat (in Kürze verfügbar)</li>
          </ul>
          <p className="text-foreground/80 leading-relaxed">
            Alle Preise sind Endpreise. Gemäß § 19 UStG wird keine Umsatzsteuer ausgewiesen (Kleinunternehmerregelung). Die Abrechnung erfolgt monatlich im Voraus über Stripe. Alle Tarife gewähren Zugang zum gesamten Kursangebot.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl text-foreground">§ 5 Kündigung</h2>
          <p className="text-foreground/80 leading-relaxed">
            Die Kündigung kann jederzeit über die Kontoeinstellungen oder per E-Mail an <a href="mailto:feral.awareness@gmail.com" className="text-primary hover:underline">feral.awareness@gmail.com</a> erfolgen. Der Zugang bleibt bis zum Ende des bezahlten Abrechnungszeitraums bestehen. Eine Kündigung vor Ablauf der Mindestlaufzeit von 3 Monaten ist nicht möglich.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl text-foreground">§ 6 Widerrufsrecht</h2>
          <p className="text-foreground/80 leading-relaxed">
            Verbraucherinnen und Verbraucher haben grundsätzlich ein 14-tägiges Widerrufsrecht. Da es sich um digitale Inhalte handelt, die auf ausdrücklichen Wunsch des Kaulika sofort bereitgestellt werden, erlischt das Widerrufsrecht mit Beginn der Vertragserfüllung, sofern der Kaulika dem ausdrücklich zugestimmt hat. Weitere Informationen finden Sie in der{" "}
            <Link href="/widerruf"><span className="text-primary hover:underline cursor-pointer">Widerrufsbelehrung</span></Link>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl text-foreground">§ 7 Nutzungsrechte und Pflichten</h2>
          <p className="text-foreground/80 leading-relaxed">
            Der Kaulika erhält ein einfaches, nicht übertragbares Recht zur persönlichen Nutzung der Plattforminhalte. Das Herunterladen, Aufzeichnen, Weiterleiten oder Veröffentlichen von Videoinhalten ist ausdrücklich untersagt. Der Zugang ist strikt personengebunden; eine Weitergabe von Zugangsdaten ist nicht gestattet.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl text-foreground">§ 8 Haftungsbeschränkung</h2>
          <p className="text-foreground/80 leading-relaxed">
            Der Anbieter haftet nur für Schäden, die auf vorsätzlichem oder grob fahrlässigem Verhalten beruhen. Die Plattforminhalte stellen keine medizinische, therapeutische oder psychologische Beratung dar. Die Nutzung der Inhalte erfolgt auf eigene Verantwortung.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl text-foreground">§ 9 Anwendbares Recht und Gerichtsstand</h2>
          <p className="text-foreground/80 leading-relaxed">
            Es gilt deutsches Recht. Für Verbraucher, die ihren Wohnsitz in der EU haben, gelten zusätzlich die zwingenden Verbraucherschutzvorschriften des jeweiligen Wohnsitzstaates. Gerichtsstand ist, soweit gesetzlich zulässig, Berlin.
          </p>
        </section>

        <div className="pt-8 border-t border-border/30 text-xs text-muted-foreground">
          <Link href="/impressum"><span className="hover:text-primary mr-4 cursor-pointer">Impressum</span></Link>
          <Link href="/datenschutz"><span className="hover:text-primary mr-4 cursor-pointer">Datenschutz</span></Link>
          <Link href="/widerruf"><span className="hover:text-primary cursor-pointer">Widerrufsbelehrung</span></Link>
        </div>
      </main>
    </div>
  );
}
