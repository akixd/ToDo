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
        <div class="remove-list">
          <button @click="removeList()"><h2>Usuń wybraną listę</h2></button>
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
        <button @click="clearCompleted">Usuń ukończone</button>
        <button @click="clearAll">Usuń wszystkie</button>
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
      newListTitle: "",
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
      if (this.accountType === 'local') {
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
    }
    },
    saveTasksToLocalStorage() {
      if (this.accountType === "google") {
      return;
    }
      const loggedInUsername = localStorage.getItem("loggedInUsername");
      if (loggedInUsername) {
        localStorage.setItem(loggedInUsername + "_tasks", JSON.stringify(this.tasksCopy));
      } else {
        console.log("Brak zalogowanego użytkownika. Nie zapisuję zadań.");
      }
    },
      async fetchGoogleTaskLists() {
          if (this.accountType === "google"){
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

              
            if (!this.selectedGoogleTaskList && this.googleTaskLists.length > 0) {
              this.selectedGoogleTaskList = this.googleTaskLists[0];
            }
            } else {
              console.error("Nie znaleziono żadnych list zadań.");
            }
          } catch (error) {
            console.error("Nie udało się pobrać list zadań:", error);
          } finally {
          this.loading = false;
        }
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
        const tasksFromGoogle = response.result.items || [];

        this.tasksCopy = tasksFromGoogle.map(task => ({
          id: task.id,
          title: task.title,
          completed: task.status === 'completed',  
        }));

        console.log("Wczytane zadania z Google:", this.tasksCopy);  
      } catch (error) {
        console.error("Nie udało się pobrać zadań z Google Tasks:", error);
      }
        },
        onGoogleTaskListChange() {
          console.log("Lista zadań została zmieniona:", this.selectedGoogleTaskList);
          this.loadGoogleTasks();
      },
      async addTaskToGoogle(newTaskTitle) {
        if (!this.selectedGoogleTaskList) {
          alert("Wybierz listę Google Tasks przed dodaniem zadania.");
          return;
        }

        const accessToken = localStorage.getItem('googleToken');
        if (!accessToken) {
          alert("Brak tokenu dostępu.");
          return;
        }
        
        gapi.auth.setToken({
            access_token: localStorage.getItem('googleToken'),
          });

        try {
          const response = await gapi.client.tasks.tasks.insert({
            tasklist: this.selectedGoogleTaskList.id,
            resource: {
              title: newTaskTitle,
            },
          });

          console.log("Zadanie dodane do Google Tasks:", response.result);
          this.updateUI();
          this.$forceUpdate();
        } catch (error) {
          console.error("Nie udało się dodać zadania do Google Tasks:", error);
        }
      },
      updateUI() {
        this.$forceUpdate();
      },
    async createGoogleTaskList(newListTitle) {
        gapi.auth.setToken({
          access_token: localStorage.getItem("googleToken"),
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
          this.selectedGoogleTaskList = response.result;
          this.loadGoogleTasks();
        } catch (error) {
          console.error("Nie udało się stworzyć nowej listy zadań:", error);
        }
      },
      async removeList() {
        if (!this.selectedGoogleTaskList) {
          alert("Nie wybrano listy do usunięcia.");
          return;
        }

        if (this.googleTaskLists[0] && this.selectedGoogleTaskList.id === this.googleTaskLists[0].id) {
          alert("Nie można usunąć pierwszej listy.");
          return;
        }

        try {
          gapi.auth.setToken({
            access_token: localStorage.getItem('googleToken'),
          });

          const response = await gapi.client.tasks.tasklists.delete({
          tasklist: this.selectedGoogleTaskList.id,
          });
          console.log("Odpowiedź z usunięcia listy:", response);


          this.googleTaskLists = this.googleTaskLists.filter(
            (list) => list.id !== this.selectedGoogleTaskList.id
          );

          this.selectedGoogleTaskList = this.googleTaskLists.length > 0
          ? this.googleTaskLists[0]
          : null;

          alert("Lista została usunięta.");
          console.log("Lista została pomyślnie usunięta.");
        } catch (error) {
          console.error("Nie udało się usunąć listy:", error);
          alert("Wystąpił błąd podczas usuwania listy. Spróbuj ponownie.");
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
      console.log("Próba usunięcia zadania.");
      const taskToRemove = this.tasksCopy[index];

      this.tasksCopy.splice(index, 1); 
      console.log("Zadanie usunięte lokalnie.");

      if (this.accountType === "google") {
        this.removeTaskFromGoogle(taskToRemove);
      } else {
        this.saveTasksToLocalStorage();
      }

      this.$forceUpdate();
    },
    async removeTaskFromGoogle(task) {
      if (!this.selectedGoogleTaskList) {
        console.error("Nie wybrano listy Google Tasks.");
        return;
      }

      try {
        const response = await gapi.client.tasks.tasks.delete({
          tasklist: this.selectedGoogleTaskList.id,
          task: task.id,
        });

        console.log("Zadanie zostało usunięte z Google Tasks:", response.result);
        this.$forceUpdate();
      } catch (error) {
        console.error("Nie udało się usunąć zadania z Google Tasks:", error);
      }
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

      if (this.accountType === "google") {
        this.updateGoogleTaskStatus(task);
      } else {
        this.saveTasksToLocalStorage();
      }
    },
    async updateGoogleTaskStatus(task) {
    if (!this.selectedGoogleTaskList) {
      console.error("Nie wybrano listy zadań Google.");
      return;
    }
    try {

      const taskStatus = task.completed ? 'completed' : 'needsAction';
      if (!['completed', 'needsAction'].includes(taskStatus)) {
        console.error("Nieprawidłowy status zadania:", taskStatus);
        return;
      }
      console.log("Tasklist ID:", this.selectedGoogleTaskList.id);
      console.log("Task ID:", task.id);
      
      const taskToUpdate = {
        tasklist: this.selectedGoogleTaskList.id,
        task: task.id,
        resource: {
          status: task.completed ? 'completed' : 'needsAction',
        },
      };

      const response = await gapi.client.tasks.tasks.update(taskToUpdate);
      console.log("Zaktualizowano zadanie w Google Tasks:", response.result);
      
      const index = this.tasksCopy.findIndex(t => t.id === task.id);
      if (index !== -1) {
        this.tasksCopy[index].completed = task.completed;
      }

    } catch (error) {
      console.error("Nie udało się zaktualizować zadania w Google Tasks:", error);
    }
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
        this.tasksCopy = []; 
        this.$router.push({ name: 'login' }); 
        alert("Wylogowano!");
      },
      async googleSignOut() {
        try {
          const googleAuth = gapi.auth2.getAuthInstance();
          await googleAuth.signOut();
          this.tasksCopy = []; 
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
    googleTaskLists: {
    handler(newVal) {
      console.log("Zaktualizowano googleTaskLists:", newVal);
    },
    immediate: true,
  },
    selectedGoogleTaskList: {
    immediate: true,
    handler(newList) {
      if (newList) {
        console.log(`Wybrano nową listę: ${newList.title}`);
        this.loadGoogleTasks();
      }
    },
  },
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
    accountType(newType) {
    if (newType === "local") {
      this.loadTasksFromLocalStorage();
    } else if (newType === "google") {
      if (localStorage.getItem('googleToken')) {
        this.fetchGoogleTaskLists();
    }
  }
  },
  },
  },
  mounted() {
    const loggedInUsername = localStorage.getItem("loggedInUsername");

  if (!loggedInUsername) {
    this.$router.push({ name: 'login' }); 
  } else {
    this.accountType = localStorage.getItem("accountType") || 'local'; // jeśli brak w localStorage, ustawiamy na 'local'

    if (this.accountType === "google") {
      this.fetchGoogleTaskLists();
    } else {
      this.loadTasksFromLocalStorage();
    }

    this.checkLoginStatus();
    this.checkGoogleLoginStatus();
  }
}
};
</script>
