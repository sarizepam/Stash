/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/accounts`; params?: Router.UnknownInputParams; } | { pathname: `/dashboard`; params?: Router.UnknownInputParams; } | { pathname: `/history`; params?: Router.UnknownInputParams; } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/login`; params?: Router.UnknownInputParams; } | { pathname: `/reports`; params?: Router.UnknownInputParams; } | { pathname: `/transaction`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/accounts`; params?: Router.UnknownOutputParams; } | { pathname: `/dashboard`; params?: Router.UnknownOutputParams; } | { pathname: `/history`; params?: Router.UnknownOutputParams; } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/login`; params?: Router.UnknownOutputParams; } | { pathname: `/reports`; params?: Router.UnknownOutputParams; } | { pathname: `/transaction`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; };
      href: Router.RelativePathString | Router.ExternalPathString | `/accounts${`?${string}` | `#${string}` | ''}` | `/dashboard${`?${string}` | `#${string}` | ''}` | `/history${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | `/login${`?${string}` | `#${string}` | ''}` | `/reports${`?${string}` | `#${string}` | ''}` | `/transaction${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString | Router.ExternalPathString | `/accounts` | `/dashboard` | `/history` | `/` | `/login` | `/reports` | `/transaction` | `/_sitemap`; params?: Router.UnknownInputParams; };
    }
  }
}
