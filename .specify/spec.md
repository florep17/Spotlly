# Spotly – Specyfikacja Wymagań Użytkownika (.specify/spec.md)

Dokument zawiera zbiór 5 kluczowych historii użytkownika (User Stories) w standardzie **INVEST** wraz z kryteriami akceptacji w notacji **BDD (Given-When-Then)** dla platformy **Spotly** (P2P Parking Sharing).

---

## INVEST Checklist
- **I (Independent):** Każda historia może być implementowana i testowana niezależnie.
- **N (Negotiable):** Szczegóły interfejsu i stawek podlegają doprecyzowaniu bez zmiany esencji potrzeby.
- **V (Valuable):** Każda historia dostarcza bezpośrednią wartość kierowcy lub właścicielowi miejsca.
- **E (Estimable):** Zakres każdej historii jest precyzyjnie określony i możliwy do wyceny w Story Points.
- **S (Small):** Historie są zaplanowane na pojedyncze iteracje (sprinty) prototypu ewolucyjnego.
- **T (Testable):** Każda historia posiada jednoznaczne, automatyzowalne kryteria akceptacji BDD.

---

## US-01: Ustalanie dostępności i stawki miejsca parkingowego
- **Aktor:** Właściciel miejsca parkingowego
- **Potrzeba:** Chcę ustalać terminy i stawkę godzinową mojego miejsca, aby udostępniać je kierowcom podczas mojej nieobecności (praca, wyjazd, wieczór).
- **Wartość biznesowa:** Monetyzacja nieużywanej przestrzeni i pełna kontrola nad dostępnością parkingu.

### Scenariusz pozytywny:
```gherkin
GIVEN Właściciel posiada zarejestrowane i zweryfikowane miejsce w systemie
WHEN Wprowadza przedział czasowy od "2026-10-28 08:00" do "2026-10-28 16:00" oraz stawkę 6.00 PLN/godz.
THEN Oferta staje się aktywna i widoczna w wynikach wyszukiwania dla tego przedziału czasowego
```

### Scenariusz brzegowy (walidacja stawki):
```gherkin
GIVEN Właściciel wprowadza przedział czasowy
WHEN Podaje stawkę godzinową <= 0 PLN
THEN System odrzuca formularz z komunikatem błędu "Stawka musi być większa niż zero"
```

---

## US-02: Wyszukiwanie wolnego miejsca według lokalizacji i czasu
- **Aktor:** Kierowca / Gość
- **Potrzeba:** Chcę wyszukiwać parking na mapie na podstawie lokalizacji docelowej oraz planowanych godzin postoju, aby mieć pewność wolnego miejsca.
- **Wartość biznesowa:** Oszczędność czasu i redukcja stresu związanego z krążeniem po osiedlu.

### Scenariusz pozytywny:
```gherkin
GIVEN Istnieją aktywne oferty na krakowskim Kazimierzu w przedziale "10:00–13:00"
WHEN Kierowca wybiera lokalizację "Kazimierz, Kraków" oraz godziny "10:00–13:00"
THEN Na mapie i liście wyświetlane są wyłącznie oferty w pełni wolne w zadanym oknie czasowym
```

### Scenariusz negatywny (brak dostępności):
```gherkin
GIVEN Brak ofert spełniających kryteria czasowe w wybranym promieniu
WHEN Kierowca zatwierdza wyszukiwanie
THEN System prezentuje komunikat o braku wolnych miejsc i sugeruje alternatywne godziny lub większy promień
```

---

## US-03: Sortowanie i filtrowanie ofert (Cena / Odległość)
- **Aktor:** Kierowca
- **Potrzeba:** Chcę sortować dostępne oferty według ceny oraz odległości od celu, aby wybrać ofertę optymalną ekonomicznie i logistycznie.
- **Wartość biznesowa:** Przejrzystość oferty i wsparcie decyzji zakupowej kierowcy.

### Scenariusz pozytywny (sortowanie po cenie):
```gherkin
GIVEN W promieniu wyszukiwania dostępne są co najmniej 2 oferty (np. 8 zł/h oraz 5 zł/h)
WHEN Kierowca wybiera sortowanie "Cena: od najniższej"
THEN Wyniki zostają uporządkowane rosnąco według stawki godzinowej (5 zł/h przed 8 zł/h)
```

---

## US-04: Rezerwacja miejsca i symulacja płatności
- **Aktor:** Kierowca
- **Potrzeba:** Chcę zarezerwować wybrane miejsce i opłacić je w środowisku testowym, aby zagwarantować sobie wyłączność na postój w wybranym oknie.
- **Wartość biznesowa:** Gwarancja rezerwacji bez ryzyka podwójnego zabukowania (double-booking).

### Scenariusz pozytywny:
```gherkin
GIVEN Miejsce parkingowe jest w pełni dostępne w terminie "12 paź 10:00–13:00"
WHEN Kierowca zatwierdza rezerwację i realizuje testową płatność
THEN Rezerwacja uzyskuje status CONFIRMED
AND Przedział czasowy zostaje natychmiast zablokowany dla innych kierowców
```

### Scenariusz negatywny (blokada kolizji terminów):
```gherkin
GIVEN Miejsce posiada potwierdzoną rezerwację w przedziale "10:00–13:00"
WHEN Inny kierowca próbuje utworzyć rezerwację w przedziale "11:00–14:00" dla tego samego miejsca
THEN System odrzuca żądanie z błędem konfliktu terminów (HTTP 409 Conflict)
AND W bazie danych nie powstaje kolidujący rekord
```

---

## US-05: Wyświetlenie poufnych instrukcji wjazdu
- **Aktor:** Kierowca z potwierdzoną rezerwacją
- **Potrzeba:** Chcę otrzymać szczegółowe instrukcje dojazdu, kod do bramy oraz numer miejsca tuż przed rozpoczęciem postoju, aby sprawnie wjechać na parking.
- **Wartość biznesowa:** Bezpieczeństwo posesji właściciela (dane dostępowe nie są publiczne) przy jednoczesnym komforcie kierowcy.

### Scenariusz pozytywny (uprawniony dostęp czasowy):
```gherkin
GIVEN Kierowca posiada opłaconą rezerwację rozpoczynającą się o "10:00"
WHEN Otwiera szczegóły rezerwacji w czasie <= 15 minut przed jej rozpoczęciem (np. o 09:50)
THEN System odsłania kod do bramy/szlabanu oraz dokładny numer stanowiska
```

### Scenariusz negatywny (próba przedwczesnego wglądu):
```gherkin
GIVEN Rezerwacja rozpoczyna się za 2 dni
WHEN Kierowca wyświetla rezerwację
THEN Instrukcje wjazdu pozostają ukryte z informacją "Instrukcje zostaną udostępnione na 15 minut przed rozpoczęciem rezerwacji"
```
