import { remultSveltekit } from "remult/remult-sveltekit";
import { Task } from "../demo/todo/Task";
import { getUserFromRequest } from "./auth";
import { User } from "../demo/auth/User";
  
export const api = remultSveltekit({
  getUser: getUserFromRequest,
  initApi: async () => {
    await User.createDemoUsers();
  },
  admin: true,
  entities: [Task, User],
});