<template>
  <div id="app">
    <router-view />
  </div>
</template>


<script>

import { gapi } from 'gapi-script';


export default {
  name: "App",
  components: {
  },
  data() {
    return {
      tasks: [], 
      username: "", 
      password: "", 
      newUsername: "", 
      newPassword: "", 
    };
  },
  mounted() {
    this.checkLoginStatus(); 
    this.checkUsersDatabase(); 
    this.loadTasks();
  },
  methods: {
    loadTasks() {
    const accountType = localStorage.getItem("accountType");

    if (accountType === "local") {
      this.loadTasksFromLocalStorage();
    } else if (accountType === "google") {
      this.loadGoogleTasks();
    }
  },
    loadTasksFromLocalStorage() {
      const loggedInUsername = localStorage.getItem("loggedInUsername");

      if (loggedInUsername) {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        this.tasks = tasks.filter(task => task.username === loggedInUsername);
      } else {
        console.log("Brak zalogowanego użytkownika. Nie ładuje zadań.");
      }
    },
    
    saveTasksToLocalStorage() {
      localStorage.setItem("tasks", JSON.stringify(this.tasks));
    },

    addTask(newTaskTitle) {
      const loggedInUsername = localStorage.getItem("loggedInUsername");

      if (loggedInUsername) {
        const newTask = {
          id: Date.now(),
          title: newTaskTitle,
          completed: false,
          username: loggedInUsername, 
        };
        this.tasks.push(newTask);
        this.saveTasksToLocalStorage(); 
      } else {
        alert("Musisz być zalogowany, aby dodać zadanie.");
      }
    },
    async loadGoogleTasks() {
    try {
      const response = await gapi.client.tasks.tasks.list({
        tasklist: "@default", 
      });
      this.tasks = response.result.items || [];
    } catch (error) {
      console.error("Nie udało się pobrać zadań:", error);
    }
  },

          logout() {
        this.username = "";
        this.password = "";
        
        localStorage.removeItem("loggedInUsername");

        const loggedInUsername = localStorage.getItem("loggedInUsername");
        if (loggedInUsername) {
          localStorage.setItem(loggedInUsername + "_tasks", JSON.stringify([]));
        }
        this.tasks = [];
        this.$router.push({ name: 'login' }); 
        alert("Wylogowano!");
      },
      async googleSignOut() {
        try {
          const googleAuth = gapi.auth2.getAuthInstance();
          await googleAuth.signOut();
          this.tasks = [];
          localStorage.removeItem("loggedInUsername");
        } catch (error) {
          console.error('Wylogowanie z Google nie powiodło się:', error);
        }
      },
          async loadTasksFromGoogle() {
        try {
          const response = await gapi.client.tasks.tasks.list({
            tasklist: '@default', 
          });

          this.tasks = response.result.items || [];
        } catch (error) {
          console.error('Nie udało się pobrać zadań:', error);
        }
      },
      async addTaskToGoogle(newTaskTitle) {
      try {
        const response = await gapi.client.tasks.tasks.insert({
          tasklist: '@default',
          resource: {
            title: newTaskTitle,
          },
        });
        this.saveTasksToLocalStorage(); 
        this.tasks.push(response.result);
      } catch (error) {
        console.error('Nie udało się dodać zadania:', error);
      }
    },
    checkLoginStatus() {
      const loggedInUsername = localStorage.getItem("loggedInUsername");

      if (loggedInUsername) {
        this.isLoggedIn = true;
      }

      const googleUser = gapi.auth2.getAuthInstance().currentUser.get();
      if (googleUser.isSignedIn()) {
        this.isLoggedInGoogle = true;
      }
    },

    checkUsersDatabase() {
      if (!localStorage.getItem("users")) {
        localStorage.setItem("users", JSON.stringify([])); 
      }
    },

    register() {
      const users = JSON.parse(localStorage.getItem("users")) || [];

      const existingUser = users.find(u => u.username === this.newUsername);

      if (existingUser) {
        alert("Nazwa użytkownika jest już zajęta!");
        return;
      }

      users.push({ username: this.newUsername, password: this.newPassword });
      localStorage.setItem("users", JSON.stringify(users)); 
      this.showRegisterForm = false;
      this.showLoginForm = true;
      this.newUsername = "";
      this.newPassword = "";
      alert("Rejestracja zakończona pomyślnie!");
    },
    goToRegisterPage() {
      console.log("Przekierowywanie do strony rejestracji...");
      this.$router.push({name: "register" });
    }
  },
};

</script>
