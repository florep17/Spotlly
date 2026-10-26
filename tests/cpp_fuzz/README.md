# C++ Fuzz Testing (`tests/cpp_fuzz/`)

Katalog przeznaczony na testy odpornościowe (fuzzing) silnika dopasowania miejsc parkingowych (`searchEngine` / C++ Crow).

## Zakres testów:
* **Narzędzie:** LLVM `libFuzzer` / `AddressSanitizer` (ASan) / `UndefinedBehaviorSanitizer` (UBSan).
* **Cel:** Weryfikacja odporności parsera zapytań geoprzestrzennych oraz algorytmu obliczania nakładania przedziałów czasowych na zniekształcone dane wejściowe (malformed JSON, skrajne współrzędne GPS, ujemne znaczniki czasu).
* **Odpowiedzialna:** Zuzanna Kot.
