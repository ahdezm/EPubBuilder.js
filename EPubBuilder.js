(function(window,undefined){
	/*
	new Book({
		title:title,
		author:author,
		text: @ Array of Chapter Texts
	},function(book){ @callback });
	*/

	// TODO: Add queueClean method.
	// TODO: Add quick-book functionality.
	// TODO: Add object instead of index to addChapter method.

	if('zip' in window){
		// Works with inline script instead of workers to minimize dependencies, this may change later.
		zip.useWebWorkers = false;
	} else {
		throw new Error("Book(): zip.js is a dependency of EPubBuilder.js");
	}

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

	var loadTemplates = function(done){
		if(Object.keys(Book.templates).length > 0){
			done();
			return;
		}

		var xhr = new XMLHttpRequest();
		xhr.responseType = 'text';
		xhr.open("GET",Book.config.templateJSON,true);
		xhr.send();

		xhr.onload = function(){
			if(this.status == '200'){
				try {
					Book.templates = JSON.parse(this.response);
				} catch(e){
					throw new Error("Book() loadJSON: Uable to parse " + Book.config.templateJSON + ' JSON file.');
				}
				for(var file in Book.templates){
					if(Book.config.templateCompile.indexOf(file) > -1){
						Book.templates[file] = Handlebars.compile(Book.templates[file]);
					}
				}
				done();
				
			} else {
				var error = new Error("Book() loadJSON: Could not load JSON template file from path ",Book.config.templateJSON);
			}
		};
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

		book.addBlob("title_page.xhtml",new Blob([Book.templates.title_page({title:self.title,author:self.author})],{type:"application/xhtml+xml"}));
		book.addText("style.css",Book.templates.style);

		self.book.chaptersAdded = 1;
		self._zip = fs;

		callback();
	};
	var finishBook = function(callback){
		var chapterIndexArray = [];
		for (var i = 1; i <= this.book.chaptersAdded; i++) {
			chapterIndexArray.push(i);
		}

		this.book.addBlob('content.opf',new Blob([Book.templates.content({
			title:this.title,
			author:this.author,
			chapters:chapterIndexArray,
			lang:this.language,
			// UUID Random Generator.
			uuid:'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);})
		})],{type:"application/oebps-package+xml"}));

		callback();
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
		} else {
			throw new Error("Book(): First Argument must be an Object of Settings.");
		}

		self._queue = new Queue();
		self._queue.push(loadTemplates);
		self._queue.push(createZip.bind(self));
	};

	Book.prototype = {
		exportBlob:function(callback){
			var self = this;

			self._queue.push(finishBook.bind(self));
			self._queue.push(function(){
				self._zip.root.exportBlob(function(blob){
					callback(blob.slice(0,blob.size,'application/epub+zip'));
				});
			});
		},
		addChapter:function(a,b){
			// a -> index b -> chapterText
			var self = this,args = arguments;

			var _addChapter = function(callback){
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
						throw new Error("Book(): Invalid XHTML in chapters[" + self.chapters.length + "]");
					}
				}

				self.book.addBlob("chap" + index + ".xhtml",new Blob([chapterText],{type:"application/xhtml+xml"}));

				// For content.opf file creation.
				self.book.chaptersAdded++;
				
				callback();
			};

			self._queue.push(_addChapter);
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

	Book.config.templateJSON = "template.json";
	Book.config.templateCompile = ['content','chapter','title_page'];
	Book.config.validateXML = true;

	// To prevent changes to config.
	Object.preventExtensions(Book.config);

	window.Book = Book;

})(this);