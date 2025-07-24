import { publicRoutes } from "./publicRoutes";
import { privateRoutes } from "./privateRoutes";
import { adminRoutes } from "./adminRoutes";

export const routes = {
  public: publicRoutes,
  private: privateRoutes,
  admin: adminRoutes,
};