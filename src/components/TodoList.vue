<template>
  <div class="container">
    <div class="task">
      <div class="title">
        <h2>Lista To Do</h2>
      </div>
      <div class="container-list" v-if="accountType !== 'local'">
        <div class="choose-list">
          <h3>Wybierz listę</h3>
          <div v-if="accountType === 'google'">
            <select v-model="selectedGoogleTaskList" @change="onGoogleTaskListChange">
            <option v-for="list in googleTaskLists" :key="list.id" :value="list">
            {{ list.title }}
            </option>
            </select>
          </div>
        </div>
        <div class="add-new-list">
          <router-link to="/create-list"><h2>Dodaj nową listę</h2></router-link>
        </div>
      </div>
      <div class="form">
        <input
          type="text"
          placeholder="Nowe zadanie"
          v-model="newTask"
          @keyup.enter="addTask"
        />
        <button class="btn-addtask" @click="addTask"><i class="fas fa-plus"></i></button>
      </div>
      <div class="taskItems">
        <ul>
          <task-item
            v-bind:task="task"
            v-for="(task, index) in tasksCopy"
            :key="task.id"
            @remove="removeTask(index)"
            @complete="completeTask(task)"
          ></task-item>
        </ul>
      </div>
      <div class="clearBtns">
        <button @click="clearCompleted">Wyczyść ukończone</button>
        <button @click="clearAll">Wyczyść wszystkie</button>
      </div>
      <div class="pendingTasks">
        <span>Oczekujące zadania: {{ incomplete }}</span>
      </div>
    </div>
    <button class="btn-logout" @click="logout">Wyloguj się</button>
  </div>
</template>

<script>
import { gapi } from 'gapi-script';
import TaskItem from "./Task-item";

