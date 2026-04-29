import * as cookie from 'cookie';
import {
  Cookie,
  CookieChangeListener,
  CookieChangeOptions,
  CookieGetOptions,
  CookieSetOptions,
} from './types';
import { hasDocumentCookie, parseCookies, readCookie } from './utils';

export default class Cookies {
  private cookies: { [name: string]: Cookie };
  private defaultSetOptions: CookieSetOptions;
  private changeListeners: CookieChangeListener[] = [];
  private pollingInterval?: ReturnType<typeof setInterval>;

  private HAS_DOCUMENT_COOKIE: boolean = false;

  constructor(
    cookies?: string | object | null,
    defaultSetOptions: CookieSetOptions = {},
  ) {
    const domCookies = typeof document === 'undefined' ? '' : document.cookie;
    this.cookies = parseCookies(cookies || domCookies);
    this.defaultSetOptions = defaultSetOptions;

    this.HAS_DOCUMENT_COOKIE = hasDocumentCookie();
  }

  private _emitChange(params: CookieChangeOptions) {
    for (let i = 0; i < this.changeListeners.length; ++i) {
      this.changeListeners[i](params);
    }
  }

  private _checkChanges(previousCookies: { [name: string]: Cookie }) {
    const names = new Set(
      Object.keys(previousCookies).concat(Object.keys(this.cookies)),
    );

    names.forEach((name) => {
      if (previousCookies[name] !== this.cookies[name]) {
        this._emitChange({
          name,
          value: readCookie(this.cookies[name]),
        });
      }
    });
  }

  private _startPolling() {
    this.pollingInterval = setInterval(this.update, 300);
  }

  private _stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  public get(name: string, options?: CookieGetOptions): any;
  public get<T>(name: string, options?: CookieGetOptions): T;
  public get(name: string, options: CookieGetOptions = {}) {
    if (!options.doNotUpdate) {
      this.update();
    }

    return readCookie(this.cookies[name], options);
  }

  public getAll(options?: CookieGetOptions): any;
  public getAll<T>(options?: CookieGetOptions): T;
  public getAll(options: CookieGetOptions = {}) {
    if (!options.doNotUpdate) {
      this.update();
    }

    const result: { [name: string]: any } = {};

    for (let name in this.cookies) {
      result[name] = readCookie(this.cookies[name], options);
    }

    return result;
  }

  public set(name: string, value: Cookie, options?: CookieSetOptions) {
    if (options) {
      options = {
        ...this.defaultSetOptions,
        ...options,
      };
    } else {
      options = this.defaultSetOptions;
    }

    const stringValue =
      typeof value === 'string' ? value : JSON.stringify(value);
    this.cookies = { ...this.cookies, [name]: stringValue };

    if (this.HAS_DOCUMENT_COOKIE) {
      document.cookie = cookie.serialize(name, stringValue, options);
    }

    this._emitChange({ name, value, options });
  }

  public remove(name: string, options?: CookieSetOptions) {
    const finalOptions = (options = {
      ...this.defaultSetOptions,
      ...options,
      expires: new Date(1970, 1, 1, 0, 0, 1),
      maxAge: 0,
    });

    this.cookies = { ...this.cookies };
    delete this.cookies[name];

    if (this.HAS_DOCUMENT_COOKIE) {
      document.cookie = cookie.serialize(name, '', finalOptions);
    }

    this._emitChange({ name, value: undefined, options });
  }

  public update = () => {
    if (!this.HAS_DOCUMENT_COOKIE) {
      return;
    }

    const previousCookies = this.cookies;
    this.cookies = cookie.parse(document.cookie);
    this._checkChanges(previousCookies);
  };

  public addChangeListener(callback: CookieChangeListener) {
    this.changeListeners.push(callback);

    if (this.HAS_DOCUMENT_COOKIE && this.changeListeners.length === 1) {
      if (typeof window === 'object' && 'cookieStore' in window) {
        (window.cookieStore as any).addEventListener('change', this.update);
      } else {
        this._startPolling();
      }
    }
  }

  public removeChangeListener(callback: CookieChangeListener) {
    const idx = this.changeListeners.indexOf(callback);
    if (idx >= 0) {
      this.changeListeners.splice(idx, 1);
    }

    if (this.HAS_DOCUMENT_COOKIE && this.changeListeners.length === 0) {
      if (typeof window === 'object' && 'cookieStore' in window) {
        (window.cookieStore as any).removeEventListener('change', this.update);
      } else {
        this._stopPolling();
      }
    }
  }

  public removeAllChangeListeners() {
    while (this.changeListeners.length > 0) {
      this.removeChangeListener(this.changeListeners[0]);
    }
  }
}
