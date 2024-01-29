import { TokenStorage } from "./lib/token-storage";

const tokenStorage = new TokenStorage();

window.addEventListener("load", () => {
  const url = window.location.pathname;

  const token = tokenStorage.load();
  if (!token && url !== "/admin/") {
    window.location.href = "/admin/";
  } else if (token && url === "/admin/") {
    window.location.href = "/admin/home/";
  }
});
