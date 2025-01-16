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
  </div>
</template>

<script>
import TaskItem from "./Task-item";

export default {
  name: "Task",
  props: ['tasks'],
  components: {
    TaskItem,
  },
  data() {
    return {
      newTask: "",
      tasksCopy: [...this.tasks],
    };
  },
  computed: {
    incomplete() {
      return this.tasksCopy.filter(this.inProgress).length;
    },
  },
  methods: {
    addTask() {
      if (!this.newTask.trim()) {
        alert("Tytuł zadania nie może być pusty");
        return;
      }
      if (this.tasksCopy.some((task) => task.title.toLowerCase() === this.newTask.trim().toLowerCase())) {
        alert("Zadanie już istnieje");
        return;
      }

      const loggedInUsername = localStorage.getItem("loggedInUsername"); 
      if (!loggedInUsername) {
        alert("Zaloguj się, aby dodać zadania!");
        return;
      }

      if (this.newTask) {
        const newTask = {
          title: this.newTask,
          completed: false,
          username: loggedInUsername, 
        };
        this.tasksCopy.push(newTask); 
        this.newTask = "";
        this.saveTasksToLocalStorage();
      }
    },
    inProgress(task) {
      return !this.isCompleted(task);
    },
    isCompleted(task) {
      return task.completed;
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
    removeTask(index) {
      this.tasksCopy.splice(index, 1);
      this.saveTasksToLocalStorage();
    },
    saveTasksToLocalStorage() {
      const loggedInUsername = localStorage.getItem("loggedInUsername"); 
      if (loggedInUsername) {
        const userTasks = this.tasksCopy.filter(task => task.username === loggedInUsername);
        localStorage.setItem(loggedInUsername + "_tasks", JSON.stringify(userTasks));
      } else {
        console.log("Brak zalogowanego użytkownika. Nie zapisuję zadań.");
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
  },
  mounted() {
    this.loadTasksFromLocalStorage();
  },
};
</script>
