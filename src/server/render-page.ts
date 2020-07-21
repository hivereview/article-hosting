import { Middleware, RouterContext } from '@koa/router';
import { NOT_FOUND, OK } from 'http-status-codes';
import { Next } from 'koa';
import { Result } from 'true-myth';

type RenderPageError = {
  type: 'not-found',
  content: string
};

export type RenderPage = (ctx?: RouterContext) => Promise<string | Result<string, RenderPageError>>;

export default (
  renderPage: RenderPage,
): Middleware => (
  async (ctx: RouterContext, next: Next): Promise<void> => {
    try {
      const params = {
        ...ctx.params,
        ...ctx.query,
      };
      ctx.response.type = 'html';

      const page = await renderPage(params);

      if (typeof page === 'string') {
        ctx.response.status = OK;
        ctx.response.body = page;
      } else {
        ctx.response.status = page.isOk() ? OK : NOT_FOUND;
        ctx.response.body = page.unwrapOrElse((error) => error.content as string);
      }

      await next();
    } catch (e) {
      console.log(e);
    }
  }
);