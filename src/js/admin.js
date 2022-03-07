import { TokenStorage } from "./admin/token-storage.js";

let tokenStorage = new TokenStorage();

window.addEventListener("load", () => {
  const url = window.location.pathname;

  let token = tokenStorage.load();
  if (!token && url !== "/admin/") {
    window.location = "/admin/";
  } else if (token && url === "/admin/") {
    window.location = "/admin/home/";
  }
});
