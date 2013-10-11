(function(window,undefined){
	/*
	new Book({
		title:title,
		author:author,
		text: @ Array of Chapter Texts
	},function(book){ @callback });
	*/

	// Works with inline script instead of workers to minimize dependencies, this may change later.
	zip.useWebWorkers = false;

	// TODO: Check for zip.js support.
	// TODO: Add queueClean method.

	var isStringArray = function(array){
		return array.filter(function(self){
			return(typeof(self) !== 'string');
		}).length < 1;
	};

	var Queue = function(){
		var queue = [];
		var taskCallback = function(){
			queue.shift();
			if(queue.length > 0){
				queue[0](taskCallback);
			}
		};
		
		new ArrayObserver(queue,function(splices){
			if(queue.length > 0 && queue.length - splices[0].addedCount === 0){
				queue[0](taskCallback);
			}
		});
		
		return queue;
	};

	var loadTemplates = function(templates,exclude,done){
		if(Object.keys(Book.templates).length > 0){
			done();
			return;
		}

		exclude = exclude || [];
		var toLoad = templates.concat(exclude);

		function loadFile(file){
			var path = Book.config.templatePath + file;
			var xhr = new XMLHttpRequest();
			xhr.responseType = 'text';
			xhr.open("GET",path,true);
			xhr.send();

			xhr.onload = function(){
				if(this.status == '200'){
					var name = file.slice(0,(file.indexOf(".") > 0)?file.indexOf("."):file.length-1),
						template = false;
					if(!new RegExp(exclude.join('|')).test(file)){
						template = Handlebars.compile(this.response);
					}
					Book.templates[name] = template || this.response;
					
					// TODO: Check for objects instead of length.
					if(Object.keys(Book.templates).length === toLoad.length){
						done();
					}
				} else {
					var error = new Error("Book() loadTemplate: Could not load template from path ",path);
				}
			};
		}

		for (var i = toLoad.length - 1; i >= 0; i--) {
			loadFile(toLoad[i]);
		}
	};

	var createZip = function(callback){
		// TODO: Add Error callback to Filesystem API.
		var self =  this;
		var fs = new zip.fs.FS();

		var meta = fs.root.addDirectory("META-INF");
		var book = fs.root.addDirectory("OEBPS");

		self.book = book;

		fs.root.addText('mimetype','application/epub+zip');

		meta.addBlob('container.xml',new Blob(['<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'],{type:'application/xml'}));

		book.addBlob('content.opf',new Blob([Book.templates.content({
			title:self.title,
			author:self.author,
			chapters:self.chapters,
			lang:self.language,
			// UUID Random Generator.
			uuid:'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);})
		})],{type:"application/oebps-package+xml"}));

		book.addBlob("title_page.xhtml",new Blob([Book.templates.title_page({title:self.title,author:self.author})],{type:"application/xhtml+xml"}));
		book.addText("style.css",Book.templates.style);

		self._zip = fs;

		callback();
	};

	Handlebars.registerHelper("chapter",function(index){
		return parseInt(index,10) + 1;
	});

	Handlebars.registerHelper("html",function(html){
		return new Handlebars.SafeString(html);
	});

	var Book = function(){
		var self = this;

		if(!(self instanceof Book)){
			throw new Error("Book(): Function must be a new instance.");
		}

		if(Object.prototype.toString.call(arguments[0]) === "[object Object]"){
			try {
				self.title = arguments[0].title;
				self.author = arguments[0].author;
			} catch(e){}

			if('language' in arguments[0]){
				// TODO: Add a more advanced check.
				if(/[a-z][a-z]-[A-Z][A-Z]/g.test(arguments[0].language)){
					self.language = arguments[0].language;
				} else {
					throw new Error("Book(): The language parameter must comply with RFC 3066 ex:en-US.");
				}
			} else {
				self.language = 'en-US';
			}

			self.chapters = [];
			/*if('chapters' in arguments[0]){
				if(!isStringArray(arguments[0].chapters)){
					throw new Error("Book(): The Array must contain only strings.");
				}
				self.chapters = arguments[0].chapters;
			} else {
				throw new Error("Book(): To create a book the parameter chapters of is required.");
			}*/
		} else if(arguments[0] instanceof Array){
			if(!isStringArray(arguments[0])){
				throw new Error("Book(): The Array must contain only strings.");
			}
			self.chapters = arguments[0];
			self.title = self.author = '';

		} else {
			throw new Error("Book(): First Argument must be an Object of Settings or an Array of Chapters.");
		}

		/*if(typeof(arguments[1]) == 'function'){
			self._done = arguments[1];
		}*/

		self._queue = new Queue();
		// NOTE: Consider using an object instead of an array. 
		self._queue.push(loadTemplates.bind(self,['content.opf','chapter.xhtml','title_page.xhtml'],['style.css']));
		self._queue.push(createZip.bind(self));
	};

	Book.prototype = {
		exportBlob:function(callback){
			var self = this;
			self._queue.push(function(){
				self._zip.root.exportBlob(function(blob){
					callback(blob.slice(0,blob.size,'application/epub+zip'));
				});
			});
		},
		addChapter:function(chapterText){
			var self = this;
			var _addChapter = function(chapterText,callback){
				chapterText = Book.templates.chapter({text:chapterText,index:self.chapters.length});
				// Basic XML Parser.
				if(!!Book.config.validateXML){
					if(new DOMParser().parseFromString(chapterText, "application/xhtml+xml").getElementsByTagName("parsererror").length > 0){
						throw new Error("Book(): Invalid XHTML in chapters[" + self.chapters.length + "]");
					}
				}

				self.book.addBlob("chap" + self.chapters.length + ".xhtml",new Blob([chapterText],{type:"application/xhtml+xml"}));
				self.chapters.push(chapterText);

				callback();
			};

			self._queue.push(_addChapter.bind(self,chapterText));
		},
		addChapters:function(chapters){
			for (var i = 0; i < chapters.length; i++) {
				this.addChapter(chapters[i]);
			}
		},
		downloadBook:function(){
			var self = this;
			this._zip.root.exportBlob(function(blob){
				window.saveAs(blob,self.title + ' - ' + self.author + '.epub');
			});
		}
	};

	// TODO: Add a more advanced config function.
	Book.config = {};
	Book.templates = {};

	Book.config.templatePath = "templates/";
	Book.config.validateXML = true;

	window.Book = Book;

})(this);