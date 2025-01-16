import Vue from "vue";
import Router from "vue-router";
import Login from "@/components/Login.vue";
import Register from "@/components/Register.vue";
import TodoList from "@/components/TodoList.vue";

Vue.use(Router);

const routes = [
  {
    path: "/login",
    name: "login",
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: "/todo",
    name: "todo",
    component: TodoList,
    meta: { requiresAuth: true },
  },
  {
    path: "/register",
    name: "register",
    component: Register,
    meta: { requiresAuth: false },
  },
];

const router = new Router({
  mode: "history",
  routes,
});

router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem("loggedInUsername");

  if (to.matched.some(record => record.meta.requiresAuth) && !isLoggedIn) {
    next({ name: "login" }); 
  } 
  else if ((to.name === "login" || to.name === "register") && isLoggedIn) {
    next({ name: "todo" }); 
  } 
  else {
    next(); 
  }
});


export default router;
