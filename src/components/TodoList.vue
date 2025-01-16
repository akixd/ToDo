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
  props: ['tasks'],
  components: {
    TaskItem,
  },
  mounted() {
    this.loadTasks();
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
    removeTask(taskId) {
      this.tasks = this.tasks.filter(task => task.id !== taskId);
      this.saveTasks();
    },
    logout() {
      localStorage.removeItem("loggedInUsername");
      this.$router.push({ name: "login" });
    },
  },
};
</script>

