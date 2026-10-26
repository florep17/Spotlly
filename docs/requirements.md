# Spotly – Specyfikacja Wymagań (docs/requirements.md)

Dokument stanowi formalną specyfikację wymagań funkcjonalnych (**FR**) i niefunkcjonalnych (**NFR**) systemu Spotly, zgodną z uproszczonym modelem SysML 1.x (`«requirement»`) oraz normami jakości oprogramowania **ISO/IEC 25010** (SQuaRE) i projektowania miar **ISO/IEC 25002**.

---

## 1. Wymaganie nadrzędne
* **ID:** `REQ-00`
* **Nazwa:** System Spotly – Usługa P2P Parkingów
* **Opis:** Mobilna i serwerowa platforma cyfrowa umożliwiająca mieszkańcom osiedli i właścicielom prywatnych miejsc parkingowych bezpieczne, krótkoterminowe udostępnianie miejsc kierowcom poszukującym postoju.

---

## 2. Wymagania Funkcjonalne (Functional Requirements)

| Identyfikator | Nazwa | Opis wymagania | Odniesienie US / Use Case |
|---|---|---|---|
| **FR-01** | **Oferty i dostępność** | System musi umożliwiać właścicielowi definiowanie cyklicznych lub jednorazowych okien dostępności miejsca (data od–do, godziny od–do) oraz indywidualnej stawki godzinowej w PLN. | US-01, UC-01 |
| **FR-02** | **Wyszukiwanie i filtrowanie** | System musi umożliwiać wyszukiwanie miejsc według współrzędnych geograficznych (geolokalizacja / adres), zadanego okna czasowego oraz maksymalnej ceny i odległości. | US-02, US-03, UC-02, UC-03 |
| **FR-03** | **Rezerwacja i blokada kolizji** | System musi uniemożliwić nakładanie się rezerwacji w tym samym miejscu i czasie (transakcyjna blokada double-booking na poziomie bazy danych). | US-04, UC-04 |
| **FR-04** | **Poufna instrukcja wjazdu** | System udostępnia szczegółowe dane dostępowe (kod PIN do bramy, pilot, numer miejsca) wyłącznie uwierzytelnionemu kierowcy i nie wcześniej niż 15 minut przed rozpoczęciem opłaconej rezerwacji. | US-05, UC-05 |

---

## 3. Wymagania Niefunkcjonalne (Non-Functional Requirements)

Zgodnie z klasyfikacją ISO/IEC 25010:

| Identyfikator | Atrybut jakościowy (ISO 25010) | Opis i cel metryczny | Sposób weryfikacji |
|---|---|---|---|
| **NFR-01** | **Wydajność (Performance Efficiency)** | Czas odpowiedzi modułu dopasowania i sortowania ofert (silnik C++ Crow) dla zapytania wyszukiwania wynosi $p95 < 50\text{ ms}$ przy obciążeniu do 500 zapytań/s. | Testy obciążeniowe (k6 / wrk), libFuzzer |
| **NFR-02** | **Niezawodność (Reliability)** | Cel dostępności operacyjnej środowiska backendowego wynosi $\ge 99{,}5\%$ w skali miesiąca. | Monitoring Actuator, Docker healthchecki |
| **NFR-03** | **Bezpieczeństwo (Security & Integrity)** | Zerowa tolerancja dla kolizji rezerwacji ($0$ konfliktów w testach współbieżnych). Izolacja transakcji w PostgreSQL oraz walidacja tokenów JWT (OAuth2). | Testy integracyjne Spring Boot, testy współbieżności |
| **NFR-04** | **Utrzymywalność (Maintainability)** | Średni czas powrotu do sprawności (Mean Time to Repair - MTTR) $< 30\text{ min}$. Konteneryzacja (Docker Compose), modularność kodu, 100% testów BDD/Unit w pipeline. | Automatyzacja CI/CD, dokumentacja architektury |

---

## 4. Macierz śladowości (Traceability Matrix)

| Wymaganie | User Story | Przypadek użycia UML | Moduł odpowiedzialny |
|---|---|---|---|
| **FR-01** | US-01 | UC-01 | `client` (UI) + `api` (Spring Boot / DB) |
| **FR-02** | US-02, US-03 | UC-02, UC-03 | `client` + `api` + `searchEngine` (C++) |
| **FR-03** | US-04 | UC-04 | `api` (Spring Boot Transaction / DB) |
| **FR-04** | US-05 | UC-05 | `client` + `api` (Security Rule) |
| **NFR-01** | US-02, US-03 | UC-02, UC-03 | `searchEngine` (C++ Crow) |
| **NFR-02** | Wszystkie | System | `api`, `searchEngine`, Docker |
| **NFR-03** | US-04 | UC-04 | `api` (Spring Security, PostgreSQL) |
| **NFR-04** | Wszystkie | Architektura | Struktura repozytorium, Lintery, Formattery |
