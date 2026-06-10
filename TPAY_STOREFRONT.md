# Integracja Tpay — RetroHouse Storefront

## 📋 Implementowane komponenty

### Storefront
1. **PaymentSelector Component** (`src/components/checkout/PaymentSelector.tsx`)
   - UI wyboru providera płatności (Tpay + przelew tradycyjny)
   - Fallback gdy Tpay unavailable

2. **Return Pages** (`src/app/checkout/tpay/`)
   - `/checkout/tpay/return` — strona powrotu po płatności
   - `/checkout/tpay/error` — strona błędu płatności

3. **Checkout Helpers** (`src/lib/medusa/checkout-helpers.ts`)
   - Provider IDs (Tpay, system default)
   - Poll delays dla retry logic
   - Error classification

4. **E2e Tests** (`tests/e2e/checkout-tpay.spec.ts`)
   - Playwright testy (semi-manual: wymaga sandbox Tpay)

## 🚀 Setup

### 1. Zainstaluj dependencies
```bash
cd sklep-retrohouse.pl-1
pnpm install
```

### 2. Uruchom storefront
```bash
pnpm dev
```

### 3. Sprawdź stronę powrotu
```
http://localhost:3000/checkout/tpay/return?cart_id=test_123
```

## 🔗 Integracja z checkout

### Obecny stan
RetroHouse używa **uproszczonego checkout flow** bez Medusa SDK na froncie:
- `src/app/api/checkout/route.ts` — server-side checkout handler
- `src/app/koszyk/checkout/checkout-form.tsx` — UI formularza
- `src/lib/checkout/create-order.ts` — Medusa API wrapper

### Plan integracji PaymentSelector

#### Opcja A: Integracja bezpośrednia (prosta)
1. Dodaj `PaymentSelector` do `checkout-form.tsx`:
```tsx
import { PaymentSelector } from "@/components/checkout/PaymentSelector";

// W komponencie:
const [paymentProvider, setPaymentProvider] = useState(TPAY_PROVIDER_ID);

// W renderze (zamiast hardcoded PAYMENT_OPTIONS):
<PaymentSelector
  selectedProviderId={paymentProvider}
  onSelect={setPaymentProvider}
/>
```

2. Przekaż `paymentProvider` do API:
```tsx
// W handleSubmit:
const response = await fetch("/api/checkout", {
  method: "POST",
  body: JSON.stringify({ ...formData, payment_provider: paymentProvider }),
});
```

3. Zaktualizuj `src/lib/checkout/create-order.ts`:
```typescript
// Zamiast hardcoded MANUAL_PAYMENT_PROVIDER:
const providerId = input.payment_provider ?? "pp_system_default";

await storeFetch(`/store/payment-collections/${paymentCollectionId}/payment-sessions`, {
  method: "POST",
  body: JSON.stringify({ provider_id: providerId }),
});
```

4. Obsłuż redirect do Tpay:
```typescript
// W create-order.ts, po successful payment session:
if (providerId === TPAY_PROVIDER_ID) {
  const session = await storeFetch<{ payment_url: string }>(
    `/store/payment-sessions/${sessionId}`
  );
  return {
    ok: true,
    redirect_url: session.payment_url, // Tpay transactionPaymentUrl
  };
}
```

#### Opcja B: Pełna integracja (wzór lumineconcept)
1. Przepisz checkout flow na Medusa SDK (`@medusajs/js-sdk`).
2. Użyj `completeCart()` z retry logic.
3. Dodaj `CartProvider` z optimistic updates.

**Rekomendacja**: **Opcja A** (prosta integracja) — RetroHouse ma unikaty (qty=1), nie potrzebuje pełnego Medusa SDK na froncie.

## 🧪 Testowanie

### Manual test (sandbox)
1. Uruchom backend i storefront.
2. Dodaj produkt do koszyka.
3. Przejdź do `/koszyk/checkout`.
4. Wybierz Tpay.
5. Submit → powinien być redirect na sandbox Tpay.
6. Zapłać testowym BLIK `777123`.
7. Wróć na stronę → `/checkout/tpay/return`.
8. Sprawdź email confirmation.

