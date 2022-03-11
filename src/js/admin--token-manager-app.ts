import { TokenStorage } from "./lib/token-storage.js";

class TokenManagerApp {
  token: string;
  constructor(token: string) {
    this.token = token;
  }

  run() {
    const form = <HTMLFormElement>document.getElementById("token-form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const clientName = form["client-name"].value;
      const tokenBody = form["token-body"].value;

      const tokenBaseUrl = document.documentElement.dataset.urlApiAuth;

      const url = `${tokenBaseUrl}/tokens/clients/${clientName}`;

      const authHeaderValue = "Bearer " + this.token;

      const headers = new Headers({
        "Content-Type": "application/json",
        Authorization: authHeaderValue,
      });

      const init: RequestInit = {
        credentials: "include",
        method: "POST",
        headers: headers,
        mode: "cors",
        body: tokenBody,
      };

      const response = await fetch(url, init);

      if (!response.ok) {
        throw new Error("Unable to create new token");
      }

      const token = await response.text();

      const tokenResultElement = <HTMLElement>(
        document.getElementById("token-result")
      );
      tokenResultElement.innerHTML = token;
    });
  }
}

window.addEventListener("load", () => {
  const tokenStorage = new TokenStorage();
  const token = tokenStorage.load();
  if (token === null) {
    throw new Error("Unable to get token");
  }
  const thermometerApp = new TokenManagerApp(token);

  thermometerApp.run();
});
