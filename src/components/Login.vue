<template>
    <div class="loginPage">
      <h2 class="title">Zaloguj się</h2>
      <Login @login="login" />
      <form id="loginmform" @submit.prevent="login" method="post">
        <input v-model="username" type="text" placeholder="Nazwa użytkownika" required />
        <input v-model="password" type="password" placeholder="Hasło" required />
        <button class="btn-login" type="submit" @click="login">Zaloguj się</button>
      </form>
      <p>Nie masz konta? 
        <button class="btn-register-1" @click="goToRegisterPage">Zarejestruj się</button>
      </p>
      <button class="btn-login" type="submit" @click="googleSignIn">Zaloguj się przez Google</button>

      <div v-if="showRegisterForm">
        <h2 class="title">Rejestracja</h2>
        <form @submit.prevent="register">
          <input v-model="newUsername" type="text" placeholder="Nazwa użytkownika" required />
          <input v-model="newPassword" type="password" placeholder="Hasło" required />
          <button class="btn-register-2" type="submit">Zarejestruj się</button>
        </form>
      </div>
    </div>
  </template>
  
  <script>
import { gapi } from 'gapi-script';

  export default {
    data() {
      return {
        username: '',
        password: '',
        isLoggedIn: false,
        isLoggedInGoogle: false, 
      };
    },
    methods: {
      login() {
      const users = JSON.parse(localStorage.getItem("users")) || [];

      const user = users.find(u => u.username === this.username && u.password === this.password);

      if (user) {
        this.username = ""; 
        this.password = "";

        localStorage.setItem("loggedInUsername", user.username);
        localStorage.setItem("accountType", "local");
        this.loadTasksFromLocalStorage();
        
        this.$router.push({ name: 'todo' }); 

        alert("Zalogowano pomyślnie!");
      } else {
        alert("Niepoprawna nazwa użytkownika lub hasło!");
      }
      },
      async googleSignIn() {
        try {
          const googleAuth = gapi.auth2.getAuthInstance();
          const user = await googleAuth.signIn();
          const token = user.getAuthResponse().id_token;

          console.log(token);
          const profile = user.getBasicProfile();
          const username = profile.getName();
         
          localStorage.setItem("loggedInUsername", username);
          localStorage.setItem("accountType", "google");
          await this.loadTasksFromGoogle();
          this.$router.push({ name: 'todo' }); 
        } catch (error) {
          console.error('Logowanie do Google nie powiodło się:', error);
        }
      },
      goToRegisterPage() {
      this.$router.push({name: "register" });

    }
    },
  };
  </script>
  