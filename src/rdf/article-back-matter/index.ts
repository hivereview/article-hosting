import { AnyPointer } from 'clownface';
import { BAD_REQUEST, NOT_FOUND } from 'http-status-codes';
import { NamedNode } from 'rdf-js';
import { Article } from '../../components/article/article';
import {
  addDateNode,
  addRdfAboutContext,
  addRdfArticleList,
  addRdfAuthorsContext,
  addRdfHeaderNodes,
} from '../../components/article/article-rdf';
import config from '../../config';
import { AppContext } from '../../server/context';
import getDb from '../../server/db';
import RdfError from '../../server/rdf-error';
import { articleDoi, stringify } from '../../utils';
import { stencila } from '../namespaces';

export interface ArticleBackMatterParams {
  publisherId?: string,
  id?: string,
}

export const articleBackMatterHandler = async (
  graph: AnyPointer<NamedNode, any>,
  ctx: AppContext,
  params: ArticleBackMatterParams,
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

  const article = <Article>(
    await db.collection(config.db.collections.ARTICLES)
      .findOne({ _id: articleDoi(publisherId, id) })
  );

  if (!article) {
    throw new RdfError('Article not found', NOT_FOUND);
  }

  addRdfHeaderNodes(graph, 'Article Back Matter RDF Endpoint', 'ArticleBackMatter');

  graph.addOut(stencila.title, stringify(article.title));

  addRdfAboutContext(graph, article.about);
  addRdfAuthorsContext(graph, article.authors);

  addDateNode(graph, stencila.datePublished, article.datePublished);
  addDateNode(graph, stencila.dateAccepted, article.dateAccepted);
  addDateNode(graph, stencila.dateReceived, article.dateReceived);

  for (const identifier of article.identifiers) {
    graph.addOut(stencila.identifiers, (identifierNode) => {
      identifierNode.addOut(stencila.type, identifier.type);
      identifierNode.addOut(stencila('name'), identifier.name);
      identifierNode.addOut(stencila.propertyID, identifier.propertyID);
      identifierNode.addOut(stencila.value, identifier.value);
    });
  }

  addRdfArticleList(graph, stencila.keywords, article.keywords);

  for (const license of article.licenses) {
    graph.addOut(stencila.licenses, (licenseNode) => {
      licenseNode.addOut(stencila.type, license.type);
      licenseNode.addOut(stencila.url, license.url);
      // todo parse license content
    });
  }

  for (const reference of article.references) {
    graph.addOut(stencila.references, (referenceNode) => {
      referenceNode.addOut(stencila.type, reference.type);
      referenceNode.addOut(stencila.id, reference.id);

      referenceNode.addOut(stencila.isPartOf, (isPartOfNode) => {
        isPartOfNode.addOut(stencila.type, article.isPartOf.type);

        if (article.isPartOf && article.isPartOf.volumeNumber) {
          isPartOfNode.addOut(stencila.volumeNumber, article.isPartOf.volumeNumber);
        }

        // todo check nested isPartOf rendering
        if (article.isPartOf.isPartOf) {
          isPartOfNode.addOut(stencila.isPartOf, (isPartOfIsPartOfNode) => {
            if (article.isPartOf.isPartOf) {
              isPartOfIsPartOfNode.addOut(stencila.type, article.isPartOf.isPartOf.type);

              if (article.isPartOf.isPartOf.name) {
                isPartOfIsPartOfNode.addOut(stencila('name'), article.isPartOf.isPartOf.name);
              }
            }
          });
        }
      });

      if (reference.pageStart) {
        referenceNode.addOut(stencila.pageStart, reference.pageStart);
      }
      if (reference.pageEnd) {
        referenceNode.addOut(stencila.pageEnd, reference.pageEnd);
      }
      if (reference.title) {
        referenceNode.addOut(stencila.title, reference.title);
      }

      addRdfAuthorsContext(referenceNode, reference.authors);
      addDateNode(referenceNode, stencila.datePublished, reference.datePublished);
    });
  }
};

export default articleBackMatterHandler;
