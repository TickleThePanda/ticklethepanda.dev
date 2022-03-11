import { TokenStorage } from "./lib/token-storage.js";

class TokenManagerApp {
  token: any;
  constructor(token) {
    this.token = token;
  }

  run() {
    const form = document.getElementById("token-form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const clientName = form["client-name"].value;
      const tokenBody = form["token-body"].value;

      const tokenBaseUrl = document.documentElement.dataset.urlApiAuth;

      let url = `${tokenBaseUrl}/tokens/clients/${clientName}`;

      let authHeaderValue = "Bearer " + this.token;

      let headers = new Headers({
        "Content-Type": "application/json",
        Authorization: authHeaderValue,
      });

      let init: RequestInit = {
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

      document.getElementById("token-result").innerHTML = token;
    });
  }
}

window.addEventListener("load", () => {
  const tokenStorage = new TokenStorage();
  const thermometerApp = new TokenManagerApp(tokenStorage.load());

  thermometerApp.run();
});
