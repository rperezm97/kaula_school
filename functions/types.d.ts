declare type PagesFunction<Env = Record<string, unknown>> = (context: {
  request: Request;
  env: Env;
  params: Record<string, string>;
  data: unknown;
  functionPath: string;
  waitUntil(promise: Promise<unknown>): void;
  next(input?: Request | string): Promise<Response>;
}) => Response | Promise<Response>;
