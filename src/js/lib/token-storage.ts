export { TokenStorage };

class TokenStorage {
  save(token: string): void {
    window.localStorage.setItem("token", token);
  }

  load(): string | null {
    return window.localStorage.getItem("token");
  }
}
