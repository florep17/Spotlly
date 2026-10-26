# language: pl
Właściwość: Rezerwacja miejsca i symulacja płatności (US-04)
  Jako kierowca
  Chcę zarezerwować miejsce i opłacić je w środowisku testowym
  Aby mieć gwarancję i potwierdzenie bezpiecznego postoju

  Założenia:
    Mając dostępne miejsce parkingowe "Garaż na Kazimierzu" o stawce "5.00" PLN/h
    Oraz opłatę serwisową w wysokości "2.00" PLN

  Scenariusz: Pomyślna rezerwacja i opłacenie miejsca
    Mając brak innych rezerwacji dla "Garaż na Kazimierzu" w dniu "2026-10-28 10:00–13:00"
    Gdy kierowca rezerwuje miejsce na czas 3 godzin (10:00 do 13:00)
    Oraz dokonuje testowej płatności na kwotę "17.00" PLN
    Wtedy rezerwacja uzyskuje status "CONFIRMED"
    I kierowca otrzymuje potwierdzenie rezerwacji

  Scenariusz: Odrzucenie rezerwacji w przypadku kolizji terminów
    Mając istniejącą potwierdzoną rezerwację dla "Garaż na Kazimierzu" w godzinach "10:00–13:00"
    Gdy inny kierowca próbuje zarezerwować to samo miejsce w godzinach "11:00–14:00"
    Wtedy system odrzuca próbę rezerwacji
    I zwraca błąd konfliktu terminów bez tworzenia kolidującego wpisu w bazie
