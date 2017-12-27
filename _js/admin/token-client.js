export { TokenClient };

class TokenClient {
  fetchToken(username, password) {
    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(username + ":" + password));

    let opts = {
      method: 'POST',
      mode: 'cors',
      headers: headers
    }

    let url = 'https://api.ticklethepanda.co.uk/authentication/tokens/users';

    return fetch(url, opts)
      .then(response => response.text());

  }
}
