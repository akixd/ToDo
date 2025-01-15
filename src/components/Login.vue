<template>
    <div>
      <h1>Login</h1>
      <form @submit.prevent="login">
        <input v-model="username" type="text" placeholder="Nazwa użytkownika" required />
        <input v-model="password" type="password" placeholder="Hasło" required />
        <button type="submit">Zaloguj</button>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        username: '',
        password: '',
      };
    },
    methods: {
      login() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.username === this.username && u.password === this.password);
  
        if (user) {
          localStorage.setItem('loggedInUsername', user.username);
          this.$router.push({ name: 'home' }); 
        } else {
          alert('Niepoprawna nazwa użytkownika lub hasło!');
        }
      },
    },
  };
  </script>
  