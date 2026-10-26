# language: pl
Właściwość: Sortowanie i filtrowanie ofert parkingowych (US-03)
  Jako kierowca
  Chcę sortować dostępne oferty po cenie i odległości
  Aby wybrać najlepsze i najkorzystniejsze miejsce parkingowe

  Założenia:
    Mając co najmniej 3 wolne oferty w okolicy celu:
      | nazwa             | cena_za_godz | odleglosc_metry |
      | Parking Józefa    | 3.00         | 450             |
      | Garaż Dajwór      | 5.00         | 180             |
      | Podjazd Miodowa   | 8.00         | 120             |

  Scenariusz: Sortowanie ofert według rosnącej ceny
    Gdy kierowca sortuje oferty według kryterium "Najniższa cena"
    Wtedy oferty są prezentowane w kolejności:
      | Parking Józefa    |
      | Garaż Dajwór      |
      | Podjazd Miodowa   |

  Scenariusz: Sortowanie ofert według najmniejszej odległości
    Gdy kierowca sortuje oferty według kryterium "Najbliżej celu"
    Wtedy oferty są prezentowane w kolejności:
      | Podjazd Miodowa   |
      | Garaż Dajwór      |
      | Parking Józefa    |
