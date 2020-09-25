import { Readable } from 'stream';
import { BAD_REQUEST, NOT_FOUND } from 'http-status-codes';
import { Db } from 'mongodb';
import { mocked } from 'ts-jest';
import article from '../../../src/__fixtures__/article';
import citationHandler, { CitationRouterContext } from '../../../src/api/citation';
import ApiError from '../../../src/server/error';
import { getArticleIdentifier } from '../../../src/utils';

// eslint-disable-next-line import/first, import/order
import db from '../../../src/server/db';

const mockedFindOne = jest.fn(() => article);
jest.mock('../../../src/server/db');

const mockedDb = mocked(db);

describe('create bib and ris file', () => {
  it('should throw error when params are missing', async () => {
    const error = new ApiError('Missing endpoint params', BAD_REQUEST);

    await expect(citationHandler()).rejects.toStrictEqual(error);
  });

  it('should throw error when doi is missing', async () => {
    const params = <CitationRouterContext>{ file: 'bib' };
    const error = new ApiError('Missing mandatory field "DOI"', BAD_REQUEST);

    await expect(citationHandler(params)).rejects.toStrictEqual(error);
  });

  it('should throw error when file is missing', async () => {
    const params = <CitationRouterContext>{ doi: getArticleIdentifier('doi', article) };
    const error = new ApiError('Missing mandatory field "file"', BAD_REQUEST);

    await expect(citationHandler(params)).rejects.toStrictEqual(error);
  });

  it('should create BIB readable', async () => {
    const params = <CitationRouterContext>{ doi: 'doi', file: '.bib' };

    mockedDb.mockResolvedValueOnce(<Db><unknown>{
      collection: jest.fn(() => ({
        findOne: mockedFindOne,
      })),
    });
    const result = await citationHandler(params);

    expect(result).toBeInstanceOf(Readable);
  });

  it('should create RIS readable', async () => {
    const params = <CitationRouterContext>{ doi: 'doi', file: '.ris' };

    mockedDb.mockResolvedValueOnce(<Db><unknown>{
      collection: jest.fn(() => ({
        findOne: mockedFindOne,
      })),
    });
    const result = await citationHandler(params);

    expect(result).toBeInstanceOf(Readable);
  });

  it('should return error when article is missing', async () => {
    const params = <CitationRouterContext>{ doi: 'doi', file: 'ris' };

    mockedDb.mockResolvedValueOnce(<Db><unknown>{
      collection: jest.fn(() => ({
        findOne: jest.fn(),
      })),
    });
    const error = new ApiError('Article not found', NOT_FOUND);

    await expect(citationHandler(params)).rejects.toStrictEqual(error);
  });

  it('should return error when file type is missing', async () => {
    const params = <CitationRouterContext>{ doi: 'doi', file: 'ris' };

    mockedDb.mockResolvedValueOnce(<Db><unknown>{
      collection: jest.fn(() => ({
        findOne: mockedFindOne,
      })),
    });
    const error = new ApiError('File not found', NOT_FOUND);

    await expect(citationHandler(params)).rejects.toStrictEqual(error);
  });

  it('should return empty string when article is missing issueNumber', async () => {
    const params = <CitationRouterContext>{ doi: 'doi', file: '.ris' };
    const isPartOf = {
      type: 'PublicationIssue',
      isPartOf: {
        type: 'PublicationVolume',
        isPartOf: {
          type: 'Periodical',
          title: 'Testing Journal of Microsimulation',
        },
      },
    };

    mockedDb.mockResolvedValueOnce(<Db><unknown>{
      collection: jest.fn(() => ({
        findOne: jest.fn(() => ({
          ...article,
          isPartOf,
        })),
      })),
    });

    const result = await citationHandler(params);

    expect(result).toBeInstanceOf(Readable);
  });
});
