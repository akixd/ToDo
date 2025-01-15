<template>
  <div>
    <h1>Witaj w aplikacji!</h1>
    <p>Twoje zadania:</p>
    <ul>
      <li v-for="task in tasks" :key="task.id">
        {{ task.title }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tasks: [],
    };
  },
  mounted() {
    const loggedInUsername = localStorage.getItem("loggedInUsername");
    if (loggedInUsername) {
      const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
      this.tasks = tasks.filter(task => task.username === loggedInUsername);
    }
  },
};
</script>
