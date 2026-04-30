import { test, expect } from '@playwright/test';

test.describe('Monitoraggio Regione Piemonte', () => {
  test('1 - risposta home page www.regione.piemonte.it', async ({ page }) => {
    const response = await page.goto('https://www.regione.piemonte.it');
    expect(response?.status()).toBeLessThan(400);
  });

  test('2 - risposta pagina /web/pinforma', async ({ page }) => {
    const response = await page.goto('https://www.regione.piemonte.it/web/pinforma');
    expect(response?.status()).toBeLessThan(400);
  });

  test('3 - ricerca turismo: titolo "torino" e tipo "comunicati_stampa_giunta"', async ({ page }) => {
    await page.goto('https://www.regione.piemonte.it/web/pinforma/temi/turismo?type=news_pi');

    // Inserisce "torino" nel campo titolo
    await page.fill('input[name="title"]', 'torino');

    // Seleziona "comunicati_stampa_giunta" nel campo tipo di contenuto
    await page.selectOption('select[name="type"]', 'comunicati_stampa_giunta');

    // Attiva la ricerca (submit del form)
    await page.click('button[type="submit"], input[type="submit"]');

    // Attende che la pagina carichi i risultati
    await page.waitForLoadState('networkidle');

    // Verifica che la pagina risponda con successo
    expect(page.url()).toContain('regione.piemonte.it');
  });
});
