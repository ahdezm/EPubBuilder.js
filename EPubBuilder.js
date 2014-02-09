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

	// TODO: Add queueClean method.
	// TODO: Validate all input.
	// TODO: Add quick-book functionality.
	// TODO: Use object instead of index to addChapter method.
	// TODO: Use JS Promises instead of callbacks.
	// TODO: Load templates.js before execute.
	// TODO: Add node-style callbacks

	var Promise = window.Promise || RSVP.Promise;

	if("zip" in window){
		// Works with inline script instead of workers to minimize dependencies, this may change later.
		zip.useWebWorkers = true;
		zip.useWebWorkerBlobs = true;
	} else {
		throw new Error("Book(): zip.js is a dependency of EPubBuilder.js");
	}

	var isStringArray = function(array){
		return array.filter(function(self){
			return(typeof(self) !== "string");
		}).length < 1;
	};

	var loadTemplates = function(done){
		if(Object.keys(Book.templates).length > 0){
			done(null);
			return;
		}

		var script = document.createElement("script");
		script.src = Book.config.templateJS;
		script.async = true;
		script.type = "text/javascript";
		document.body.appendChild(script);

		script.onload = function(){
			done();
		};
		script.onerror = function(){
			throw new Error("Book(): Template file could not be loaded correctly from path: " + Book.config.templateJS);
		};
	};

	var createZip = function(){
		var self =  this;
		// TODO: Add Error callback to Filesystem API.
		return new Promise(function(resolve){
			var fs = new zip.fs.FS();

			var meta = fs.root.addDirectory("META-INF");
			var book = fs.root.addDirectory("OEBPS");

			self.book = book;

			fs.root.addText("mimetype","application/epub+zip");

			meta.addBlob("container.xml",new Blob(["<?xml version=\"1.0\"?><container version=\"1.0\" xmlns=\"urn:oasis:names:tc:opendocument:xmlns:container\"><rootfiles><rootfile full-path=\"OEBPS/content.opf\" media-type=\"application/oebps-package+xml\"/></rootfiles></container>"],{type:"application/xml"}));

			book.addBlob("title_page.xhtml",new Blob([Book.templates.title_page({title:self.title,author:self.author})],{type:"application/xhtml+xml"}));
			book.addText("style.css",Book.templates.style());

			self.book.chaptersAdded = 1;
			self._zip = fs;

			resolve();
		});
	};
	var finishBook = function(){
		// TODO: This can only happen once or rewrite
		return new Promise((function(resolve,reject){
			var chapterIndexArray = [];
			for (var i = 1; i <= this.book.chaptersAdded; i++) {
				chapterIndexArray.push(i);
			}
			var blobData = new Blob([Book.templates.content({
				title:this.title,
				author:this.author,
				chapters:chapterIndexArray,
				lang:this.language,
				// UUID Random Generator.
				uuid:"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c==="x"?r:r&0x3|0x8;return v.toString(16);})
			})],{type:"application/oebps-package+xml"});

			var file = this.book.getChildByName("content.opf");

			if(!!file){
				file.data = blobData;
			} else {
				this.book.addBlob("content.opf",blobData);
			}

			resolve();
		}).bind(this));
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
		self._queue = self._queue.catch(function(){
			console.log("Fatal Error!!");
		});
		//self._queue.defer(loadTemplates);
		self._queue = self._queue.then(createZip.bind(self));
	};

	Book.prototype = {
		exportBlob:function(callback){
			var self = this;

			self._queue = self._queue.then(finishBook.bind(self));
			self._queue = self._queue.then(function(){
				return new Promise(function(resolve,reject){
					self._zip.root.exportBlob(function(blob){
						callback(blob.slice(0,blob.size,"application/epub+zip"));
					});
					resolve();
				});
			});
		},
		addChapter:function(a,b){
			// a -> index b -> chapterText
			var self = this, args = arguments;

			var _addChapter = (function(resolve,reject){
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
						reject(new Error("Book(): Invalid XHTML in chapter " + index));
					}
				}

				self.book.addBlob("chap" + index + ".xhtml",new Blob([chapterText],{type:"application/xhtml+xml"}));

				// For content.opf file creation.
				self.book.chaptersAdded++;
				
				resolve();
			}).bind(self);
			

			self._queue = self._queue.then(function(){
				return new Promise(_addChapter);
			});
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