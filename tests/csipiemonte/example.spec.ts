import { test, expect } from '@playwright/test';

test.describe('Monitoraggio CSI Piemonte', () => {
  test('navigazione fornitori > professionisti e verifica titolo', async ({ page }) => {
    // 1. Apre la home page
    await page.goto('https://www.csipiemonte.it/it');

    // 2. Clicca sul link "Fornitori e gare"
    await page.click('a[href*="/fornitori-gare"]');
    await expect(page).toHaveURL('https://www.csipiemonte.it/it/fornitori-gare');

    // 3. Dalla pagina fornitori, clicca su "Professionisti"
    await page.click('a[href*="/fornitori-gare/professionisti"]');
    await expect(page).toHaveURL('https://www.csipiemonte.it/it/fornitori-gare/professionisti');

    // 4. Verifica che il titolo "Per i professionisti legali" sia visibile
    await expect(page.getByText('Per i professionisti legali')).toBeVisible();
  });

  test('cloud cybersecurity > nivola > verifica testo e link inesistenti', async ({ page }) => {
    // Step 1 (OK): Naviga alla pagina servizi cloud e cybersecurity
    await page.goto('https://www.csipiemonte.it/it/offerta/servizi-cloud-cybersecurity');

    // Step 2 (FALLIRÀ): Clicca su Nivola e cerca una stringa inesistente
    await test.step('Verifica testo "Novola il cloud del CSI" (stringa inesistente)', async () => {
      await page.click('a[href*="/it/soluzione/nivola-cloud-csi"]');
      // La stringa corretta è "Nivola", non "Novola" → questo expect fallirà
      await expect(page.getByText('Novola il cloud del CSI')).toBeVisible({ timeout: 5000 });
    });

    // Step 3 (FALLIRÀ): Clicca su un link inesistente
    await test.step('Clicca su link "sicurezza-sul-lavo" (URL inesistente)', async () => {
      await page.click('a[href*="/it/sicurezza-sul-lavo"]');
    });
  });
});
