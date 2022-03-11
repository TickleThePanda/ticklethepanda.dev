import { TokenStorage } from "./lib/token-storage.js";
import { TokenClient } from "./lib/token-client.js";

const tokenStorage = new TokenStorage();
const tokenClient = new TokenClient();

window.addEventListener("load", (e) => {
  let form = <HTMLFormElement>document.getElementById("login");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    let username = (<HTMLInputElement>document.getElementById("username"))
      .value;
    let password = (<HTMLInputElement>document.getElementById("password"))
      .value;

    try {
      const token = await tokenClient.fetchToken(username, password);

      tokenStorage.save(token);

      window.location.href = "/admin/home/";
    } catch (e: any) {
      const loginElement = <HTMLFormElement>document.getElementById("login");
      loginElement.reset();

      const errorElement = <HTMLElement>document.getElementById("error");
      errorElement.textContent = e.message;
    }
  });
});
