# Instalacja 
npm install

# Uruchomienie
npm run serve

# Opis aplikacji
Aplikacja ma zapewnić narzędzie listy to-do.


# Napotkane problemy i sposoby ich rozwiązania (za pomocą Vue.js)
zapobieganie duplikatom w liście - metoda some() sprawdza czy jakikolwiek element tablicy tasks spełnia warunek, porównanie tytułu nowego zadania z istniejącymi już zadaniami w liście tasks - this.tasks.some((task) => task.title.toLowerCase() === this.newTask.trim().toLowerCase())
tytuł nie może być pusty - metoda trim() usuwa nadmiarowe spacje na początku i końcu wprowadzonego tekstu, sprawdzone jest to czy po usunięciu spacji pole wejściowe (newTask) jest puste - !this.newTask.trim()
nie zapisujące sie dane logowania dla poszczegolnych uzytkownikow - 