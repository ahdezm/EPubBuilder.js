# EPubBuilder.js

A javascript-based epub file builder.

## Syntax

The scripts works by creating a Book Constructor, that accepts two arguments:
- An array of chapters or an object of Metadata.
- A callback that recives a book argument

```javascript
new Book({
	title:'Book Title',
	author:'Book Author',
	chapters:[Array of Chapters]
},callback);
```
or
```javascript
new Book([Array of Chapters],callback);
```
## Config

The only dependency the script has is a folder of templates, the oath to which needs to be configured using the setting Book.config.templatePath.

It also counts with an option to validate the chapters xhtml inputed to avoid faulty ePubs. This option can be tuned on with the Book.config.validateXML option, which defaults to false.
