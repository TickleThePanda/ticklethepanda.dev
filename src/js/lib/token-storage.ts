export { TokenStorage };

class TokenStorage {
  save(token) {
    window.localStorage.setItem("token", token);
  }

  load() {
    return window.localStorage.getItem("token");
  }
}
