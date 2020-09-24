import {
  Article, ArticleContents, ImageObjectContent, TableCellContent, TableContent, TableRowContent,
} from './article';
import { Context, renderImageObject } from './article-content';
import articleSidebar from './sidebar';

export const CONTENT_TABLE = 'Table';
export const CONTENT_FIGURE = 'Figure';
export const CONTENT_IMAGEOBJECT = 'ImageObject';

export const renderContentBlock = (content?: ArticleContents | string, context?: Context): string => {
  /* eslint-disable @typescript-eslint/no-use-before-define */
  if (!content) {
    return '';
  }
  if (typeof content === 'string') {
    return content;
  }

  switch (content.type) {
    case CONTENT_TABLE:
      return renderTable(<TableContent>content, context);
    case CONTENT_FIGURE:
      return renderImages(content, context);
    case CONTENT_IMAGEOBJECT:
      return renderImageObject(<ImageObjectContent>content, context);
    default:
      return '';
  }
};

export const renderContentArray = (content?: ArticleContents, context?: Context): string =>
  `${content?.content?.map((c) => renderContentBlock(c, context)).join('') ?? ''}`;

export const renderTableRow = (content?: TableRowContent, context?: Context): string =>
  `<tr>${content?.cells?.map((c) => renderTableCell(c, !!content?.rowType, context)).join('') ?? ''}</tr>`;

export const renderTableCell = (content: TableCellContent, isHeader?: boolean, context?: Context): string =>
  `<t${isHeader ? 'h' : 'd'} align='left'${content.rowSpan ? ` rowspan='${content.rowSpan}'` : ''}${content.colSpan ? ` colspan='${content.colSpan}'` : ''}>${renderContentArray(content, context)}</t${isHeader ? 'h' : 'd'}>`;

export const renderTable = (content: TableContent, context?: Context): string =>
  `<div${content.id ? ` id="${content.id}"` : ''}>
    <span>${content.label}</span>${content.caption.map((c) => renderContentBlock(c, context)).join('')}
     <table class="ui celled structured table">
       <thead>${content.rows.map((row) => ((row.rowType && row.rowType === 'header') ? renderTableRow(row, context) : '')).join('')}</thead>
       <tbody>${content.rows.map((row) => ((!row.rowType || (row.rowType && row.rowType !== 'header')) ? renderTableRow(row, context) : '')).join('')}</tbody>
    </table>
  </div>
  `;

export const renderImages = (content: ArticleContents, context?: Context): string =>
  `<div${content.id ? ` id="${content.id}"` : ''}>
    <div>
      <div><span>${content.label ?? ''}</span></div>
    </div>
    <figure>
      ${renderContentArray(content, context)}
      <figcaption>${content.caption?.map((c) => renderContentBlock(c, context)).join('') ?? ''}</figcaption>
    </figure>
  </div>`;

export const renderArticleFiguresContent = (article: Article): string => {
  const renderContent = (type: string): string => `${article.content.filter((c) => c.type === type).map((contentBlock) => renderContentBlock(contentBlock, { article })).join('')}`;

  return `<div class="ui ignored hidden divider"></div><div class="ui grid">
    ${articleSidebar(article)}
    <div class="thirteen wide column">
    <h1>Figures.</h1>
    ${renderContent(CONTENT_FIGURE)}
    <h1>Tables.</h1>
    ${renderContent(CONTENT_TABLE)}
    </div>
  </div>`;
};

export default renderArticleFiguresContent;