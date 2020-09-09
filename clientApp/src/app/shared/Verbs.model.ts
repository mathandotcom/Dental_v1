export enum Verbs {
    GET = 'GET',
    PUT = 'PUT',
    POST = 'POST',
    DELETE = 'DELETE'
  }

  export class HttpOptions {
    url: string;
    body?: any;
    cacheMins?: number;
    headers?: any;
}
