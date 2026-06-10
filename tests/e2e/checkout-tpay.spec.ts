import { test, expect } from "@playwright/test";

/**
 * E2e test checkout flow z Tpay (sandbox).
 * 
 * UWAGA: RetroHouse używa uproszczonego checkout flow (api/checkout/route.ts),
 * bez Medusa SDK na froncie. Ten test wymaga:
 * 1. Działającego Medusa backend z Tpay provider (sandbox).
 * 2. Produktów w katalogu Medusa.
 * 3. Skonfigurowanych ENV: TPAY_CLIENT_ID, TPAY_SECRET, TPAY_SANDBOX=true.
 * 
 * Test flow:
 * 1. Dodaj produkt do koszyka.
 * 2. Przejdź do checkout.
 * 3. Wypełnij formularz (adres, telefon, email).
 * 4. Wybierz płatność Tpay.
 * 5. Zostań przekierowany na sandbox Tpay.
 * 6. (Manualne: zapłać testowym BLIK 777123 lub kartą testową).
 * 7. Sprawdź czy zamówienie powstało.
 * 
 * UWAGA: Pełna automatyzacja wymaga mockowania webhook Tpay lub użycia
 * Tpay sandbox API do symulacji płatności. Na ten moment: semi-manual test.
 */

test.describe("Checkout Tpay", () => {
  test.skip("pełny flow checkout z Tpay (sandbox — semi-manual)", async ({ page }) => {
    // 1. Dodaj produkt do koszyka.
    await page.goto("/sklep");
    await page.locator('[data-testid="product-card"]').first().click();
    await page.locator('[data-testid="add-to-cart"]').click();

    // 2. Przejdź do checkout.
    await page.locator('[href="/koszyk/checkout"]').click();

    // 3. Wypełnij formularz.
    await page.fill('[name="firstName"]', "Jan");
    await page.fill('[name="lastName"]', "Testowy");
    await page.fill('[name="email"]', "test@retrohouse.pl");
    await page.fill('[name="phone"]', "+48 123 456 789");
    await page.fill('[name="address"]', "ul. Testowa 1");
    await page.fill('[name="postal"]', "00-000");
    await page.fill('[name="city"]', "Warszawa");

    // 4. Wybierz płatność Tpay (jeśli PaymentSelector jest zintegrowany).
    // TODO: Zintegruj PaymentSelector z checkout-form.tsx.
    // await page.locator('[data-payment-provider="pp_tpay_tpay"]').click();

    // 5. Submit checkout.
    await page.locator('[type="submit"]').click();

    // 6. Sprawdź redirect do Tpay sandbox.
    await expect(page).toHaveURL(/secure\.sandbox\.tpay\.com/);

    // 7. (Manualne: zapłać testowym BLIK 777123).
    // await page.fill('[name="blik_code"]', '777123');
    // await page.locator('[data-testid="pay-button"]').click();

    // 8. Sprawdź stronę powrotu.
    // await expect(page).toHaveURL(/\/checkout\/tpay\/return/);
  });

  test("strona powrotu Tpay renderuje się poprawnie", async ({ page }) => {
    await page.goto("/checkout/tpay/return?cart_id=cart_test_123");
    await expect(page.locator("text=Potwierdzamy płatność")).toBeVisible();
  });

  test("strona błędu Tpay renderuje się poprawnie", async ({ page }) => {
    await page.goto("/checkout/tpay/error");
    await expect(page.locator("text=Płatność nie powiodła się")).toBeVisible();
  });
});

test.describe("Checkout przelew tradycyjny", () => {
  test.skip("pełny flow checkout z przelewem tradycyjnym (pp_system_default)", async ({ page }) => {
    // 1. Dodaj produkt do koszyka.
    await page.goto("/sklep");
    await page.locator('[data-testid="product-card"]').first().click();
    await page.locator('[data-testid="add-to-cart"]').click();

    // 2. Przejdź do checkout.
    await page.locator('[href="/koszyk/checkout"]').click();

    // 3. Wypełnij formularz.
    await page.fill('[name="firstName"]', "Jan");
    await page.fill('[name="lastName"]', "B2B");
    await page.fill('[name="email"]', "b2b@retrohouse.pl");
    await page.fill('[name="phone"]', "+48 123 456 789");
    await page.fill('[name="address"]', "ul. Firmowa 10");
    await page.fill('[name="postal"]', "00-000");
    await page.fill('[name="city"]', "Warszawa");

    // 4. Wybierz przelew tradycyjny.
    // await page.locator('[data-payment-provider="pp_system_default"]').click();

    // 5. Submit checkout.
    await page.locator('[type="submit"]').click();

    // 6. Sprawdź zamówienie (przelew tradycyjny = zamówienie od razu, status `awaiting`).
    await expect(page).toHaveURL(/\/dziekujemy/);
  });
});
