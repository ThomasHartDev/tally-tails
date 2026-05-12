import {
  createCookieSessionStorage,
  type Session,
  type SessionStorage,
} from "react-router";
import type { HydrogenSession } from "@shopify/hydrogen";

/**
 * Cookie-backed session for Hydrogen. Same shape as the quickstart
 * scaffold. Phase 2 may swap storage if we move off Oxygen.
 */
export class AppSession implements HydrogenSession {
  public isPending = false;

  #sessionStorage: SessionStorage;
  #session: Session;

  constructor(sessionStorage: SessionStorage, session: Session) {
    this.#sessionStorage = sessionStorage;
    this.#session = session;
  }

  static async init(request: Request, secrets: string[]): Promise<AppSession> {
    const storage = createCookieSessionStorage({
      cookie: {
        name: "session",
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secrets,
      },
    });

    const session = await storage
      .getSession(request.headers.get("Cookie"))
      .catch(() => storage.getSession());

    return new this(storage, session);
  }

  get has() {
    return this.#session.has.bind(this.#session);
  }

  get get() {
    return this.#session.get.bind(this.#session);
  }

  get flash() {
    return this.#session.flash.bind(this.#session);
  }

  get unset() {
    this.isPending = true;
    return this.#session.unset.bind(this.#session);
  }

  get set() {
    this.isPending = true;
    return this.#session.set.bind(this.#session);
  }

  destroy() {
    return this.#sessionStorage.destroySession(this.#session);
  }

  commit() {
    this.isPending = false;
    return this.#sessionStorage.commitSession(this.#session);
  }
}
