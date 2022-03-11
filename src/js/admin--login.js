import { TokenStorage } from "./admin/token-storage.js";
import { TokenClient } from "./admin/token-client.js";

const tokenStorage = new TokenStorage();
const tokenClient = new TokenClient();

window.addEventListener("load", (e) => {
  let form = document.getElementById("login");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    try {
      const token = await tokenClient.fetchToken(username, password);

      tokenStorage.save(token);

      window.location = "/admin/home/";
    } catch (e) {
      document.getElementById("login").reset();
      document.getElementById("error").textContent = e.message;
    }
  });
});
