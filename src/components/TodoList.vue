<template>
  <div class="container">
    <div class="task">
      <div class="title">
        <h1>Lista To Do</h1>
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
    };
  },
  computed: {
    incomplete() {
      return this.tasksCopy.filter(this.inProgress).length;
    },
  },
  methods: {
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
    addTask() {
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
      localStorage.removeItem("loggedInUsername");
      this.$router.push({ name: "login" });
    },
  },
  watch: {
    tasks: {
      immediate: true, 
      handler(newTasks) {
        this.tasksCopy = [...newTasks]; 
      },
    },
  },
  mounted() {
    const loggedInUsername = localStorage.getItem("loggedInUsername");
  if (!loggedInUsername) {
    this.$router.push({ name: 'login' }); 
  } else {
    this.loadTasksFromLocalStorage(); 
  }
  },
};
</script>
