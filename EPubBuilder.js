/* global zip, Handlebars, RSVP */

(function(window,undefined){
	"use strict";
	/*
	new Book({
		title:title,
		author:author,
		text: @ Array of Chapter Texts
	},function(book){ @callback });
	*/

	// TODO: Validate all input.
	// TODO: Add quick-book functionality.
	// TODO: Use object instead of index to addChapter method.
	// TODO: Use JS Promises instead of callbacks.
	// TODO: Add node-style callbacks
	// TODO: Define Hidden Class beforehand

	var Promise = window.Promise || RSVP.Promise;

	var handleError = function(error){
		console.log(error);
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
		// TODO: Add Error callback to Filesystem API.
		var fs = new zip.fs.FS();

		var meta = fs.root.addDirectory("META-INF");
		var book = fs.root.addDirectory("OEBPS");

		self.book = book;

		fs.root.addText("mimetype","application/epub+zip");

		meta.addText("container.xml",Book.templates.container());

		book.addText("title_page.xhtml",Book.templates.title_page({
			title:self.title,
			author:self.author
		}));

		book.addText("style.css",Book.templates.style());

		self.book.chaptersAdded = 1;
		self._zip = fs;
	};
	var finishBook = function(){
		var chapterIndexArray = [];
		for (var i = 1; i <= this.book.chaptersAdded; i++) {
			chapterIndexArray.push(i);
		}
		var blobData = Book.templates.content({
			title:this.title,
			author:this.author,
			chapters:chapterIndexArray,
			lang:this.language,
			// UUID Random Generator.
			uuid:"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c==="x"?r:r&0x3|0x8;return v.toString(16);})
		});

		var file = this.book.getChildByName("content.opf");

		if(!!file){
			file.data = blobData;
		} else {
			this.book.addText("content.opf",blobData);
		}
	};

	Handlebars.registerHelper("html",function(html){
		return new Handlebars.SafeString(html);
	});

	var Book = function(){
		var self = this;

		if(!(self instanceof Book)){
			throw new Error("Book(): Function must be a new instance.");
		}

		if(Object.prototype.toString.call(arguments[0]) === "[object Object]"){
			
			self.title = arguments[0].title || "";
			self.author = arguments[0].author || "";

			if("language" in arguments[0]){
				// TODO: Add a more advanced check.
				if(/[a-z][a-z]-[A-Z][A-Z]/g.test(arguments[0].language)){
					self.language = arguments[0].language;
				} else {
					throw new Error("Book(): The language parameter must comply with RFC 3066 ex:en-US.");
				}
			} else {
				self.language = "en-US";
			}
		} else {
			throw new Error("Book(): First Argument must be an Object of Settings.");
		}

		self._queue = Promise.resolve();
		//self._queue.defer(loadTemplates);
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
		addChapter:function(a,b){
			// a -> index b -> chapterText
			var self = this, args = arguments;

			var _addChapter = function(){
				var index,chapterText;

				if(args.length === 2){
					index = (!isNaN(parseFloat(a)) && isFinite(a))?(a):(self.book.chaptersAdded);
					chapterText = b.toString();
				} else {
					chapterText = a.toString();
					index = self.book.chaptersAdded;
				}

				chapterText = Book.templates.chapter({text:chapterText,index:index});
				// Basic XML Parser.
				if(!!Book.config.validateXML){
					if(new DOMParser().parseFromString(chapterText, "application/xhtml+xml").getElementsByTagName("parsererror").length > 0){
						throw new Error("Book(): Invalid XHTML in chapter " + index);
					}
				}

				self.book.addText("chap" + index + ".xhtml",chapterText);

				// For content.opf file creation.
				self.book.chaptersAdded++;
			};

			self._queue = self._queue.then(_addChapter);
		},
		addChapters:function(chapters){
			for (var i = 0; i < chapters.length; i++) {
				this.addChapter(chapters[i]);
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