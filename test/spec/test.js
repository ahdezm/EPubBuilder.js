/*global describe, it */
'use strict';
(function () {
	
	describe('Book',function(){
		Book.config.templateJS = '../templates.js';
		Book.config.validateXML = true;

		var book = new Book({
			title:"Test Book",
			author:"Test Author",
			language:"es-ES"
		});

		it('should return a valid Book object', function() {
			expect(book.title).to.equal("Test Book");
			expect(book.author).to.equal("Test Author");
			expect(book.language).to.equal("es-ES");
		});

		it('should allow new chapters', function() {
			//book.addChapter('Hello')
		});

		it('should detect invalid XML',function(){
			//expect(book.addChapter(['<p>Test'])).to.throw('Error: Book(): Invalid XHTML in chapters[0]');
		});

		describe('Book Methods', function(){
			it('should have method exportBlob that returns blob',function(done) {
				book.exportBlob(function(blob){
					expect(blob).to.be.instanceof(Blob);
					done();
				})
			});	
		});
	});
})();
