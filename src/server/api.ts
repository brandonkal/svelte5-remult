import { remultSveltekit } from "remult/remult-sveltekit";
import { Module, Panel } from "../demo/todo/entities";
// import { getUserFromRequest } from "./auth";
// import { User } from "../demo/auth/User";
  
export const api = remultSveltekit({
  // getUser: getUserFromRequest,
  // initApi: async () => {
  //   await User.createDemoUsers();
  // },
  admin: true,
  entities: [Module, Panel],
});