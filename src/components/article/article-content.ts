import {
  Article,
  ArticleContents,
  ImageObjectContent,
  TableCellContent,
  TableContent,
  TableRowContent,
} from './article';
import utils from '../../utils';

const { renderImageUrl } = utils;

export const CONTENT_HEADING = 'Heading';
export const CONTENT_PARAGRAPH = 'Paragraph';
export const CONTENT_STRONG = 'Strong';
export const CONTENT_CITE = 'Cite';
export const CONTENT_LINK = 'Link';
export const CONTENT_SUPERSCRIPT = 'Superscript';
export const CONTENT_EMPHASIS = 'Emphasis';
export const CONTENT_TABLE = 'Table';
export const CONTENT_TABLEROW = 'TableRow';
export const CONTENT_TABLECELL = 'TableCell';
export const CONTENT_FIGURE = 'Figure';
export const CONTENT_IMAGEOBJECT = 'ImageObject';

export const renderContentBlock = (content?: ArticleContents | string): string => {
  /* eslint-disable @typescript-eslint/no-use-before-define */
  if (!content) {
    return '';
  }
  if (typeof content === 'string') {
    return content;
  }

  switch (content.type) {
    case CONTENT_HEADING:
      return renderHeader(content);
    case CONTENT_PARAGRAPH:
      return renderParagraph(content);
    case CONTENT_STRONG:
      return renderStrong(content);
    case CONTENT_CITE:
      return renderCite(content);
    case CONTENT_LINK:
      return renderLink(content);
    case CONTENT_SUPERSCRIPT:
      return renderSuperscript(content);
    case CONTENT_EMPHASIS:
      return renderEmphasis(content);
    case CONTENT_TABLE:
      return renderTable(content as TableContent);
    case CONTENT_FIGURE:
      return renderFigure(content);
    case CONTENT_IMAGEOBJECT:
      return renderImageObject(content as ImageObjectContent);
    default:
      return '';
  }
};

export const renderContentArray = (content?: ArticleContents): string =>
  `${content?.content?.map((c) => renderContentBlock(c)).join('') ?? ''}`;

export const renderTableRow = (content?: TableRowContent): string =>
  `<tr>${content?.cells?.map((c) => renderTableCell(c, !!content?.rowType)).join('') ?? ''}</tr>`;

export const renderTableCell = (content: TableCellContent, isHeader?: boolean): string =>
  `<t${isHeader ? 'h' : 'd'} align='left'${content.rowSpan ? ` rowspan='${content.rowSpan}'` : ''}${content.colSpan ? ` colspan='${content.colSpan}'` : ''}>${renderContentArray(content)}</t${isHeader ? 'h' : 'd'}>`;

export const renderHeader = (content: ArticleContents): string =>
  `<h${content.depth ?? 1}${content.id ? ` id="${content.id}"` : ''} class="ui header">${renderContentArray(content)}</h${content.depth ?? 1}>`;

export const renderParagraph = (content: ArticleContents): string =>
  `<p>${renderContentArray(content)}</p>`;

export const renderStrong = (content: ArticleContents): string =>
  `<b>${renderContentArray(content)}</b>`;

export const renderCite = (content: ArticleContents): string =>
  `<a href="#${content?.target ?? ''}">${renderContentArray(content)}</a>`;

export const articleContent = (article: Article): string =>
  `<div class="ui container left aligned">
    ${article.content.map((contentBlock) => renderContentBlock(contentBlock)).join('')}
  </div>`;

export const renderLink = (content: ArticleContents): string =>
  `<a href="${content?.target ?? '#'}">${renderContentArray(content)}</a>`;

export const renderSuperscript = (content: ArticleContents): string =>
  `<sup>${renderContentArray(content)}</sup>`;

export const renderEmphasis = (content: ArticleContents): string =>
  `<i>${renderContentArray(content)}</i>`;

export const renderTable = (content: TableContent): string =>
  `<div${content.id ? ` id="${content.id}"` : ''}>
    <span>${content.label}</span>${content.caption.map((c) => renderContentBlock(c)).join('')}
     <table class="ui celled structured table">
       <thead>${content.rows.map((row) => ((row.rowType && row.rowType === 'header') ? renderTableRow(row) : '')).join('')}</thead>
       <tbody>${content.rows.map((row) => ((!row.rowType || (row.rowType && row.rowType !== 'header')) ? renderTableRow(row) : '')).join('')}</tbody>
    </table>
  </div>
  `;

export const renderFigure = (content: ArticleContents): string =>
  `<div${content.id ? ` id="${content.id}"` : ''}>
    <div>
      <div><span>${content.label ?? ''}</span></div>
    </div>
    <figure>
      ${renderContentArray(content)}
      <figcaption>${content.caption?.map((c) => renderContentBlock(c)).join('') ?? ''}</figcaption>
    </figure>
  </div>
`;

export const renderImageObject = (content: ImageObjectContent): string => {
  const { contentUrl } = content;

  if (contentUrl) {
    return `<a href="${renderImageUrl(contentUrl, { width: 1500 })}" class="ui image">
      <picture>
        <source srcset="${renderImageUrl(contentUrl, { width: 1234 })} 2x, ${renderImageUrl(contentUrl, { width: 617 })} 1x" type="image/jpeg">
        <img src="${renderImageUrl(contentUrl, { width: 1200 })}">
      </picture>
    </a>`;
  }

  return '';
};

export default articleContent;
