this["Book"] = this["Book"] || {};this["Book"]["templates"] = this["Book"]["templates"] || {};this["Book"]["templates"]["chapter"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, options, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;


  buffer += "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\r\n<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.1//EN\" \"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd\">\r\n<html xmlns=\"http://www.w3.org/1999/xhtml\">\r\n<head>\r\n	<title>Chapter ";
  if (stack1 = helpers.index) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.index); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</title>\r\n	<link rel=\"stylesheet\" href=\"style.css\" type=\"text/css\" />\r\n</head>\r\n\r\n<body>\r\n\r\n	<div id=\"chapter\">\r\n		<h3 class=\"title\">Chapter ";
  if (stack1 = helpers.index) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.index); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</h3>\r\n		";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.html || (depth0 && depth0.html)),stack1 ? stack1.call(depth0, (depth0 && depth0.text), options) : helperMissing.call(depth0, "html", (depth0 && depth0.text), options)))
    + "\r\n	</div>\r\n</body>\r\n</html>\r\n";
  return buffer;
  });
this["Book"] = this["Book"] || {};this["Book"]["templates"] = this["Book"]["templates"] || {};this["Book"]["templates"]["container"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<container version=\"1.0\" xmlns=\"urn:oasis:names:tc:opendocument:xmlns:container\">\n	<rootfiles><rootfile full-path=\"OEBPS/content.opf\" media-type=\"application/oebps-package+xml\"/></rootfiles>\n</container>";
  });
this["Book"] = this["Book"] || {};this["Book"]["templates"] = this["Book"]["templates"] || {};this["Book"]["templates"]["content"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "";
  buffer += "\n		<item id=\"chapter"
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\" href=\"chap"
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + ".xhtml\" media-type=\"application/xhtml+xml\" />\n		";
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = "";
  buffer += "\n		<itemref idref=\"chapter"
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\"/>\n		";
  return buffer;
  }

  buffer += "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<package xmlns=\"http://www.idpf.org/2007/opf\" unique-identifier=\"BookID\" version=\"2.0\" >\n	<metadata xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:opf=\"http://www.idpf.org/2007/opf\">\n		<dc:title>";
  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.title); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</dc:title> \n		<dc:creator opf:role=\"aut\">";
  if (stack1 = helpers.author) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.author); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</dc:creator>\n		<dc:language>";
  if (stack1 = helpers.lang) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.lang); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</dc:language> \n		<dc:rights>Public Domain</dc:rights> \n		<dc:publisher>EPubBuilder.js</dc:publisher> \n		<dc:identifier id=\"BookID\" opf:scheme=\"UUID\">";
  if (stack1 = helpers.uuid) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.uuid); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</dc:identifier>\n	</metadata>\n	<manifest>\n		<item id=\"style\" href=\"style.css\" media-type=\"text/css\" />\n		<item id=\"titlepage\" href=\"title_page.xhtml\" media-type=\"application/xhtml+xml\" />\n		";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.chapters), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n	</manifest>\n	<spine toc=\"ncx\">\n		<itemref idref=\"titlepage\"/>\n		";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.chapters), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n	</spine>\n</package>";
  return buffer;
  });
this["Book"] = this["Book"] || {};this["Book"]["templates"] = this["Book"]["templates"] || {};this["Book"]["templates"]["style"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "#book .title, #book .author {\n	text-align:center;\n	font-family: Arial, \"Helvetica Neue\", Helvetica, sans-serif;\n}\n\n#chapter {\n	margin: 2em;\n}\n\n#chapter .title {\n	text-align: center;\n}";
  });
this["Book"] = this["Book"] || {};this["Book"]["templates"] = this["Book"]["templates"] || {};this["Book"]["templates"]["title_page"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\r\n<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.1//EN\" \"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd\">\r\n<html xmlns=\"http://www.w3.org/1999/xhtml\">\r\n<head>\r\n	<title>Title Page</title>\r\n	<link rel=\"stylesheet\" href=\"style.css\" type=\"text/css\" />\r\n</head>\r\n<body>\r\n	<div id=\"book\">\r\n		<p>&nbsp;</p>\r\n		<h2 class=\"title\">";
  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.title); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</h2>\r\n		<p>&nbsp;</p>\r\n		<h3 class=\"author\">";
  if (stack1 = helpers.author) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.author); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</h3>\r\n	</div>\r\n</body>\r\n</html>\r\n";
  return buffer;
  });
this["Book"] = this["Book"] || {};this["Book"]["templates"] = this["Book"]["templates"] || {};this["Book"]["templates"]["toc"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<!DOCTYPE ncx PUBLIC \"-//NISO//DTD ncx 2005-1//EN\"\n   \"http://www.daisy.org/z3986/2005/ncx-2005-1.dtd\">\n\n<ncx xmlns=\"http://www.daisy.org/z3986/2005/ncx/\" version=\"2005-1\">\n    <head>\n        <meta name=\"dtb:uid\" content=\"015ffaec-9340-42f8-b163-a0c5ab7d0611\"/>\n        <meta name=\"dtb:depth\" content=\"2\"/>\n        <meta name=\"dtb:totalPageCount\" content=\"0\"/>\n        <meta name=\"dtb:maxPageNumber\" content=\"0\"/>\n    </head>\n    <docTitle>\n        <text>Sample .epub eBook</text>\n    </docTitle>\n    <navMap>\n        <navPoint id=\"navPoint-1\" playOrder=\"1\">\n            <navLabel>\n                <text>Sample Book</text>\n            </navLabel>\n            <content src=\"Text/title_page.xhtml\"/>\n        </navPoint>\n        <navPoint id=\"navPoint-2\" playOrder=\"2\">\n            <navLabel>\n                <text>A Sample .epub Book</text>\n            </navLabel>\n            <content src=\"Text/title_page.xhtml#heading_id_3\"/>\n            <navPoint id=\"navPoint-3\" playOrder=\"3\">\n                <navLabel>\n                    <text>Title Page</text>\n                </navLabel>\n                <content src=\"Text/title_page.xhtml#heading_id_4\"/>\n            </navPoint>\n            <navPoint id=\"navPoint-4\" playOrder=\"4\">\n                <navLabel>\n                    <text>Chapter 1</text>\n                </navLabel>\n                <content src=\"Text/chap01.xhtml\"/>\n            </navPoint>\n            <navPoint id=\"navPoint-5\" playOrder=\"5\">\n                <navLabel>\n                    <text>Chapter 2</text>\n                </navLabel>\n                <content src=\"Text/chap02.xhtml\"/>\n            </navPoint>\n        </navPoint>\n    </navMap>\n</ncx>\n";
  });