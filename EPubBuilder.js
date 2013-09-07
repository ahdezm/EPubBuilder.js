// NOTE: Investigate DOM Promises as a way to make the API run async.

(function(window,undefined){
	/*
	new Book({
		title:title,
		author:author,
		text: @ Array of Chapter Texts
	},function(book){ @callback });
	*/

	// TODO: Find a way to integrate web workers. This wont work for production.
	//zip.workerScriptsPath = 'libs/zip.js/WebContent/';
	zip.useWebWorkers = false;
	// TODO: Check for zip.js support.

	var isStringArray = function(array){
		return array.filter(function(self){
			return(typeof(self) !== 'string'); 
		}).length < 1;
	};

	var loadTemplates = function(templates,exclude,done){
		if(Object.keys(Book.templates).length > 0){
			done();
			return;
		}

		var exclude = exclude || [];
		var toLoad = templates.concat(exclude);

		function loadFile(file){
			var path = Book.config.templatePath + file;
			var xhr = new XMLHttpRequest();
			xhr.responseType = 'text';
			xhr.open("GET",path,true);
			xhr.send();

			xhr.onload = function(){
				if(this.status == '200'){
					var name = file.slice(0,(file.indexOf(".") > 0)?file.indexOf("."):file.length-1);
					if(!new RegExp(exclude.join('|')).test(file)){
						var template = Handlebars.compile(this.response);
					}	
					Book.templates[name] = template || this.response;
					
					// TODO: Check for objects instead of length.
					if(Object.keys(Book.templates).length === toLoad.length){
						done();
					}
				} else {
					var error = new Error("Book() loadTemplate: Could not load template from path ",path);
				}
			}
		}

		for (var i = toLoad.length - 1; i >= 0; i--) {
			loadFile(toLoad[i]);
		};
	}

	var loadFS = function(){
		// TODO: Add Error callback to Filesystem API.
		var self =  this;
		var fs = new zip.fs.FS();

		var meta = fs.root.addDirectory("META-INF");
		var book = fs.root.addDirectory("OEBPS");

		fs.root.addText('mimetype','application/epub+zip');

		meta.addBlob('container.xml',new Blob(['<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'],{type:'application/xml'}))

		book.addBlob('content.opf',new Blob([Book.templates.content({
			title:self.title,
			author:self.author,
			chapters:self.chapters,
			// UUID Random Generator.
			uuid:'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);})
		})],{type:"application/oebps-package+xml"}));

		book.addBlob("title_page.xhtml",new Blob([Book.templates.title_page({title:self.title,author:self.author})],{type:"application/xhtml+xml"}));
		book.addText("style.css",Book.templates.style)

		for (var i = self.chapters.length - 1; i >= 0; i--) {
			book.addBlob("chap" + (i+1) + ".xhtml",new Blob([Book.templates.chapter({text:self.chapters[i],index:i+1})],{type:"application/xhtml+xml"}));
		};

		self._zip = fs;

		if(!!self._done){
			self._done(self);
		}
	}

	Handlebars.registerHelper("chapter",function(index){
		return parseInt(index,10) + 1;
	});

	Handlebars.registerHelper("html",function(html){
		return new Handlebars.SafeString(html);
	});

	var Book = function(){
		if(!(this instanceof Book)){
			throw new Error("Book(): Function must be a new instance.")
		}

		if(Object.prototype.toString.call(arguments[0]) === "[object Object]"){
			try {
				this.title = arguments[0].title;
				this.author = arguments[0].author;

				var templatePath = arguments[0].templatePath;

			} catch(e){}

			if('text' in arguments[0]){
				if(!isStringArray(arguments[0].text)){
					throw new Error("Book(): The Array must contain only strings.");
				}
				this.chapters = arguments[0].text;
			} else {
				throw new Error("Book(): To create a book the parameter text is required.")
			}
		} else if(arguments[0] instanceof Array){
			if(!isStringArray(arguments[0])){
				throw new Error("Book(): The Array must contain only strings.");
			}
			this.chapters = arguments[0];
			this.title = this.author = '';

		} else {
			throw new Error("Book(): First Argument must be an Object of Settings or an Array of Chapters.");
		}

		if(typeof(arguments[1]) == 'function'){
			this._done = arguments[1];
		}

		// NOTE: Consider using an object instead of an array. 
		loadTemplates(['content.opf','chapter.xhtml','title_page.xhtml'],['style.css'],loadFS.bind(this));
	};

	Book.prototype = {
		exportBlob:function(callback){
			this._zip.root.exportBlob(callback);
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

	window.Book = Book;

})(this);