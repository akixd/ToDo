<template>
  <div id="app">
    <!-- Formularz logowania -->
    <div v-if="!isLoggedIn">
      <h2>Zaloguj się</h2>
      <form @submit.prevent="login">
        <input v-model="username" type="text" placeholder="Nazwa użytkownika" required />
        <input v-model="password" type="password" placeholder="Hasło" required />
        <button class="login-btn" type="submit">Zaloguj</button>
      </form>
      
      <p>Nie masz konta? 
        <button @click="showRegisterForm = !showRegisterForm">Zarejestruj się</button>
      </p>

      <!-- Formularz rejestracji -->
      <div v-if="showRegisterForm">
        <h2>Rejestracja</h2>
        <form @submit.prevent="register">
          <input v-model="newUsername" type="text" placeholder="Nazwa użytkownika" required />
          <input v-model="newPassword" type="password" placeholder="Hasło" required />
          <button class="register-btn" type="submit">Zarejestruj się</button>
        </form>
      </div>
    </div>

    <!-- Jeśli użytkownik jest zalogowany, wyświetl zadania -->
    <div v-else>
      <task v-bind:tasks="tasks"></task>
      <button class="logout-btn" @click="logout">Wyloguj się</button>
    </div>
  </div>
</template>


<script>
import Task from "./components/Task";

export default {
  name: "App",
  components: {
    Task,
  },
  data() {
    return {
      tasks: [], // Lista zadań
      username: "", // Nazwa użytkownika do logowania
      password: "", // Hasło do logowania
      newUsername: "", // Nazwa użytkownika do rejestracji
      newPassword: "", // Hasło do rejestracji
      isLoggedIn: false, // Flaga informująca o stanie logowania
      showRegisterForm: false, // Flaga do pokazania formularza rejestracji
      hideLoginForm: false,
    };
  },
  mounted() {
    this.checkLoginStatus(); // Sprawdzamy, czy użytkownik jest już zalogowany
    this.checkUsersDatabase(); // Sprawdzamy, czy mamy już bazę użytkowników
    this.loadTasksFromLocalStorage(); // Ładujemy zadania z localStorage
  },
  methods: {
    loadTasksFromLocalStorage() {
      const loggedInUsername = localStorage.getItem("loggedInUsername");

      if (loggedInUsername) {
        // Ładujemy zadania i filtrujemy je po nazwie użytkownika
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        this.tasks = tasks.filter(task => task.username === loggedInUsername);
      } else {
        console.log("Brak zalogowanego użytkownika. Nie ładuje zadań.");
      }
    },
    
    saveTasksToLocalStorage() {
      // Zapisujemy wszystkie zadania do localStorage
      localStorage.setItem("tasks", JSON.stringify(this.tasks));
    },

    addTask(newTaskTitle) {
      const loggedInUsername = localStorage.getItem("loggedInUsername");

      if (loggedInUsername) {
        const newTask = {
          id: Date.now(),
          title: newTaskTitle,
          completed: false,
          username: loggedInUsername, // Przypisujemy użytkownika do zadania
        };
        this.tasks.push(newTask);
        this.saveTasksToLocalStorage(); // Zapisujemy zadania po dodaniu
      } else {
        alert("Musisz być zalogowany, aby dodać zadanie.");
      }
    },

    login() {
      // Pobieramy dane o użytkownikach z localStorage
      const users = JSON.parse(localStorage.getItem("users")) || [];

      // Sprawdzamy, czy użytkownik istnieje w bazie
      const user = users.find(u => u.username === this.username && u.password === this.password);

      if (user) {
        // Użytkownik poprawnie zalogowany
        this.isLoggedIn = true;
        this.username = ""; // Czyścimy pola
        this.password = "";

        // Zapisz nazwę użytkownika w localStorage
        localStorage.setItem("loggedInUsername", user.username);

        // Ładujemy zadania użytkownika
        this.loadTasksFromLocalStorage();

        alert("Zalogowano pomyślnie!");
      } else {
        alert("Niepoprawna nazwa użytkownika lub hasło!");
      }
    },
          logout() {
        this.isLoggedIn = false;
        this.username = "";
        this.password = "";
        
        // Usuwamy dane logowania z localStorage
        localStorage.removeItem("loggedInUsername");

        // Zapisujemy zadania dla aktualnego użytkownika (po wylogowaniu zapisujemy puste zadania)
        const loggedInUsername = localStorage.getItem("loggedInUsername");
        if (loggedInUsername) {
          // Zapisujemy puste zadania dla użytkownika
          localStorage.setItem(loggedInUsername + "_tasks", JSON.stringify([]));
        }

        // Opróżniamy lokalnie zadania
        this.tasks = [];

        alert("Wylogowano!");
      },
    checkLoginStatus() {
      // Sprawdzamy, czy użytkownik jest już zalogowany po odświeżeniu
      const loggedInUsername = localStorage.getItem("loggedInUsername");

      if (loggedInUsername) {
        // Jeśli nazwa użytkownika jest zapisana w localStorage, ustawiamy flagę na true
        this.isLoggedIn = true;
      }
    },

    checkUsersDatabase() {
      // Sprawdzamy, czy istnieje baza użytkowników w LocalStorage
      if (!localStorage.getItem("users")) {
        localStorage.setItem("users", JSON.stringify([])); // Jeśli nie ma, tworzymy pustą bazę
      }
    },

    register() {
      const users = JSON.parse(localStorage.getItem("users")) || [];

      // Sprawdzamy, czy nazwa użytkownika już istnieje
      const existingUser = users.find(u => u.username === this.newUsername);

      if (existingUser) {
        alert("Nazwa użytkownika jest już zajęta!");
        return;
      }

      // Dodajemy nowego użytkownika do bazy
      users.push({ username: this.newUsername, password: this.newPassword });
      localStorage.setItem("users", JSON.stringify(users)); // Zapisujemy zmiany do LocalStorage
      this.showRegisterForm = false;
      this.newUsername = "";
      this.newPassword = "";
      alert("Rejestracja zakończona pomyślnie!");
    },
  },
};

</script>
