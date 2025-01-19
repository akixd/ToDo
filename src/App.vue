<template>
  <div id="app">
    <router-view />
  </div>
</template>


<script>
export default {
  name: "App",
  components: {
  },
  data() {
    return {
      tasks: [], 
      username: "", 
      password: "", 
      newUsername: "", 
      newPassword: "", 
    };
  },
  mounted() {
    this.checkUsersDatabase(); 
  },
  methods: {
    checkUsersDatabase() {
      if (!localStorage.getItem("users")) {
        localStorage.setItem("users", JSON.stringify([])); 
      }
    },
  },
};

</script>
