/* global define */
(function(root, factory) {
	if (typeof define === "function" && define.amd) {
		// AMD. Register as an anonymous module.
		define(["args","jz","views"], factory);
	} else {
		// Browser globals
		root.Book = factory(root.Args,root.jz,root.Views);
	}
}(this, function(Args,jz,Views) {
	"use strict";
	// TODO: Validate all input.
	// TODO: Add quick-book functionality.
	// TODO: Add EPub3 nav support
	// TODO: Add default css style: http://git.io/3rQgWw
	// TODO: Add ePub Boilerplate: http://git.io/0Lj8rg
	// TODO: Create real documentation (Use epubcheck)
	// TODO: Add true error handling

	// NOTE: jz is fastest zip compression library(http://jsperf.com/non-compression-zip-comparison-text)

	/*var handleError = function(error){
		console.log(error);
	};*/

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

	var finishBook = function(){
		var indexArray = range(1,this.chaptersAdded);

		var metaData = Views["content.opf"]({
			title:this.title,
			author:this.author,
			chapters:indexArray,
			lang:this.language,
			// UUID Random Generator.
			uuid:"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c==="x"?r:r&0x3|0x8;return v.toString(16);})
		});

		this._zip[2].dir.push({name:"content.opf",buffer:metaData});
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

		self.chaptersAdded = 1;

		self._zip = [
			{ name: "mimetype", buffer: "application/epub+zip"}, //string
			{ name: "META-INF", dir: [ //folder
				{ name: "container.xml", buffer:Views["container.xml"]()}, //ArrayBuffer
			]},
			{ name:"OEBPS", dir: [
				{ name:"title_page.xhtml", buffer:Views["title_page.xhtml"]({
					title:self.title,
					author:self.author
				})},
				{name:"style.css", buffer:Views["style.css"]()}
			]}
		];
	};

	Book.prototype = {
		exportBuffer:function(){
			var self = this;
			finishBook.call(self);
			
			return jz.zip.pack({
				files:self._zip
			});
		},
		exportBlob:function(){
			return this.exportBuffer().then(function(buffer){
				return new Blob([buffer],{type:"application/epub+zip"});
			});
		},
		addChapter:function(){
			var self = this;
			var args = Args([
				{
					text: Args.STRING | Args.Required
				},
				{
					index: Args.INT | Args.Optional,
					_default:self.chaptersAdded
				},
				{
					title: Args.STRING | Args.Optional
				}
			],arguments);

			var chapterText = Views["chapter.xhtml"](args);

			// Basic XML Parser.
			if(!!Book.config.validateXML && new DOMParser().parseFromString(chapterText, "application/xhtml+xml").getElementsByTagName("parsererror").length > 0){
				throw new Error("Book(): Invalid XHTML in chapter " + args.index);
			}

			self._zip[2].dir.push({name:"chap" + args.index + ".xhtml",buffer:chapterText});

			// For content.opf file creation.
			self.chaptersAdded++;
		},
		addChapters:function(chapters){
			for (var i = chapters.length; i > 0; i--) {
				this.addChapter(chapters[i-1],i);
			}
		}
	};

	// TODO: Add a more advanced config function.
	Book.config = {};
	Book.config.validateXML = true;
	// To prevent changes to config.
	Object.preventExtensions(Book.config);

	return Book;
}));