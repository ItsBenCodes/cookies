import { Cookie as UniversalCookies } from 'universal-cookie';
import { Request } from 'express';

export interface AppRequest extends Request {
  universalCookies: UniversalCookies;
}

export interface CookieValues {
  name?: string;
  cookieConsent?: 'accepted' | 'declined';
  [key: string]: any;
}
