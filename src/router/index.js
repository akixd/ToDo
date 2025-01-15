import Vue from "vue";
import Router from "vue-router";
import Login from "@/components/Login.vue";
import Register from "@/components/Register.vue";
import TodoList from "@/components/TodoList.vue";

Vue.use(Router);

const routes = [
  {
    path: "/",
    name: "todo",
    component: TodoList,
    meta: { requiresAuth: true },
  },
  {
    path: "/login",
    name: "login",
    component: Login,
  },
  {
    path: "/register",
    name: "register",
    component: Register,
  },
];

const router = new Router({
  mode: "history",
  routes,
});

// Guard do sprawdzania uwierzytelnienia
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem("loggedInUsername");
  if (to.matched.some(record => record.meta.requiresAuth) && !isLoggedIn) {
    next({ name: "login" });
  } else {
    next();
  }
});

export default router;
