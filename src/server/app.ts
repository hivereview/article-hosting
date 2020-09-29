import Router from '@koa/router';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import serve from 'koa-static';
import ping from './ping';
import renderApiResponse from './render-api-response';
import renderPage from './render-page';
import apiRoutes from '../api/routes';
import config from '../config';
import pageRoutes from '../pages/routes';
// import rdfRoutes from '../rdf/routes';
import dataFactory from '../rdf/data-factory';
import setDataFactory from '../rdf/middleware/data-factory';
import addDatasets from '../rdf/middleware/dataset';
import jsonld from '../rdf/middleware/jsonld';
import namespaces from '../rdf/namespaces';
import Routes from '../rdf/routes-enum';
import entryPointRdf from '../rdf/routes/entry-point';
import { AppServiceContext, AppState } from '../rdf/types/context';

const app = new Koa<AppState, AppServiceContext>();
const router = new Router<AppState, AppServiceContext>();

app.context.router = router;

// @todo: check rest of routes to not be affected by rdf configs
router.get('/ping', ping());
pageRoutes.forEach((route) => router[route.method](route.path, renderPage(route.handler)));
apiRoutes.forEach((route) => router[route.method](route.path, renderApiResponse(route.handler)));

router.get(Routes.EntryPoint, config.rdf.routePrefix, entryPointRdf());
app.use(setDataFactory(dataFactory));
app.use(addDatasets());
app.use(jsonld({
  '@language': config.rdf.Language,
  ...namespaces,
}));

app
  .use(bodyParser({
    enableTypes: ['json', 'xml'],
  }))
  .use(router.routes())
  .use(router.allowedMethods())
  .use(serve('./assets'));

export default app;
