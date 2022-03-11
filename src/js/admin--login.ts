import { TokenStorage } from "./lib/token-storage.js";
import { TokenClient } from "./lib/token-client.js";

const tokenStorage = new TokenStorage();
const tokenClient = new TokenClient();

window.addEventListener("load", () => {
  const form = <HTMLFormElement>document.getElementById("login");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = (<HTMLInputElement>document.getElementById("username"))
      .value;
    const password = (<HTMLInputElement>document.getElementById("password"))
      .value;

    try {
      const token = await tokenClient.fetchToken(username, password);

      tokenStorage.save(token);

      window.location.href = "/admin/home/";
    } catch (e: unknown) {
      const loginElement = <HTMLFormElement>document.getElementById("login");
      loginElement.reset();

      const errorElement = <HTMLElement>document.getElementById("error");
      if (e instanceof Error) {
        errorElement.textContent = e.message;
      } else {
        errorElement.textContent = "Unknown error occurred";
      }
    }
  });
});
