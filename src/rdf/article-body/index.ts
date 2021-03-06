import { AnyPointer } from 'clownface';
import { BAD_REQUEST, NOT_FOUND } from 'http-status-codes';
import { NamedNode } from 'rdf-js';
import { ArticleContents } from '../../components/article/article';
import { addRdfContentBlock, addRdfHeaderNodes } from '../../components/article/article-rdf';
import config from '../../config';
import { AppContext } from '../../server/context';
import getDb from '../../server/db';
import RdfError from '../../server/rdf-error';
import { articleDoi, stringify } from '../../utils';
import { stencila } from '../namespaces';

export interface ArticleBodyParams {
  publisherId?: string,
  id?: string,
}

export const ArticleBodyHandler = async (
  graph: AnyPointer<NamedNode, any>,
  ctx: AppContext,
  params: ArticleBodyParams,
): Promise<void> => {
  if (!params) {
    throw new RdfError('Missing endpoint params', BAD_REQUEST);
  }

  const { publisherId, id } = params;

  if (!publisherId) {
    throw new RdfError('Missing mandatory field "publisherId"', BAD_REQUEST);
  }

  if (!id) {
    throw new RdfError('Missing mandatory field "id"', BAD_REQUEST);
  }

  const db = await getDb();

  const a = await db.collection(config.db.collections.ARTICLES).findOne({ _id: articleDoi(publisherId, id) });

  if (!a) {
    throw new RdfError('Article not found', NOT_FOUND);
  }

  addRdfHeaderNodes(graph, 'Article Content RDF Endpoint', 'ArticleBody');

  graph.addOut(stencila.title, stringify(a.title));
  a.content.forEach((content: ArticleContents) => addRdfContentBlock(graph, content, a));
  graph.addOut(stencila.description, stringify(a.description));
};

export default ArticleBodyHandler;
