# language: pl
Właściwość: Ustalanie dostępności i ceny miejsca parkingowego (US-01)
  Jako właściciel miejsca parkingowego
  Chcę ustalać terminy i stawkę godzinową mojego miejsca
  Aby udostępniać je kierowcom podczas mojej nieobecności

  Założenia:
    Mając zarejestrowanego użytkownika "Anna" w roli właściciela
    Oraz zarejestrowane miejsce parkingowe "Garaż na Kazimierzu"

  Scenariusz: Prawidłowe zdefiniowanie dostępności miejsca
    Mając przypisane miejsce "Garaż na Kazimierzu"
    Gdy właściciel podaje termin rozpoczęcia "2026-10-28 08:00" i zakończenia "2026-10-28 16:00"
    Oraz stawkę godzinową "5.00" PLN
    Wtedy oferta staje się aktywna w zadanym terminie
    I jest widoczna dla wyszukujących kierowców

  Scenariusz: Próba ustalenia niepoprawnej stawki godzinowej
    Mając przypisane miejsce "Garaż na Kazimierzu"
    Gdy właściciel podaje stawkę godzinową "0.00" PLN
    Wtedy system odrzuca formularz
    I wyświetla komunikat o błędzie "Stawka musi być większa niż zero"
