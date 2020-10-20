import { AnyPointer } from 'clownface';
// import { addAll } from 'rdf-dataset-ext';
import { NamedNode } from 'rdf-js';
import { Article } from '../../components/article/article';
import { CONTENT_IDENTIFIER_DOI } from '../../components/article/article-content';
import config from '../../config';
import routes from '../../config/routes';
import { AppContext } from '../../server/context';
import { createNamedNode } from '../../server/data-factory';
import getDb from '../../server/db';
import { escapeHtml, getArticleIdentifier } from '../../utils';
import { hydra, rdf, schema } from '../namespaces';

const { ARTICLES } = config.db.collections;

export const articlesHandler = async (graph: AnyPointer<NamedNode, any>, ctx: AppContext): Promise<void> => {
  graph.addOut(rdf.type, schema.WebAPI);
  graph.addOut(schema('name'), ctx.dataFactory.literal('Article Hosting RDF Graph: List Articles', config.rdf.Language));

  const db = await getDb();
  const articles: Array<Article> = await db.collection(ARTICLES).find({}).toArray();

  for (const article of articles) {
    graph.addOut(schema(article.type), (articleNode) => {
      const doi = getArticleIdentifier(CONTENT_IDENTIFIER_DOI, article);
      if (doi) {
        const [publisherId, id] = doi.split(config.articleDoiSeparator);
        articleNode.addOut(hydra.member, doi);
        articleNode.addOut(hydra.Link,
          createNamedNode(ctx.router, ctx.request, routes.rdf.ArticleDetails, { publisherId, id }),
          (articleRdfNode) => {
            articleRdfNode.addOut(hydra.title, `Article ${doi} Details RDF Node`);
          });
        articleNode.addOut(hydra.Link,
          createNamedNode(ctx.router, ctx.request, routes.rdf.ArticleFiles, { publisherId, id }),
          (articleFilesRdfNode) => {
            articleFilesRdfNode.addOut(hydra.title, `Article ${doi} Files RDF Node`);
          });
        articleNode.addOut(hydra.Link,
          createNamedNode(ctx.router, ctx.request, routes.pages.ArticleView, { publisherId, id }),
          (articlePageNode) => {
            articlePageNode.addOut(hydra.title, `Article ${doi} Details HTML Page`);
          });
      }
      articleNode.addOut(schema('title'), escapeHtml(article.title));
    });
  }

  graph.addOut(hydra.manages, (managesNode) => {
    managesNode.addOut(hydra.property, rdf.type)
      .addOut(hydra.object, schema.Article);
  });
};

export default articlesHandler;
