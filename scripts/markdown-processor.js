const RemarkParse = require("remark-parse");
const RemarkStringify = require("remark-stringify");
const RemarkWikiLink = require("remark-wiki-link");
const unified = require("unified");

function allLinksHaveTitles() {
  const Compiler = this.Compiler;
  const visitors = Compiler.prototype.visitors;
  const original = visitors.link;

  visitors.link = function (linkNode) {
    return original.bind(this)({
      ...linkNode,
      title: linkNode.title || "",
    });
  };
}

const processor = unified()
  .use(RemarkParse, { commonmark: true, pedantic: true })
  .use(RemarkStringify, {
    bullet: "-",
    emphasis: "_",
    listItemIndent: "1",
    rule: "-",
    ruleSpaces: false,
  })
  .use(allLinksHaveTitles)
  .use(RemarkWikiLink);

module.exports = processor;