### E2e test (Playwright)
```bash
pnpm test:e2e
```

**UWAGA**: Testy są oznaczone `.skip` — wymagają pełnej integracji PaymentSelector z checkout-form.tsx.

## 📊 Flow użytkownika

```
1. Klient: Dodaj do koszyka
   ↓
2. Klient: /koszyk/checkout
   ↓
3. Klient: Wypełnia formularz (adres, telefon, email)
   ↓
4. Klient: Wybiera PaymentSelector → Tpay
   ↓
5. Klient: Submit checkout
   ↓
6. Storefront: POST /api/checkout (server-side)
   ↓
7. Backend: POST /transactions (Tpay)
   ← transactionPaymentUrl
   ↓
8. Storefront: Redirect → transactionPaymentUrl (hosted Tpay page)
   ↓
9. Klient: Płaci BLIK/kartą/przelewem
   ↓
10. Tpay: Redirect → /checkout/tpay/return?cart_id=...
    ↓
11. Storefront: Komunikat "Płatność przetwarzana, email confirmation"
    (webhook Tpay domyka koszyk w backendzie asynchronicznie)
```

## ⚠️ TODO przed produkcją

### 1. Integracja PaymentSelector
- [ ] Dodaj `PaymentSelector` do `checkout-form.tsx`.
- [ ] Przekaż `payment_provider` do API.
- [ ] Obsłuż redirect do Tpay w `create-order.ts`.
- [ ] Test end-to-end na sandbox.

### 2. Error Handling
- [ ] Obsłuż timeout płatności (redirect → `/checkout/tpay/error`).
- [ ] Obsłuż cancel płatności (Tpay errorUrl).
- [ ] Komunikat user-friendly przy błędach.

### 3. UX Improvements
- [ ] Loading state podczas redirect do Tpay.
- [ ] Komunikat "Zamówienie utworzy się automatycznie" na `/checkout/tpay/return`.
- [ ] Link do FAQ płatności.

### 4. Analytics
- [ ] Track event: `payment_method_selected` (Tpay vs przelew tradycyjny).
- [ ] Track event: `payment_initiated` (redirect do Tpay).
- [ ] Track event: `payment_completed` (webhook success).

## 🆘 Troubleshooting

### Problem: PaymentSelector nie pojawia się
**Rozwiązanie**:
1. Sprawdź import: `import { PaymentSelector } from "@/components/checkout/PaymentSelector"`.
2. Sprawdź czy komponent jest wyrenderowany w `checkout-form.tsx`.

### Problem: Redirect nie działa
**Rozwiązanie**:
1. Sprawdź czy backend zwraca `redirect_url` w odpowiedzi.
2. Sprawdź czy `transactionPaymentUrl` jest poprawny (sandbox: `secure.sandbox.tpay.com`).
3. Sprawdź logi backendu — czy transakcja została utworzona?

### Problem: "/checkout/tpay/return" nie renderuje się
**Rozwiązanie**:
1. Sprawdź routing: `src/app/checkout/tpay/return/page.tsx` musi istnieć.
2. Sprawdź czy Next.js zaindexował route (restart dev server).
3. Sprawdź czy `cart_id` jest przekazany w query: `?cart_id=...`.

### Problem: Zamówienie nie powstaje po płatności
**Rozwiązanie**:
1. To normalne — webhook Tpay domyka koszyk asynchronicznie (może trwać kilka sekund).
2. Sprawdź email confirmation (jeśli webhook dotarł).
3. Sprawdź backend reconciliation job (łapie zgubione webhooki po 10 min).

## 📚 Dokumentacja
- Backend setup: `sklep-retrohouse-pl-medusa/TPAY_INTEGRATION.md`
- Tpay docs: https://docs-api.tpay.com/
- Next.js App Router: https://nextjs.org/docs/app
