# Instalacja 
npm install

# Uruchomienie
npm run serve

# Opis aplikacji
Aplikacja ma zapewnić narzędzie listy to-do z możliwością synchronizacji z Google Tasks.


# Napotkane problemy i sposoby ich rozwiązania (za pomocą Vue.js)
Błędy podczas interakcji z Google Tasks API
    Dodano odpowiednią obsługę błędów w przypadku braku tokena dostępu, co uniemożliwia wykonywanie operacji na API. Jeśli token wygasa lub jest nieprawidłowy, system prosi użytkownika o     ponowne zalogowanie się.
    Każda interakcja z Google Tasks API (np. dodawanie, usuwanie zadań) jest otoczona blokiem try-catch, co pozwala na wykrywanie błędów i ich odpowiednią obsługę. Komunikaty o błędach są wyświetlane w konsoli oraz, w razie potrzeby, w interfejsie użytkownika.
Błędy w przetwarzaniu danych z Google Tasks API
    Dodanie pliku vue.config.js umożliwiło skonfigurowanie proxy, które kieruje zapytania do Google Tasks API poprzez lokalny serwer deweloperski, omijając blokady CORS. Określono również dodatkowe nagłówki zabezpieczeń, które pozwalają na bezpieczne wykonywanie zapytań i łączenie się z Google API.
Dostęp niezalogowanego użytkownika do aplikacji
    Używając BeforeEach sprawdzane jest czy użytkownik chce wejść na stronę, która wymaga zalogowania, jeśli tak, a użytkownik nie jest zalogowany to jest przekierowywany na stronę logowania.