export { TokenStorage };

class TokenStorage {
  save(token: string) {
    window.localStorage.setItem("token", token);
  }

  load(): string | null {
    return window.localStorage.getItem("token");
  }
}