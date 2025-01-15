<template>
  <div>
    <h1>Twoja lista zadań</h1>
    <form @submit.prevent="addTask">
      <input v-model="newTask" type="text" placeholder="Dodaj nowe zadanie" required />
      <button type="submit">Dodaj</button>
    </form>
    <ul>
      <li v-for="task in tasks" :key="task.id">
        <input type="checkbox" v-model="task.completed" @change="saveTasks" />
        <span :class="{ completed: task.completed }">{{ task.title }}</span>
        <button @click="removeTask(task.id)">Usuń</button>
      </li>
    </ul>
    <button @click="logout">Wyloguj się</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      newTask: "",
      tasks: [],
    };
  },
  mounted() {
    this.loadTasks();
  },
  methods: {
    loadTasks() {
      const loggedInUsername = localStorage.getItem("loggedInUsername");
      if (loggedInUsername) {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        this.tasks = tasks.filter(task => task.username === loggedInUsername);
      }
    },
    saveTasks() {
      const loggedInUsername = localStorage.getItem("loggedInUsername");
      if (loggedInUsername) {
        const allTasks = JSON.parse(localStorage.getItem("tasks")) || [];
        const updatedTasks = allTasks.filter(task => task.username !== loggedInUsername);
        updatedTasks.push(...this.tasks.map(task => ({ ...task, username: loggedInUsername })));
        localStorage.setItem("tasks", JSON.stringify(updatedTasks));
      }
    },
    addTask() {
      if (!this.newTask) return;
      const task = {
        id: Date.now(),
        title: this.newTask,
        completed: false,
      };
      this.tasks.push(task);
      this.saveTasks();
      this.newTask = "";
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

<style>
.completed {
  text-decoration: line-through;
}
</style>
