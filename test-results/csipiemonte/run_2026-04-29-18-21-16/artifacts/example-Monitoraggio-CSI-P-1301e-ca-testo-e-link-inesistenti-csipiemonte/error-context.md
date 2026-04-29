# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: csipiemonte/example.spec.ts >> Monitoraggio CSI Piemonte >> cloud cybersecurity > nivola > verifica testo e link inesistenti
- Location: tests/csipiemonte/example.spec.ts:20:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Novola il cloud del CSI')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Novola il cloud del CSI')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - navigation "Navigazione veloce":
    - link "Shortcut navigation":
      - /url: javascript:void(0)
      - generic [ref=e2] [cursor=pointer]: Shortcut navigation
    - link "Salta al contenuto principale" [ref=e3] [cursor=pointer]:
      - /url: "#main-content"
  - generic [ref=e5]:
    - banner [ref=e6]:
      - generic [ref=e7]:
        - generic [ref=e11]:
          - link "CSI Piemonte" [ref=e13] [cursor=pointer]:
            - /url: /it
            - generic [ref=e14]: CSI Piemonte
          - navigation "Menu top" [ref=e15]:
            - heading "Menu top" [level=2] [ref=e16]
            - list [ref=e17]:
              - listitem [ref=e18]:
                - link "Lavora con noi" [ref=e19] [cursor=pointer]:
                  - /url: /it/chi-siamo/azienda/lavora-con-noi
              - listitem [ref=e20]:
                - link "Fornitori e gare" [ref=e21] [cursor=pointer]:
                  - /url: /it/fornitori-gare
              - listitem [ref=e22]:
                - link "Contatti" [ref=e23] [cursor=pointer]:
                  - /url: /it/contatti
          - navigation "Lingua" [ref=e24]:
            - list [ref=e25]:
              - listitem [ref=e26]:
                - link "ENG" [ref=e27] [cursor=pointer]:
                  - /url: /en
                - text: "|"
              - listitem [ref=e28]:
                - link "ITA" [ref=e29] [cursor=pointer]:
                  - /url: /it
          - paragraph [ref=e34]:
            - button " cerca" [ref=e35] [cursor=pointer]:
              - text: 
              - generic [ref=e36]: cerca
          - navigation "Menu principale" [ref=e41]:
            - paragraph [ref=e42]: Menu principale
            - list [ref=e44]:
              - listitem [ref=e45]:
                - link "Chi siamo" [ref=e46] [cursor=pointer]:
                  - /url: "#chi-siamo"
              - listitem [ref=e47]:
                - link "Cosa facciamo" [ref=e48] [cursor=pointer]:
                  - /url: "#cosa-facciamo"
              - listitem [ref=e49]:
                - link "Offerta" [ref=e50] [cursor=pointer]:
                  - /url: "#offerta"
              - listitem [ref=e51]:
                - link "Comunicazione" [ref=e52] [cursor=pointer]:
                  - /url: "#comunicazione"
        - generic:
          - generic:
            - generic:  
      - heading "Soluzioni" [level=1] [ref=e61]
    - navigation [ref=e67]:
      - link " Torna indietro" [ref=e70] [cursor=pointer]:
        - /url: "#"
    - main [ref=e71]:
      - article [ref=e77]:
        - generic [ref=e78]:
          - generic [ref=e80]:
            - generic [ref=e81]:
              - generic [ref=e82]: Tipo offerta
              - generic [ref=e83]: Servizi cloud e cybersecurity
            - heading "Nivola il cloud del CSI" [level=1] [ref=e85]
            - generic [ref=e87]:
              - img "logo nivola" [ref=e89]
              - generic [ref=e90]:
                - heading "Il cloud semplice, italiano, sicuro" [level=3] [ref=e91]
                - paragraph [ref=e92]: La piattaforma per l'innovazione digitale della pubblica amministrazione.
          - generic [ref=e93]:
            - generic [ref=e99]:
              - paragraph [ref=e100]:
                - strong [ref=e101]: Nivola è la nostra piattaforma completamente open source, certificata per offrire infrastrutture e servizi cloud specifici per la pubblica amministrazione
              - paragraph [ref=e102]:
                - text: Entrare nel cloud CSI significa avere a disposizione piattaforme, applicativi per le amministrazioni
                - text: e servizi per cittadini e imprese.
            - generic [ref=e103]:
              - generic [ref=e107]:
                - heading "Perché scegliere Nivola" [level=3] [ref=e108]
                - generic [ref=e110]:
                  - generic [ref=e112]:
                    - img "autonomia" [ref=e114]
                    - heading "Autonomia nella gestione" [level=3] [ref=e115]
                    - paragraph [ref=e117]: Ogni cliente sceglie se gestire direttamente le risorse oppure se affidarsi al CSI.
                  - generic [ref=e119]:
                    - img "i" [ref=e121]
                    - heading "Totale controllo sui dati" [level=3] [ref=e122]
                    - paragraph [ref=e124]: I dati risiedono in Italia e il CSI garantisce assistenza e supporto diretti.
                  - generic [ref=e126]:
                    - img "mondo" [ref=e128]
                    - heading "Un mondo di servizi" [level=3] [ref=e129]
                    - paragraph [ref=e131]: Accesso a un ampio catalogo di soluzioni per Comuni e Aziende sanitarie.
                  - generic [ref=e133]:
                    - img "sicurezza" [ref=e135]
                    - heading "Sicurezza ai massimi livelli" [level=3] [ref=e136]
                    - paragraph [ref=e138]: Il CSI è un Provider di tipo «C», il massimo livello previsto per un gestore di cloud. Nivola è qualificata QI2 e QC2 per ospitare dati e servizi ordinari e critici secondo i requisiti dell’Agenzia Nazionale per la Cybersicurezza (ACN).
                  - generic [ref=e140]:
                    - img "c" [ref=e142]
                    - heading "Cloud per le aziende ICT" [level=3] [ref=e143]
                    - paragraph [ref=e145]: Le aziende possono portare su Nivola le applicazioni SaaS per la pubblica amministrazione e fornirle ai clienti complete di tutti i servizi infrastrutturali.
              - generic [ref=e150]:
                - heading "Le caratteristiche di Nivola" [level=2] [ref=e151]
                - generic [ref=e153]:
                  - tablist [ref=e154]:
                    - tab "Modulare e interoperabile" [selected] [ref=e155] [cursor=pointer]
                    - tab "Semplice e trasparente" [selected] [ref=e156] [cursor=pointer]
                    - tab "Distribuito sul territorio" [selected] [ref=e157] [cursor=pointer]
                    - tab "Affidabile, scalabile e potente" [selected] [ref=e158] [cursor=pointer]
                  - tabpanel "Modulare e interoperabile" [ref=e160]:
                    - paragraph [ref=e162]: Permette di migrare e creare servizi su misura per le PA e si integra con strumenti di identità digitale e protocolli pubblici (Spid, PagoPA)
              - generic [ref=e167]:
                - heading "Tutta la catena del valore è di proprietà del CSI" [level=2] [ref=e168]
                - generic [ref=e169]:
                  - paragraph [ref=e170]: Abbiamo il controllo completo di tutti gli asset di Nivola
                  - paragraph [ref=e171]:
                    - strong [ref=e172]: Data center | Progettazione e sviluppo piattaforma | Consegna e servizi | Sicurezza | Infrastrutture
              - generic [ref=e173]:
                - generic [ref=e177]:
                  - heading "Nivola in azione" [level=2] [ref=e178]
                  - generic [ref=e180]:
                    - generic [ref=e182]:
                      - heading "Cloud enabling" [level=3] [ref=e184]
                      - paragraph [ref=e186]:
                        - text: Assessment
                        - text: Progettazione
                        - text: Razionalizzazione
                        - text: Migrazione
                        - text: Formazione
                    - generic [ref=e188]:
                      - heading "Cloud services" [level=3] [ref=e190]
                      - paragraph [ref=e192]:
                        - text: Server virtuali
                        - text: Storage as a Service
                        - text: Database as a Service
                        - text: Backup as a Service
                        - text: Containers
                        - text: Software as a Service
                    - generic [ref=e194]:
                      - heading "Cloud management" [level=3] [ref=e196]
                      - paragraph [ref=e198]:
                        - text: Gestione data center virtuale
                        - text: Ampia gamma servizi "managed"
                        - text: Observability, logging e control room con monitoraggio e alterting h24
                    - generic [ref=e200]:
                      - heading "Cloud security service" [level=3] [ref=e202]
                      - paragraph [ref=e204]:
                        - text: Anti DDOS
                        - text: Vulnerability Assessment
                        - text: PAM
                        - text: SIEM
                        - text: Golden copy
                        - text: AIR Gapping systems
                        - text: Cifratura
                    - generic [ref=e206]:
                      - heading "Cloud support" [level=3] [ref=e208]
                      - paragraph [ref=e210]:
                        - text: Service management
                        - text: Supporto h24
                        - text: Contact center
                        - text: Operations & Engineering
                - generic [ref=e211]:
                  - generic [ref=e215]:
                    - heading "Nivola in numeri" [level=2] [ref=e216]
                    - generic [ref=e218]:
                      - generic [ref=e220]:
                        - generic [ref=e221]: "470"
                        - heading "organizzazioni che usano Nivola" [level=3] [ref=e222]
                      - generic [ref=e224]:
                        - generic [ref=e225]: "2"
                        - heading "region" [level=3] [ref=e226]
                      - generic [ref=e228]:
                        - generic [ref=e229]: "5"
                        - heading "availability zone" [level=3] [ref=e230]
                  - generic [ref=e236]:
                    - paragraph [ref=e237]:
                      - strong [ref=e238]: Cloud federato
                    - paragraph [ref=e239]: Un modello complementare al Polo Strategico Nazionale
                    - paragraph [ref=e240]:
                      - link "scopri di più" [ref=e241] [cursor=pointer]:
                        - /url: /it/project/verso-un-cloud-federato-per-pubblica-amministrazione
                  - generic [ref=e247]:
                    - paragraph [ref=e248]:
                      - strong [ref=e249]:
                        - text: "Abbiamo realizzato la nostra piattaforma Nivola con un obiettivo:"
                        - text: rendere semplice l’utilizzo dei servizi cloud
                    - paragraph [ref=e250]:
                      - link "Scopri di più sul sito di Nivola" [ref=e251] [cursor=pointer]:
                        - /url: https://www.nivolapiemonte.it/
                  - generic [ref=e257]:
                    - heading "Galleria immagini" [level=2] [ref=e258]
                    - generic [ref=e262]:
                      - img "t" [ref=e266] [cursor=pointer]
                      - img "t" [ref=e270] [cursor=pointer]
                      - img "t" [ref=e274] [cursor=pointer]
                      - img "t" [ref=e278] [cursor=pointer]
                      - img "t" [ref=e282] [cursor=pointer]
                      - img "t" [ref=e286] [cursor=pointer]
                      - img "t" [ref=e290] [cursor=pointer]
                      - img "t" [ref=e294] [cursor=pointer]
                      - img "t" [ref=e298] [cursor=pointer]
                      - img "t" [ref=e302] [cursor=pointer]
                      - img "t" [ref=e306] [cursor=pointer]
                      - img "t" [ref=e310] [cursor=pointer]
                      - img "t" [ref=e314] [cursor=pointer]
                      - img "f" [ref=e318] [cursor=pointer]
                      - img "f" [ref=e322] [cursor=pointer]
                      - img "f" [ref=e326] [cursor=pointer]
                      - img "f" [ref=e330] [cursor=pointer]
                      - img "f" [ref=e334] [cursor=pointer]
                - generic [ref=e337]:
                  - heading "Inizia la trasformazione" [level=2] [ref=e339]
                  - paragraph [ref=e341]: Contattaci per scoprire come le nostre soluzioni possono migliorare i tuoi servizi
                  - generic [ref=e342]:
                    - heading "Sezione da compilare" [level=3] [ref=e343]
                    - generic [ref=e344]:
                      - generic [ref=e345]:
                        - generic [ref=e348]:
                          - generic [ref=e349]: Nome
                          - textbox "Nome" [ref=e350]
                        - generic [ref=e353]:
                          - generic [ref=e354]: Cognome
                          - textbox "Cognome" [ref=e355]
                        - generic [ref=e358]:
                          - generic [ref=e359]: Ente o azienda
                          - textbox "Ente o azienda" [ref=e360]
                      - generic [ref=e361]:
                        - generic [ref=e364]:
                          - generic [ref=e365]: Ruolo
                          - textbox "Ruolo" [ref=e366]
                        - generic [ref=e369]:
                          - generic [ref=e370]: Email
                          - textbox "Email" [ref=e371]
                        - generic [ref=e374]:
                          - generic [ref=e375]: Telefono
                          - generic [ref=e376]:
                            - generic [ref=e377]: Telefono
                            - generic [ref=e378]:
                              - 'combobox "Italy (Italia): +39" [ref=e380]'
                              - textbox "Telefono" [ref=e383]:
                                - /placeholder: +39 312 345 6789
                      - generic [ref=e387]:
                        - generic [ref=e388]: Messaggio
                        - textbox "Messaggio" [ref=e390]
                  - generic [ref=e391]:
                    - checkbox "Ho letto e compreso le informazioni sul trattamento dei dati personali rese dal CSI Piemonte ai sensi dell’art. 13 del GDPR" [ref=e392]
                    - text: Ho letto e compreso le informazioni sul trattamento dei dati personali rese dal CSI Piemonte ai sensi dell’art. 13 del GDPR
                    - generic [ref=e394]:
                      - text: (Leggi l'
                      - link "informativa sulla privacy" [ref=e395] [cursor=pointer]:
                        - /url: https://www.csipiemonte.it/it/privacy#due
                      - text: )
                  - button "Invia messaggio" [ref=e397] [cursor=pointer]
                  - generic [ref=e398]: "* indica un campo obbligatorio"
                - generic [ref=e401]:
                  - generic [ref=e402]: Eccellenze e Temi strategici
                  - generic [ref=e403]:
                    - generic [ref=e404]: Cloud
                    - generic [ref=e405]: Cybersecurity
    - navigation "Torna su" [ref=e406]:
      - button " Torna su" [ref=e407] [cursor=pointer]:
        - text: 
        - emphasis:
          - generic [ref=e408]: Torna su
    - contentinfo [ref=e409]:
      - generic [ref=e414]:
        - list [ref=e418]:
          - listitem [ref=e419]:
            - img "Logo CSI Piemonte" [ref=e420]
          - listitem [ref=e421]:
            - img "Logo Best employeers" [ref=e422]
        - separator [ref=e423]
        - generic [ref=e424]:
          - generic [ref=e425]:
            - generic [ref=e427]:
              - generic [ref=e428]:
                - paragraph [ref=e429]:
                  - strong [ref=e430]: CSI PIEMONTE
                  - text: Consorzio per il Sistema Informativo
                - paragraph [ref=e431]: P.Iva 01995120019
              - paragraph [ref=e433]:
                - text: Corso Unione Sovietica, 216
                - text: 10134 Torino - Italy
            - generic [ref=e435]:
              - paragraph [ref=e437]:
                - text: tel. +39.011.3168111
                - text: fax +39.011.3168212
                - text: "PEC: protocollo@cert.csi.it"
              - generic [ref=e438]:
                - list [ref=e439]:
                  - listitem [ref=e440]:
                    - link " Facebook" [ref=e441] [cursor=pointer]:
                      - /url: https://www.facebook.com/pages/CSI-Piemonte/165215993573566?sk=wall
                      - emphasis [ref=e442]:
                        - text: 
                        - generic [ref=e443]: Facebook
                  - listitem [ref=e444]:
                    - link " Instagram" [ref=e445] [cursor=pointer]:
                      - /url: https://www.instagram.com/csipiemonte.official/
                      - emphasis [ref=e446]:
                        - text: 
                        - generic [ref=e447]: Instagram
                  - listitem [ref=e448]:
                    - link " Twitter" [ref=e449] [cursor=pointer]:
                      - /url: https://x.com/csipiemonte
                      - emphasis [ref=e450]:
                        - text: 
                        - generic [ref=e451]: Twitter
                  - listitem [ref=e452]:
                    - link " Linkedin" [ref=e453] [cursor=pointer]:
                      - /url: https://www.linkedin.com/company/csi-piemonte
                      - emphasis [ref=e454]:
                        - text: 
                        - generic [ref=e455]: Linkedin
                  - listitem [ref=e456]:
                    - link " Youtube" [ref=e457] [cursor=pointer]:
                      - /url: https://www.youtube.it/CSIPiemonte
                      - emphasis [ref=e458]:
                        - text: 
                        - generic [ref=e459]: Youtube
                - paragraph [ref=e460]:
                  - link "Social media policy" [ref=e461] [cursor=pointer]:
                    - /url: /it/social-policy
                - paragraph [ref=e462]:
                  - link " Impostazione cookie" [ref=e463] [cursor=pointer]:
                    - /url: "#"
                    - generic [ref=e464]: 
                    - text: Impostazione cookie
          - list [ref=e467]:
            - listitem [ref=e468]:
              - link "Amministrazione trasparente" [ref=e469] [cursor=pointer]:
                - /url: https://trasparenza.csi.it
            - listitem [ref=e470]:
              - link "Whistleblowing" [ref=e471] [cursor=pointer]:
                - /url: /it/whistleblowing
          - list [ref=e474]:
            - listitem [ref=e475]:
              - link "Note legali" [ref=e476] [cursor=pointer]:
                - /url: /it/note-legali
            - listitem [ref=e477]:
              - link "Privacy" [ref=e478] [cursor=pointer]:
                - /url: /it/privacy
            - listitem [ref=e479]:
              - link "Accessibilità" [ref=e480] [cursor=pointer]:
                - /url: /it/accessibilita
            - listitem [ref=e481]:
              - link "Sicurezza sul lavoro" [ref=e482] [cursor=pointer]:
                - /url: /it/sicurezza-sul-lavoro
            - listitem [ref=e483]:
              - link "Certificazioni" [ref=e484] [cursor=pointer]:
                - /url: /it/certificazioni
            - listitem [ref=e485]:
              - link "Responsible Disclosure" [ref=e486] [cursor=pointer]:
                - /url: /it/responsible-disclosure-policy
            - listitem [ref=e487]:
              - link "Contatti" [ref=e488] [cursor=pointer]:
                - /url: /it/contatti
          - generic [ref=e489]:
            - list [ref=e491]:
              - listitem [ref=e492]:
                - img "logo Bureau Veritas" [ref=e493]
              - listitem [ref=e494]:
                - img "bureau veritas" [ref=e495]
              - listitem [ref=e496]:
                - img "veriselect" [ref=e497]
              - listitem [ref=e498]:
                - img "logo openchain" [ref=e499]
            - paragraph [ref=e501]:
              - link "Copyright I contenuti del sito sono rilasciati con licenza Creative Commons Attribuzione Commerciale 2.5 Italia eccetto dove diversamente ed espressamente specificato" [ref=e502] [cursor=pointer]:
                - /url: https://creativecommons.org/licenses/by-nc/2.5/it
                - img "Copyright" [ref=e503]
                - text: I contenuti del sito sono rilasciati con licenza Creative Commons Attribuzione Commerciale 2.5 Italia eccetto dove diversamente ed espressamente specificato
  - generic [ref=e504]:
    - link "Chiudi barra dei cookie" [active] [ref=e505] [cursor=pointer]:
      - /url: "#"
      - generic [ref=e506]: Chiudi barra dei cookie
      - text: X
    - generic [ref=e507]:
      - generic [ref=e509]:
        - text: Questo sito fa uso di cookie tecnici necessari al corretto funzionamento e, con il tuo consenso, di cookie analytics e di terze parti per migliorare l'esperienza di navigazione. Selezionando
        - strong [ref=e510]: Accetta tutti
        - text: acconsenti all’utilizzo di cookie analytics e di terze parti. Puoi modificare le preferenze selezionando
        - strong [ref=e511]: Personalizza
        - text: o, in qualsiasi momento, la voce
        - strong [ref=e512]: Impostazione cookie
        - text: presente al fondo di tutte le pagine. La chiusura del banner mediante selezione della X in alto a destra mantiene le impostazioni standard e dunque navigazione continuerà unicamente con cookie tecnici. Per maggiori informazioni, consulta la
        - link "pagina sulla Privacy" [ref=e513] [cursor=pointer]:
          - /url: /it/privacy
        - text: .
      - generic [ref=e515]:
        - link "Personalizza" [ref=e516] [cursor=pointer]:
          - /url: "#"
        - button "Accetta tutti" [ref=e517] [cursor=pointer]
  - text: ✔ ✘ ✘ ✘
  - generic:
    - generic:
      - text:       
      - button "Chiedi al CSI" [ref=e519] [cursor=pointer]:
        - generic [ref=e520]: Chiedi al CSI
        - img [ref=e522]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Monitoraggio CSI Piemonte', () => {
  4  |   test('navigazione fornitori > professionisti e verifica titolo', async ({ page }) => {
  5  |     // 1. Apre la home page
  6  |     await page.goto('https://www.csipiemonte.it/it');
  7  | 
  8  |     // 2. Clicca sul link "Fornitori e gare"
  9  |     await page.click('a[href*="/fornitori-gare"]');
  10 |     await expect(page).toHaveURL('https://www.csipiemonte.it/it/fornitori-gare');
  11 | 
  12 |     // 3. Dalla pagina fornitori, clicca su "Professionisti"
  13 |     await page.click('a[href*="/fornitori-gare/professionisti"]');
  14 |     await expect(page).toHaveURL('https://www.csipiemonte.it/it/fornitori-gare/professionisti');
  15 | 
  16 |     // 4. Verifica che il titolo "Per i professionisti legali" sia visibile
  17 |     await expect(page.getByText('Per i professionisti legali')).toBeVisible();
  18 |   });
  19 | 
  20 |   test('cloud cybersecurity > nivola > verifica testo e link inesistenti', async ({ page }) => {
  21 |     // Step 1 (OK): Naviga alla pagina servizi cloud e cybersecurity
  22 |     await page.goto('https://www.csipiemonte.it/it/offerta/servizi-cloud-cybersecurity');
  23 | 
  24 |     // Step 2 (FALLIRÀ): Clicca su Nivola e cerca una stringa inesistente
  25 |     await test.step('Verifica testo "Novola il cloud del CSI" (stringa inesistente)', async () => {
  26 |       await page.click('a[href*="/it/soluzione/nivola-cloud-csi"]');
  27 |       // La stringa corretta è "Nivola", non "Novola" → questo expect fallirà
> 28 |       await expect(page.getByText('Novola il cloud del CSI')).toBeVisible({ timeout: 5000 });
     |                                                               ^ Error: expect(locator).toBeVisible() failed
  29 |     });
  30 | 
  31 |     // Step 3 (FALLIRÀ): Clicca su un link inesistente
  32 |     await test.step('Clicca su link "sicurezza-sul-lavo" (URL inesistente)', async () => {
  33 |       await page.click('a[href*="/it/sicurezza-sul-lavo"]');
  34 |     });
  35 |   });
  36 | });
  37 | 
```