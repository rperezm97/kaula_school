/**
 * Small container for response headers that need to be propagated across
 * runtimes, especially `Set-Cookie` in Cloudflare fetch handlers.
 */
export class HeadersContainer {
  private readonly setCookieValues: string[] = [];

  appendSetCookie(value: string) {
    if (value) this.setCookieValues.push(value);
  }

  getSetCookieHeaders(): string[] {
    return [...this.setCookieValues];
  }

  hasSetCookieHeaders(): boolean {
    return this.setCookieValues.length > 0;
  }
}
