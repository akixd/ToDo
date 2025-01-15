<template>
    <div>
      <h1>Rejestracja</h1>
      <form @submit.prevent="register">
        <input v-model="username" type="text" placeholder="Nazwa użytkownika" required />
        <input v-model="password" type="password" placeholder="Hasło" required />
        <button type="submit">Zarejestruj</button>
      </form>
      <p>Masz już konto? <router-link to="/login">Zaloguj się</router-link></p>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        username: "",
        password: "",
      };
    },
    methods: {
      register() {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const existingUser = users.find(u => u.username === this.username);
  
        if (existingUser) {
          alert("Nazwa użytkownika jest już zajęta!");
          return;
        }
  
        users.push({ username: this.username, password: this.password });
        localStorage.setItem("users", JSON.stringify(users));
        alert("Rejestracja zakończona pomyślnie! Możesz się teraz zalogować.");
        this.$router.push({ name: "login" });
      },
    },
  };
  </script>
  