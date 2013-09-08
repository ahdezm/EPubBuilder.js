/*global describe, it */
'use strict';
(function () {
	var book;
	
	describe('Book', function () {
		describe('Book.config', function () {
			it('set templatePath', function() {
				Book.config.templatePath = "../templates/";
			});
			it('enable XML Validation', function() {
				Book.config.validateXML = true;
			});
		});

		describe('Book Constrctor', function () {
			it('should create a new Book Object', function(done) {
				book = new Book({
					title:"Test Book",
					author:"Test Author",
					chapters:['Test','Book','Text'],
					language:"es-ES"
				},function(){
					done()
				});
			});
			it('should return a valid Book object', function() {
				expect(book.title).to.equal("Test Book");
				expect(book.author).to.equal("Test Author");
				expect(book.chapters).to.be.an.instanceof(Array);
				expect(book.language).to.equal("es-ES");
			});
			it('should detect invalid XML',function(){
				try{
					expect(new Book(['<p>Test'])).to.throw('Error: Book(): Invalid XHTML in chapters[0]');
				} catch(e){}
			});
			it('should throw error when there is no input', function(){
				try {
					expect(new Book()).to.throw(Error);
				} catch(e){}
			});
		});

		describe('Book Methods', function(){
			it('should have method exportBlob that returns blob',function (done) {
				book.exportBlob(function(blob){
					expect(blob).to.be.instanceof(Blob);
					done();
				})
			});
			it('should have method downloadEpub', function() {
				expect(book).to.have.property("downloadBook");			
			});		
		});
	});
})();
