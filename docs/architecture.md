# Spotly – Architektura Systemu (Model 4+1)

Niniejszy dokument opisuje architekturę systemu **Spotly** (mobilna platforma P2P współdzielenia miejsc parkingowych) zgodnie ze standardem **Modelu 4+1 Kruchtena** (Architectural View Model).

---

## 1. Widok Scenariuszy / Przypadków Użycia (Use Case View)

Widok ten łączy pozostałe perspektywy i bazuje na opracowanych wymaganiach funkcjonalnych oraz historiach użytkownika:
* **US-00:** Bezpieczne uwierzytelnienie użytkownika w aplikacji (Email / Hasło, Google Sign-In) i utworzenie sesji JWT.
* **US-01:** Definiowanie dostępności i stawki godzinowej miejsca przez właściciela.
* **US-02:** Wyszukiwanie miejsc parkingowych według lokalizacji i okna czasowego.
* **US-03:** Sortowanie i scoring ofert (cena, odległość, typ pojazdu).
* **US-04:** Rezerwacja miejsca parkingowego i transakcyjna blokada kolizji terminów.
* **US-05:** Odblokowanie poufnych instrukcji wjazdu (kod PIN do bramy) ściśle na 15 minut przed rozpoczęciem postoju.

Szczegółowa specyfikacja wymagań znajduje się w [`.specify/spec.md`](file:///Users/floriankurpiela/Desktop/STUDIA/Spotlly/.specify/spec.md) oraz [`docs/requirements.md`](file:///Users/floriankurpiela/Desktop/STUDIA/Spotlly/docs/requirements.md).

---

## 2. Widok Deweloperski / Struktury (UML Component Diagram)

Poniższy diagram komponentów przedstawia dekompozycję modularną systemu, wykorzystane technologie oraz interfejsy komunikacyjne:

```mermaid
graph TD
    subgraph ClientLayer ["Warstwa Klienta — React Native / Expo (Florian)"]
        UI_Auth["Moduł Auth (Login / Profil)"]
        UI_Search["Moduł Wyszukiwarki (Mapa / Filtry)"]
        UI_Booking["Moduł Rezerwacji (Termin / Koszyk)"]
        UI_Host["Moduł Gospodarza (Dodaj miejsce)"]
        API_Client["Klient API (Fetch / Axios REST)"]

        UI_Auth --> API_Client
        UI_Search --> API_Client
        UI_Booking --> API_Client
        UI_Host --> API_Client
    end

    subgraph BackendLayer ["Warstwa Serwerowa — Spring Boot 3 / Java 21 (Maximilien)"]
        Sec_Filter["Security Filter & JWT Validator"]
        Auth_Ctrl["AuthController"]
        Spot_Ctrl["SpotController"]
        Book_Ctrl["BookingController"]
        
        Spot_Svc["SpotService & Validator"]
        Book_Svc["BookingService & Pessimistic Lock"]
        Crow_Client["CrowEngineClient (WebClient)"]

        Sec_Filter --> Auth_Ctrl
        Sec_Filter --> Spot_Ctrl
        Sec_Filter --> Book_Ctrl

        Spot_Ctrl --> Spot_Svc
        Book_Ctrl --> Book_Svc
        Spot_Svc --> Crow_Client
        Book_Svc --> Crow_Client
    end

    subgraph EngineLayer ["Warstwa Obliczeniowa — C++20 Crow Engine (Zuzanna)"]
        Crow_Server["Crow HTTP Server (:8080)"]
        RTree_Index["Indeks Przestrzenny 2D R-Tree (Boost)"]
        Interval_Index["Indeks Przedziałów Czasowych RAM"]
        Ranking_Algo["Algorytm Wielokryterialnego Rankingu"]

        Crow_Server --> RTree_Index
        Crow_Server --> Interval_Index
        Crow_Server --> Ranking_Algo
    end

    subgraph DataLayer ["Warstwa Danych — PostgreSQL 16"]
        DB_Users[("Tabela users")]
        DB_Spots[("Tabela parking_spots")]
        DB_Avail[("Tabela spot_availabilities")]
        DB_Bookings[("Tabela bookings")]
    end

    API_Client -->|"HTTPS / JSON (Bearer JWT)"| Sec_Filter
    Crow_Client -->|"HTTP Internal (:8080)"| Crow_Server
    Spot_Svc --> DB_Spots
    Spot_Svc --> DB_Avail
    Book_Svc --> DB_Bookings
    Auth_Ctrl --> DB_Users
```

---

## 3. Widok Procesu (Process View)

### A. Diagram Sekwencji UML (Sequence Diagram) — Logowanie i rezerwacja
Poniższy diagram sekwencji obrazuje interakcję w czasie pomiędzy aplikacją mobilną, backendem, silnikiem C++ oraz bazą danych:

```mermaid
sequenceDiagram
    autonumber
    actor Driver as Kierowca (Aplikacja Mobilna)
    participant Spring as Spring Boot API (api)
    participant Postgres as Baza PostgreSQL
    participant Crow as Silnik C++ Crow (searchEngine)

    Note over Driver,Spring: Krok 1: Uwierzytelnienie użytkownika
    Driver->>Spring: POST /api/v1/auth/login (email, password)
    Spring->>Postgres: SELECT * FROM users WHERE email = ?
    Postgres-->>Spring: Rekord użytkownika
    Spring-->>Driver: 200 OK (access_token: Spotly JWT, profile)

    Note over Driver,Crow: Krok 2: Wyszukiwanie miejsc na mapie
    Driver->>Spring: POST /api/v1/search (lat, lng, window, vehicle)
    Spring->>Crow: POST /api/v1/engine/match (współrzędne + okno czasowe)
    Crow-->>Spring: 200 OK (Posortowana lista spot_id + score)
    Spring->>Postgres: SELECT * FROM parking_spots WHERE id IN (...)
    Postgres-->>Spring: Dane miejsc (z wyłączeniem kodów PIN)
    Spring-->>Driver: 200 OK (Karty miejsc z cenami i odległością)

    Note over Driver,Crow: Krok 3: Rezerwacja i blokada kolizji
    Driver->>Spring: POST /api/v1/bookings (spot_id, window, paymentMethod)
    Spring->>Postgres: SELECT * FROM bookings WHERE spot_id = ? AND overlap FOR UPDATE
    Postgres-->>Spring: 0 kolizji (blokada pesymistyczna)
    Spring->>Crow: POST /api/v1/engine/bookings/sync (action: LOCK)
    Crow-->>Spring: 200 OK (COLLISION_LOCK_APPLIED)
    Spring->>Postgres: INSERT INTO bookings (status: CONFIRMED)
    Postgres-->>Spring: Zapisano rezerwację
    Spring-->>Driver: 201 Created (booking_id, status: CONFIRMED)
```

### B. Diagram Komunikacji UML (Communication Diagram)
Diagram komunikacji kładzie nacisk na powiązania strukturalne obiektów w trakcie realizacji rezerwacji i autoryzacji:

```mermaid
graph LR
    C[":AplikacjaMobilna"] ---|"1: POST /auth/login<br/>4: POST /bookings"| S[":SecurityGateway"]
    S ---|"2: verifyCredentials()<br/>5: lockAndCreateBooking()"| B[":BookingOrchestrator"]
    B ---|"3: saveSession()<br/>6: checkDoubleBooking()"| D[":PostgreSQLDatabase"]
    B ---|"7: syncEpochInterval()"| E[":CrowRankingEngine"]
```

Numery komunikatów:
* `1:` Klient przesyła dane logowania do bramy bezpieczeństwa.
* `2:` Brama weryfikuje dane uwierzytelniające w orkiestratorze.
* `3:` Zapis i weryfikacja tożsamości użytkownika w relacyjnej bazie danych.
* `4:` Uwierzytelniony klient zleca rezerwację slotu parkingowego.
* `5:` Orkiestrator przetwarza wniosek rezerwacyjny i inicjuje blokadę transakcyjną.
* `6:` Baza danych PostgreSQL wykonuje zapytanie z blokadą wierszy, eliminując ryzyko kolizji.
* `7:` Zsynchronizowanie zajętości w pamięci RAM silnika C++ (aktualizacja `activeBookings`).

---

## 4. Diagramy Danych (Data View)

### A. Diagram Modelu Danych (ERD — Entity Relationship Diagram)
Model relacyjny wdrożony w PostgreSQL 16 za pośrednictwem migracji Flyway (`V1__init_schema.sql`):

```mermaid
erDiagram
    USER ||--o{ PARKING_SPOT : "jest właścicielem (1..N)"
    USER ||--o{ BOOKING : "rezerwuje jako kierowca (1..N)"
    PARKING_SPOT ||--o{ SPOT_AVAILABILITY : "posiada harmonogram (1..N)"
    PARKING_SPOT ||--o{ BOOKING : "posiada rezerwacje (1..N)"

    USER {
        string id PK "UUID / Provider ID"
        string email "Unikalny adres email"
        string first_name "Imię użytkownika"
        string role "USER / ADMIN"
        string oauth_provider "GOOGLE / APPLE / LOCAL"
        timestamp created_at "Data rejestracji"
    }

    PARKING_SPOT {
        uuid id PK "Identyfikator miejsca"
        string owner_id FK "ID właściciela (users.id)"
        string title "Nazwa oferty (np. Garaż na Kazimierzu)"
        numeric latitude "Współrzędna GPS szerokości"
        numeric longitude "Współrzędna GPS długości"
        string address_street "Ulica i numer"
        string address_city "Miasto"
        string spot_type "GARAGE / DRIVEWAY / OUTDOOR"
        numeric hourly_rate "Stawka w PLN/godz."
        string gate_pin_code "Poufny kod PIN do bramy"
        text access_instructions "Poufne instrukcje wjazdu"
        boolean is_active "Czy oferta jest aktywna"
    }

    SPOT_AVAILABILITY {
        uuid id PK "Identyfikator reguły"
        uuid spot_id FK "ID miejsca (parking_spots.id)"
        int day_of_week "Dzień tygodnia (1-7)"
        time start_time "Godzina rozpoczęcia"
        time end_time "Godzina zakończenia"
    }

    BOOKING {
        string id PK "Identyfikator rezerwacji"
        uuid spot_id FK "ID miejsca (parking_spots.id)"
        string driver_id FK "ID kierowcy (users.id)"
        bigint start_time_utc "Początek postoju (Unix Epoch)"
        bigint end_time_utc "Koniec postoju (Unix Epoch)"
        string status "CONFIRMED / CANCELLED / COMPLETED"
        numeric total_charged "Całkowity koszt rezerwacji"
        string access_status "LOCKED_UNTIL_15M_BEFORE / UNLOCKED"
    }
```

### B. Diagram Przepływu Danych (DFD — Data Flow Diagram, Poziom 1)
Diagram DFD przedstawia przepływ danych pomiędzy podmiotami zewnętrznymi, procesami a magazynami danych:

```mermaid
flowchart TD
    Driver["Kierowca (Zewnętrzny Aktor)"]
    Owner["Właściciel Miejsca (Zewnętrzny Aktor)"]

    P1["1.0 Autoryzacja i Zarządzanie Tożsamością"]
    P2["2.0 Zarządzanie Miejscami i Dostępnością"]
    P3["3.0 Wyszukiwanie Geoprzestrzenne i Ranking"]
    P4["4.0 Obsługa Rezerwacji i Blokada Kolizji"]

    D1[("D1 Baza Danych PostgreSQL")]
    D2[("D2 Indeksy RAM Silnika C++")]

    Driver -->|"Dane logowania / Rejestracja"| P1
    Owner -->|"Dane logowania / Rejestracja"| P1
    P1 -->|"Zapis tożsamości / Weryfikacja"| D1
    P1 -->|"Wydanie tokenu JWT"| Driver
    P1 -->|"Wydanie tokenu JWT"| Owner

    Owner -->|"Formularz miejsca + stawka + harmonogram"| P2
    P2 -->|"Zapis encji miejsca i godzin"| D1
    P2 -->|"Synchronizacja współrzędnych i slotów"| D2

    Driver -->|"Współrzędne GPS + przedział godzinowy"| P3
    P3 -->|"Zapytanie przestrzenno-czasowe R-Tree"| D2
    D2 -->|"Lista posortowanych ID miejsc ze scoringiem"| P3
    P3 -->|"Odczyt kart obiektów bez PIN-ów"| D1
    P3 -->|"Lista dostępnych ofert w pobliżu"| Driver

    Driver -->|"Zlecenie rezerwacji + symulacja płatności"| P4
    P4 -->|"Weryfikacja braku kolizji terminów"| D1
    P4 -->|"Zablokowanie slotu czasowego w RAM"| D2
    P4 -->|"Potwierdzenie rezerwacji (201 Created)"| Driver
```

---

## 5. Widok Fizyczny / Wdrożeniowy (Deployment View)

System wdrażany jest w postaci kontenerów Docker za pośrednictwem pliku `docker-compose.yml`:
* **Kontener `spotly-postgres`:** PostgreSQL 16 z wolumenem `spotly_postgres_data` na porcie `5432`.
* **Kontener `spotly-api`:** Spring Boot 3 (Java 21) na porcie `8081`.
* **Kontener `spotly-search-engine`:** Mikrousługa C++20 Crow na porcie `8080` w wewnętrznej sieci Dockerowej (`api_default`).
* **Środowisko Klienckie:** Aplikacja React Native (Expo) uruchamiana na urządzeniach mobilnych użytkowników (iOS/Android).
