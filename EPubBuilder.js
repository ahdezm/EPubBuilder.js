/* global zip, Handlebars, Promise, Args */

(function(window,undefined){
	"use strict";

	// TODO: Validate all input.
	// TODO: Add quick-book functionality.
	// TODO: Add node-style callbacks
	// TODO: Add EPub3 nav support
	// TODO: Add default css style
	// TODO: Use ePub Boilerplate: http://git.io/0Lj8rg
	// TODO: Create real documentation (Use epubcheck)
	// TODO: Add true error handling

	var handleError = function(error){
		console.log(error);
	};

	var extend = function(original, extended){
		// NOTE: Based on http://jsperf.com/object-extend/3
		var key;
		extended = extended || {};

		for(key in extended){
			if(extended.hasOwnProperty(key)){
				original[key] = extended[key];
			}
		}
		return original;
	};

	var range = function(start, end, step) {
		start = +start || 0;
		step = typeof step === "number" ? step : (+step || 1);

		if (end === null) {
			end = start;
			start = 0;
		}
		// use `Array(length)` so engines like Chakra and V8 avoid slower modes
		// http://youtu.be/XAqIpGU8ZZk#t=17m25s
		var index = -1,
		length = Math.max(0, Math.ceil((end - start) / (step || 1))),
		result = new Array(length);

		while (++index < length) {
			result[index] = start;
			start += step;
		}
		return result;
	};

	if("zip" in window){
		// Works with inline script instead of workers to minimize dependencies, this may change later.
		zip.useWebWorkers = true;
		zip.useWebWorkerBlobs = true;
	} else {
		throw new Error("Book(): zip.js is a dependency of EPubBuilder.js");
	}

	var createZip = function(){
		var self =  this;
		var fs = new zip.fs.FS();

		var meta = fs.root.addDirectory("META-INF");
		var book = fs.root.addDirectory("OEBPS");

		fs.root.addText("mimetype","application/epub+zip");

		meta.addText("container.xml",Book.templates.container());

		book.addText("title_page.xhtml",Book.templates.title_page({
			title:self.title,
			author:self.author
		}));

		book.addText("style.css",Book.templates.style());

		extend(book,self.book);
		self.book = book;
		self._zip = fs;
	};

	var finishBook = function(){
		var indexArray = range(1,this.book.chaptersAdded);

		var metaData = Book.templates.content({
			title:this.title,
			author:this.author,
			chapters:indexArray,
			lang:this.language,
			// UUID Random Generator.
			uuid:"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c==="x"?r:r&0x3|0x8;return v.toString(16);})
		});

		var file = this.book.getChildByName("content.opf");

		if(!!file){
			file.data = metaData;
		} else {
			this.book.addText("content.opf",metaData);
		}
	};

	var Book = function(){
		var self = this;

		if(!(self instanceof Book)){
			throw new Error("Book(): Function must be a new instance.");
		}

		var args = Args([
			{
				title: Args.STRING | Args.Required
			},
			{
				author: Args.STRING | Args.Required
			},
			{
				language: Args.STRING | Args.Optional,
				_check:function(lang){
					return /[a-z][a-z]-[A-Z][A-Z]/g.test(lang);
				},
				_default:"en-US"
			}
		],arguments);

		extend(self,args);

		self.book = {
			chaptersAdded:1
		};

		self._zip = {};

		self._queue = Promise.resolve();
		self._queue = self._queue.then(createZip.bind(self)).catch(handleError);
	};

	Book.prototype = {
		exportBlob:function(done){
			var self = this;
			self._queue = self._queue.then(finishBook.bind(self));
			
			self._queue = self._queue.then(function(){
				self._zip.root.exportBlob(function(blob){
					done(null,blob.slice(0,blob.size,"application/epub+zip"));
				},null,function(error){
					done(error);
				});
			});
			
			
		},
		addChapter:function(){
			// a -> index b -> chapterText
			var self = this;

			var args = Args([
				{
					text: Args.STRING | Args.Required
				},
				{
					index: Args.INT | Args.Optional,
					_default:self.book.chaptersAdded
				},
				{
					title: Args.STRING | Args.Optional
				}
			],arguments);

			var _addChapter = function(){

				var chapterText = Book.templates.chapter(args);

				// Basic XML Parser.
				if(!!Book.config.validateXML){
					if(new DOMParser().parseFromString(chapterText, "application/xhtml+xml").getElementsByTagName("parsererror").length > 0){
						throw new Error("Book(): Invalid XHTML in chapter " + args.index);
					}
				}

				self.book.addText("chap" + args.index + ".xhtml",chapterText);

				// For content.opf file creation.
				self.book.chaptersAdded++;
			};

			self._queue = self._queue.then(_addChapter);
		},
		addChapters:function(chapters){
			for (var i = chapters.length; i > 0; i--) {
				this.addChapter(chapters[i-1],i);
			}
		}
	};

	// TODO: Add a more advanced config function.
	Book.config = {};
	Book.templates = {};

	Book.config.templateJS = "templates.js";
	Book.config.templateCompile = ["content","chapter","title_page"];
	Book.config.validateXML = true;

	// To prevent changes to config.
	Object.preventExtensions(Book.config);

	Book.templates = window.Book.templates;
	window.Book = Book;

})(this);