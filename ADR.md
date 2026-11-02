# Architecture Decision Records (ADR) — Spotly

Dokument podsumowuje kluczowe decyzje architektoniczne i technologiczne podjęte podczas projektowania platformy **Spotly** (wariant A: stanowy silnik *in-memory*).

---

## Spis treści
- [ADR-001: Architektura mikroserwisowa z wydzielonym silnikiem C++20 (Crow)](#adr-001-architektura-mikroserwisowa-z-wydzielonym-silnikiem-c20-crow)
- [ADR-002: Wybór stosu mobilnego – React Native (Expo) z TypeScript](#adr-002-wybór-stosu-mobilnego--react-native-expo-z-typescript)
- [ADR-003: Wybór bazy danych i zarządzanie migracjami – PostgreSQL + Flyway](#adr-003-wybór-bazy-danych-i-zarządzanie-migracjami--postgresql--flyway)
- [ADR-004: Uwierzytelnianie i autoryzacja – OAuth2 (Google/Apple) i JWT](#adr-004-uwierzytelnianie-i-autoryzacja--oauth2-googleapple-i-jwt)
- [ADR-005: Ochrona danych wrażliwych – Czasowy dostęp do kodów wjazdu (Time-Gated Access)](#adr-005-ochrona-danych-wrażliwych--czasowy-dostęp-do-kodów-wjazdu-time-gated-access)

---

## ADR-001: Architektura mikroserwisowa z wydzielonym silnikiem C++20 (Crow)

### Status
`Zaakceptowana`

### Kontekst
Wyszukiwanie i rezerwacja wolnych miejsc parkingowych w czasie rzeczywistym wymaga jednoczesnego:
1. Filtrowania przestrzennego (geolokalizacja w promieniu $N$ metrów).
2. Sprawdzania kolizji w przedziałach czasowych (kalendarz dostępności vs aktywne rezerwacje).
3. Wyliczania wieloczynnikowego rankingu trafności (*match score*) w czasie poniżej milisekundy.

Wykonywanie tych operacji bezpośrednio na relacyjnej bazie danych pod dużym ruchem prowadziłoby do narzutu I/O i blokad transakcyjnych.

### Decyzja
Podział systemu na dwa współpracujące moduły backendowe w architekturze monorepo:
* **Spring Boot 3 (Java 21):** Pełni rolę orkiestratora biznesowego, bramki bezpieczeństwa (OAuth2, weryfikacja JWT), obsługi płatności oraz trwałego zapisu stanu w PostgreSQL.
* **C++20 Crow Engine (`searchEngine/`):** Dedykowany, stanowy mikrousługowy silnik obliczeniowy pracujący w pamięci RAM. Wykorzystuje:
  * Indeks przestrzenny 2D R-Tree (`Boost.Geometry`).
  * Rejestr przedziałów rezerwacji zabezpieczony czytelnikami/pisarzami (`std::shared_mutex`).
  * Dostęp przez prywatną sieć Docker po HTTP REST (`/api/v1/engine/*`).

### Konsekwencje
* **Zalety:**
  * Sub-milisekundowe wyszukiwanie i sortowanie kandydatów bez obciążania głównej bazy danych.
  * Pełne odseparowanie logiki matematyczno-geograficznej od logiki biznesowej.
* **Wady / Wyzwania:**
  * Wymóg ciągłej synchronizacji stanu (`/api/v1/engine/spots/sync` oraz `/api/v1/engine/bookings/sync`).
  * Konieczność odbudowy stanu RAM silnika C++ przy ewentualnym restarcie kontenera.

---

## ADR-002: Wybór stosu mobilnego – React Native (Expo) z TypeScript

### Status
`Zaakceptowana`

### Kontekst
System ma docierać do dwóch grup użytkowników (kierowcy oraz właściciele miejsc parkingowych) korzystających z systemów Android oraz iOS. Kluczowymi wymaganiami UI/UX są:
* Wydajna, natywna obsługa map (`MapView`).
* Spójne doświadczenie użytkownika na obu platformach przy ograniczonych zasobach zespołu.

### Decyzja
Zastosowanie **React Native** w oparciu o framework **Expo** oraz język **TypeScript**. Komunikacja z API backendu realizowana jest poprzez klienta **Axios**.

### Konsekwencje
* **Zalety:**
  * Jedna wspólna baza kodu (`client/`) kompilowana na platformy iOS i Android.
  * Statyczne typowanie modeli danych (DTO) wymienianych ze Spring Bootem.
  * Szybki cykl prototypowania i łatwe wdrażanie aplikacji testowych dzięki Expo.
* **Wady / Wyzwania:**
  * Narzut mostu natywnego (choć minimalizowany przez nową architekturę RN).
  * Potrzeba dbałości o wydajność renderowania dużej liczby punktów na mapie.

---

## ADR-003: Wybór bazy danych i zarządzanie migracjami – PostgreSQL + Flyway

### Status
`Zaakceptowana`

### Kontekst
Dane aplikacji (profile użytkowników, fizyczne parametry miejsc, relacje własności, transakcje finansowe i historia rezerwacji) wymagają ścisłych gwarancji integralności referencyjnej oraz transakcyjności (ACID), zwłaszcza przy unikaniu zjawiska *double-booking*.

### Decyzja
* Wybór relacyjnej bazy **PostgreSQL** jako nadrzędnego źródła prawdy (*Single Source of Truth*).
* Wdrożenie narzędzia **Flyway** w module Spring Boot (`db/migration/`) do wersjonowania schematu bazy danych w kodzie źródłowym.
* Zastosowanie wzorca **Hydracji Danych**: Silnik C++ zwraca jedynie posortowane identyfikatory (`spot_id`), po czym Spring Boot uzupełnia pełne dane (zdjęcia, dane właściciela, opis) z bazy PostgreSQL zapytaniem `IN (...)`.

### Konsekwencje
* **Zalety:**
  * Pełna powtarzalność środowisk testowych i produkcyjnych dzięki migracjom SQL.
  * Bezpieczeństwo transakcyjne i łatwe modelowanie relacji (np. harmonogramy tygodniowe `spot_availabilities`).
* **Wady / Wyzwania:**
  * Konieczność utrzymywania spójności schematu bazodanowego z modelami mapowanymi w C++.

---

## ADR-004: Uwierzytelnianie i autoryzacja – OAuth2 (Google/Apple) i JWT

### Status
`Zaakceptowana`

### Kontekst
Aplikacja mobilna wymaga prostego procesu onboardingu kierowcy, bez konieczności wypełniania długich formularzy rejestracyjnych. Jednocześnie backend REST API musi działać bezstanowo, by łatwo skalować ruch.

### Decyzja
* Integracja logowania społecznościowego (Federated Identity) za pośrednictwem **Google** oraz **Apple** (`POST /api/v1/auth/oauth/{provider}`).
* Walidacja tokena tożsamości (`id_token`) dostawcy przez Spring Security.
* Wymiana tokena zewnętrznego na własny, podpisany token **JWT (Bearer Token)** o określonym czasie ważności, przesyłany w nagłówku `Authorization`.

### Konsekwencje
* **Zalety:**
  * Brak konieczności przechowywania haseł i zarządzania ich soleniem/haszowaniem w bazie.
  * Bezstanowa weryfikacja uprawnień kierowcy i hosta przy każdym żądaniu do API.
* **Wady / Wyzwania:**
  * Zależność od zewnętrznych dostawców tożsamości (Google/Apple).
  * Konieczność obsługi mechanizmów odświeżania lub ponownego logowania po wygaśnięciu tokena JWT.

---

## ADR-005: Ochrona danych wrażliwych – Czasowy dostęp do kodów wjazdu (Time-Gated Access)

### Status
`Zaakceptowana`

### Kontekst
Właściciele miejsc parkingowych udostępniają poufne dane dostępowe (kody PIN do bram, numery telefonów do szlabanów automatycznych, kody do klatek schodowych). Upublicznienie tych danych w wynikach wyszukiwania stanowiłoby poważne naruszenie bezpieczeństwa posesji.

### Decyzja
* Wycięcie (*stripping*) kodów PIN i wrażliwych instrukcji ze wszystkich publicznych punktów końcowych wyszukiwania i podglądu miejsca (`POST /api/v1/search`, `GET /api/v1/spots/{id}`).
* Udostępnienie wrażliwych danych wyłącznie przez dedykowany endpoint:  
  `GET /api/v1/bookings/{id}/access`
* Wdrożenie reguły **Time-Gated Credential Protection**: endpoint zwraca kody wyłącznie uwierzytelnionemu kierowcy i tylko w oknie czasowym rozpoczynającym się **najwcześniej 15 minut przed godziną rozpoczęcia rezerwacji** (`start_time_utc`). Każda wcześniejsza próba lub zapytanie od osoby trzeciej zwraca `HTTP 403 Forbidden`.

### Konsekwencje
* **Zalety:**
  * Ochrona fizycznego bezpieczeństwa prywatnych posesji i garaży podziemnych.
  * Dostęp do bramy powiązany ściśle z opłaconym i aktywnym oknem rezerwacyjnym.
* **Wady / Wyzwania:**
  * Wymóg precyzyjnej synchronizacji zegarów serwera i klienta (oparcie logiki o UTC epoch).