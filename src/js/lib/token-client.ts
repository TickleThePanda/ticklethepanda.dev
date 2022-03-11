export { TokenClient };

const authApiBase = document.documentElement.dataset.urlApiAuth;

class TokenClient {
  async fetchToken(username, password) {
    let headers = new Headers();
    headers.append("Authorization", "Basic " + btoa(username + ":" + password));

    let opts: RequestInit = {
      method: "POST",
      mode: "cors",
      headers: headers,
    };

    let url = authApiBase + "/tokens/users";

    const response = await fetch(url, opts);

    if (response.ok) {
      return await response.text();
    } else {
      if (response.status === 401) {
        throw new Error("Unauthorized");
      } else {
        throw new Error("Unexpected error occured");
      }
    }
  }
}
