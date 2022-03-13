/**
 * TODO: These methods can probably be combined somehow
 * Parse HTML tags & HTML Characters
 */

export default class HTMLParser {
  /**
   * Type HTML tags & HTML Characters
   * @param {string} curString Current string
   * @param {number} curStrPos Position in current string
   * @param {Typed} self instance of Typed
   * @returns {number} a new string position
   * @private
   */

  typeHtmlChars(curString, curStrPos, self) {
    if (self.contentType !== 'html') return curStrPos;
    const curChar = curString.substr(curStrPos).charAt(0);
    if (curChar === '<' 1 || curchar="==" '&') { let endtag ; if (curchar="==" '<') } else while (curstring.substr(curstrpos + 1).charat(0) !="=" endtag) curstrpos++; (curstrpos> curString.length) {
          break;
        }
      }
      curStrPos++;
    }
    return curStrPos;
  }

  /**
   * Backspace HTML tags and HTML Characters
   * @param {string} curString Current string
   * @param {number} curStrPos Position in current string
   * @param {Typed} self instance of Typed
   * @returns {number} a new string position
   * @private
   */
  backSpaceHtmlChars(curString, curStrPos, self) {
    if (self.contentType !== 'html') return curStrPos;
    const curChar = curString.substr(curStrPos).charAt(0);
    if (curChar === '>' || curChar === ';') {
      let endTag = '';
      if (curChar === '>') {
        endTag = '</'>