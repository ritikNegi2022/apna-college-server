import auth_router from "./auth.route.js";
import topics_router from "./topics.route.js";
import progress_router from "./progress.route.js";
export default [
  { route: "auth", router: auth_router },
  { route: "topics", router: topics_router },
  { route: "progress", router: progress_router },
];