export default {
  name: "Task",
  props: ["tasks"],
  components: {
    TaskItem,
  },
  data() {
    return {
      newTask: "",
      tasksCopy: [], 
      googleTaskLists: [],
      selectedGoogleTaskList: null,
      accountType: localStorage.getItem("accountType") || "local",
    };
  },
  computed: {
    incomplete() {
      return this.tasksCopy.filter(this.inProgress).length;
    },
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
        const tasksFromStorage = localStorage.getItem(loggedInUsername + "_tasks");
        if (tasksFromStorage) {
          try {
            this.tasksCopy = JSON.parse(tasksFromStorage);
          } catch (error) {
            console.error("Błąd podczas wczytywania zadań z Local Storage:", error);
          }
        }
      }
    },
    saveTasksToLocalStorage() {
      const loggedInUsername = localStorage.getItem("loggedInUsername");
      if (loggedInUsername) {
        localStorage.setItem(loggedInUsername + "_tasks", JSON.stringify(this.tasksCopy));
      } else {
        console.log("Brak zalogowanego użytkownika. Nie zapisuję zadań.");
      }
    },
      async fetchGoogleTaskLists() {
          this.loading = true;
          this.errorMessage = '';

          try {
          const googleAuth = gapi.auth2.getAuthInstance();
          const googleUser = googleAuth.currentUser.get();

          if (!googleUser.isSignedIn()) {
            console.error("Użytkownik nie jest zalogowany do Google.");
            this.errorMessage = "Proszę zalogować się do Google.";
            return;
          }

          const token = localStorage.getItem('googleToken');
          if (!token) {
            throw new Error('Brak tokena dostępu.');
            }
          gapi.auth.setToken({ access_token: token });

          if (!gapi.client.tasks) {
          await gapi.client.load('tasks', 'v1');
        }

          const response = await gapi.client.tasks.tasklists.list();
          console.log("Odpowiedź z Google API: ", response);

          if (response && response.result && response.result.items) {
            this.googleTaskLists = response.result.items;
            console.log("Listy zadań Google:", this.googleTaskLists);
          } else {
            console.error("Nie znaleziono żadnych list zadań.");
          }
        } catch (error) {
          console.error("Nie udało się pobrać list zadań:", error);
        } finally {
        this.loading = false;
      }
        },
      async loadGoogleTasks() {
          if (!this.selectedGoogleTaskList) {
        console.error("Nie wybrano listy Google Tasks.");
        return;
      }

      try {
        const response = await gapi.client.tasks.tasks.list({
          tasklist: this.selectedGoogleTaskList.id,
        });
        this.tasksCopy = response.result.items || [];
      } catch (error) {
        console.error("Nie udało się pobrać zadań z Google Tasks:", error);
      }
        },
        onGoogleTaskListChange() {
        this.loadGoogleTasks();
      },
      async addTaskToGoogle(newTaskTitle) {
        if (!this.selectedGoogleTaskList) {
          alert("Wybierz listę Google Tasks przed dodaniem zadania.");
          return;
        }

        try {
          gapi.auth.setToken({
            access_token: localStorage.getItem('googleToken'),
          });

          const response = await gapi.client.tasks.tasks.insert({
            tasklist: this.selectedGoogleTaskList.id,
            resource: {
              title: newTaskTitle,
            },
          });

          console.log("Zadanie dodane do Google Tasks:", response.result);

          this.tasksCopy.push({
            id: response.result.id,
            title: response.result.title,
            completed: false,
          });

          this.newTask = "";
        } catch (error) {
          console.error("Nie udało się dodać zadania do Google Tasks:", error);
        }
      },
    async createGoogleTaskList(newListTitle) {
        gapi.auth.setToken({
          access_token: this.token, 
        });

        const loggedInUsername = localStorage.getItem("loggedInUsername");
        if (loggedInUsername) {
        localStorage.setItem(loggedInUsername + "_tasks", JSON.stringify(this.tasksCopy));
      }
        try {
          const response = await gapi.client.tasks.tasklists.insert({
            resource: {
              title: newListTitle,
            },
          });

          console.log("Nowa lista zadań została utworzona:", response.result);
          this.googleTaskLists.push(response.result);


        } catch (error) {
          console.error("Nie udało się stworzyć nowej listy zadań:", error);
        }
      },
    addTask() {
          if (this.accountType === "google") {
        if (this.newTask.trim()) {
          this.addTaskToGoogle(this.newTask);
        } else {
          alert("Nie można dodać pustego zadania.");
        }
      } else {
        const loggedInUsername = localStorage.getItem("loggedInUsername");
        if (loggedInUsername && this.newTask.trim()) {
          const newTask = {
            id: Date.now(),
            title: this.newTask,
            completed: false,
            username: loggedInUsername,
          };
          this.tasksCopy.push(newTask);
          this.newTask = "";
          this.saveTasksToLocalStorage();
        } else {
          alert("Musisz być zalogowany, aby dodać zadanie.");
        }
      }
    },
    removeTask(index) {
      this.tasksCopy.splice(index, 1); 
      this.saveTasksToLocalStorage();
    },
    clearCompleted() {
      this.tasksCopy = this.tasksCopy.filter(this.inProgress); 
      this.saveTasksToLocalStorage();
    },
    clearAll() {
      this.tasksCopy = [];
      this.saveTasksToLocalStorage();
    },
    completeTask(task) {
      task.completed = !task.completed;
      this.saveTasksToLocalStorage();
    },
    inProgress(task) {
      return !task.completed;
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
    checkGoogleLoginStatus() {
      const googleAuth = gapi.auth2.getAuthInstance();
      const googleUser = googleAuth.currentUser.get();

      if (googleUser.isSignedIn()) {
        this.isLoggedInGoogle = true;
        this.fetchGoogleTaskLists();
      } else {
        this.isLoggedInGoogle = false;
      }
    },
   async reauthenticate() {
        try {
          await gapi.auth2.getAuthInstance().signIn();
          const token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
          localStorage.setItem('googleToken', token);
        } catch (error) {
          console.error('Błąd podczas ponownego logowania:', error);
        }
      },
      async loadGapiTasksAPI() {

        if (!gapi.client.tasks) {
         try {
         await gapi.client.load('tasks', 'v1');
         console.log('Google Tasks API zostało załadowane.');
         } catch (error) {
         console.error('Błąd podczas ładowania Google Tasks API:', error);
         throw new Error('Nie udało się załadować Google Tasks API.');
        }
        } else {
            console.log('Google Tasks API jest już załadowane.');
        }
        },
        async signInWithScopes() {
    try {
        const authInstance = gapi.auth2.getAuthInstance();
        await authInstance.signIn({
        scope: 'https://www.googleapis.com/auth/tasks',
        });
        console.log('Użytkownik został pomyślnie zalogowany i udzielił uprawnień');
    } catch (error) {
        console.error('Błąd podczas logowania:', error);
    }
    },
    async checkAuthStatus() {
     const authInstance = gapi.auth2.getAuthInstance();
    

    if (authInstance.isSignedIn.get()) {
        const token = authInstance.currentUser.get().getAuthResponse().access_token;
        console.log("Token dostępu:", token);
        
        const grantedScopes = authInstance.currentUser.get().getGrantedScopes();
        if (grantedScopes.includes("https://www.googleapis.com/auth/tasks")) {
        console.log("Użytkownik ma dostęp do Google Tasks API.");
        } else {
        console.log("Brak wymaganych uprawnień, wymagane ponowne logowanie.");
        await this.signInWithScopes();
        }
    } else {
        console.log("Użytkownik nie jest zalogowany.");
        await this.signInWithScopes();
    }
    },
  },
  watch: {
    tasks: {
    immediate: true,
    handler(newTasks) {
      if (Array.isArray(newTasks)) {
        this.tasksCopy = [...newTasks];
      } else {
        console.warn("Oczekiwano tablicy w 'tasks', ale otrzymano:", newTasks);
        this.tasksCopy = [];
      }
    },
  },
  },
  mounted() {
    const loggedInUsername = localStorage.getItem("loggedInUsername");

  if (!loggedInUsername) {
    this.$router.push({ name: 'login' }); 
  } else {
    this.loadTasksFromLocalStorage(); 
    this.checkLoginStatus(); 
    this.checkGoogleLoginStatus(); 
  }
  },
};
</script>
