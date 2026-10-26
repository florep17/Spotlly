# language: pl
Właściwość: Wyświetlenie poufnych instrukcji wjazdu (US-05)
  Jako kierowca z potwierdzoną rezerwacją
  Chcę zobaczyć instrukcję wjazdu przed rozpoczęciem postoju
  Aby bez problemu dostać się na posesję lub do garażu podziemnego

  Założenia:
    Mając potwierdzoną rezerwację na "Garaż na Kazimierzu" rozpoczynającą się o godzinie "10:00"
    Oraz zdefiniowany poufny kod do bramy "4821#" i numer miejsca "14"

  Scenariusz: Uprawniony dostęp do instrukcji na 15 minut przed rozpoczęciem
    Gdy kierowca otwiera podgląd rezerwacji o godzinie "09:50" (10 minut przed startem)
    Wtedy system wyświetla dokładną instrukcję dojazdu
    Oraz kod do bramy "4821#" i numer miejsca "14"

  Scenariusz: Blokada wglądu do instrukcji na długo przed rezerwacją
    Gdy kierowca otwiera podgląd rezerwacji o godzinie "08:30" (90 minut przed startem)
    Wtedy kod do bramy i szczegóły wjazdu są zamaskowane
    I widnieje komunikat "Instrukcja wjazdu zostanie odblokowana 15 minut przed startem"
