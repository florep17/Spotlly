# Architecture Decision Records (ADR) — Spotly

Niniejszy dokument zawiera rejestr kluczowych decyzji architektonicznych podjętych podczas projektowania platformy Spotly, sporządzony zgodnie ze standardem Architecture Decision Records (ADR).

---

## ADR-001: Trójwarstwowa architektura hybrydowa z silnikiem obliczeniowym C++ w pamięci RAM

* **Status:** Zaakceptowana
* **Data:** Październik 2026
* **Decydenci:** Florian Kurpiela, Maximilien Klima, Zuzanna Kot

### Kontekst
Spotly wymaga jednoczesnego zapewnienia:
1. Transakcyjnej spójności rezerwacji miejsc parkingowych (ochrona przed podwójną rezerwacją — double-booking).
2. Bardzo szybkiego, geoprzestrzennego dopasowywania i rankingu ofert dla kierowców poszukujących miejsc w czasie rzeczywistym ($p95 < 50\text{ ms}$).

### Decyzja
Zdecydowano o wdrożeniu architektury trójkomponentowej (Wariant A):
* **Frontend:** Aplikacja mobilna w React Native (Expo) komunikująca się wyłącznie z API w Javie.
* **Główny Backend (Orkiestrator):** Java 21 + Spring Boot 3 z bazą PostgreSQL, zarządzający logiką biznesową, bezpieczeństwem i transakcjami.
* **Silnik Rankingu:** Dedykowany mikroserwis C++20 oparty o framework Crow, przechowujący indeks przestrzenny 2D R-Tree (Boost.Geometry) oraz przedziały czasowe w pamięci RAM.

### Konsekwencje
* **Pozytywne:**
  * Wyjątkowa wydajność wyszukiwania i obliczania wag miejsc.
  * Pełne transakcyjne bezpieczeństwo dzięki bazie PostgreSQL.
  * Czysta separacja odpowiedzialności zgodna z kompetencjami zespołu.
* **Negatywne:**
  * Konieczność synchronizacji stanu pomiędzy PostgreSQL a procesem C++ przez dedykowane webhooki/REST.

---

## ADR-002: Wybór React Native (Expo SDK) i TypeScript dla aplikacji klienckiej

* **Status:** Zaakceptowana
* **Data:** Październik 2026
* **Decydenci:** Florian Kurpiela

### Kontekst
Projekt wymaga natywnej aplikacji mobilnej na systemy iOS i Android z interaktywną mapą, płynnym interfejsem użytkownika oraz ścisłą kontrolą typów w komunikacji z REST API.

### Decyzja
Zastosowano framework React Native z ekosystemem Expo oraz językiem TypeScript. Kod formatowany i weryfikowany jest za pomocą ESLint 9 (Flat Config) i Prettier.

### Konsekwencje
* **Pozytywne:**
  * Wspólna baza kodu dla iOS i Androida przy zachowaniu natywnej wydajności.
  * Bezpieczeństwo typów dzięki synchronizacji modeli TypeScript z encjami bazodanowymi i kontraktem DTO.
  * Szybki proces developerski dzięki Fast Refresh i środowisku Expo.
* **Negatywne:**
  * Zależność od silnika bundlera Metro i bibliotek zgodnych z architekturą Expo.

---

## ADR-003: Wybór Spring Boot 3 (Java 21) oraz PostgreSQL jako trwałego magazynu danych

* **Status:** Zaakceptowana
* **Data:** Październik 2026
* **Decydenci:** Maximilien Klima

### Kontekst
Konieczne jest środowisko serwerowe o wysokiej niezawodności, ze wsparciem dla izolacji transakcji, automatycznych migracji schematu oraz integracji z kontenerami Docker.

### Decyzja
Wybrano Java 21 LTS wraz ze Spring Boot 3.3.x, Spring Data JPA (Hibernate), Flyway do ewolucyjnego wersjonowania schematu SQL oraz PostgreSQL 16.

### Konsekwencje
* **Pozytywne:**
  * Pewność spójności danych ACID przy zapisie rezerwacji i blokadach slotów.
  * Powtarzalność wdrożeń bazy danych dzięki plikom migracji Flyway (`V1__init_schema.sql`).
  * Automatycznie generowana dokumentacja OpenAPI / Swagger UI.
* **Negatywne:**
  * Wyższe zużycie pamięci JVM w porównaniu do mikrousług w C++ czy Go.

---

## ADR-004: Mechanizm uwierzytelniania oparty na tokenach Spotly JWT (OAuth2 Bearer)

* **Status:** Zaakceptowana
* **Data:** Październik 2026
* **Decydenci:** Florian Kurpiela, Maximilien Klima

### Kontekst
Aplikacja musi obsługiwać logowanie użytkowników (adres email/hasło oraz w przyszłości federacyjne Google/Apple ID) w sposób bezstanowy i bezpieczny dla komunikacji mobilnej.

### Decyzja
Zastosowano bezstanowe tokeny JWT (JSON Web Tokens). Po weryfikacji tożsamości klienta przez endpoint `/api/v1/auth/*`, serwer wydaje podpisany cyfrowo token Bearer, przesyłany przez aplikację mobilną w nagłówku `Authorization: Bearer <token>` do chronionych zasobów.

### Konsekwencje
* **Pozytywne:**
  * Bezstanowość API – serwer nie musi utrzymywać sesji w pamięci.
  * Prosta integracja z aplikacją mobilną (token przechowywany w bezpiecznym magazynie klienta).
* **Negatywne:**
  * Wymóg obsługi unieważniania tokenów w razie wylogowania lub wygaśnięcia sesji.

---

## ADR-005: Ochrona wrażliwych danych dostępowych wjazdu (Time-Gated Access Disclosure)

* **Status:** Zaakceptowana
* **Data:** Październik 2026
* **Decydenci:** Florian Kurpiela, Maximilien Klima

### Kontekst
Właściciele miejsc parkingowych wprowadzają poufne kody PIN do bram, pilotów i szlabanów. Informacje te nie mogą być publicznie dostępne w wynikach wyszukiwania.

### Decyzja
* Endpointy publiczne (np. `POST /api/v1/search`) bezwzględnie maskują i usuwają pola dostępowe (`gate_pin_code`, `access_instructions`).
* Dostęp do kodu wjazdu realizowany jest przez dedykowany endpoint `GET /api/v1/bookings/{id}/access`.
* Serwer Spring Boot weryfikuje tożsamość kierowcy oraz czas: jeśli do rozpoczęcia rezerwacji zostało więcej niż 15 minut, zapytanie jest odrzucane z kodem `HTTP 403 Forbidden`.

### Konsekwencje
* **Pozytywne:**
  * Pełne bezpieczeństwo posesji i prywatności gospodarzy.
  * Realizacja wymagania biznesowego i historii US-05.
* **Negatywne:**
  * Wymóg dodatkowego zapytania sieciowego przed samym rozpoczęciem postoju.
