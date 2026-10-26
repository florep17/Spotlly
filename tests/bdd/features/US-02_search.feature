# language: pl
Właściwość: Wyszukiwanie parkingu według lokalizacji i czasu (US-02)
  Jako kierowca
  Chcę wyszukać miejsce na mapie według lokalizacji i planowanego czasu
  Aby znaleźć bezpieczny parking blisko celu mojej wizyty

  Założenia:
    Mając aktywne oferty miejsc parkingowych w dzielnicy "Kazimierz, Kraków":
      | nazwa                | cena_za_godz | dostepnosc_od    | dostepnosc_do    |
      | Garaż Dajwór 12      | 5.00         | 2026-10-28 08:00 | 2026-10-28 16:00 |
      | Podjazd Miodowa 8    | 8.00         | 2026-10-28 10:00 | 2026-10-28 14:00 |
      | Miejsce Józefa 4     | 4.00         | 2026-10-28 14:00 | 2026-10-28 18:00 |

  Scenariusz: Wyszukiwanie miejsc w wybranym oknie czasowym
    Gdy kierowca wybiera lokalizację "Kazimierz, Kraków"
    Oraz przedział czasowy "2026-10-28 10:00" do "2026-10-28 13:00"
    Wtedy na mapie widoczne są oferty:
      | nazwa             |
      | Garaż Dajwór 12   |
      | Podjazd Miodowa 8 |
    Oraz oferta "Miejsce Józefa 4" nie jest prezentowana w wynikach
