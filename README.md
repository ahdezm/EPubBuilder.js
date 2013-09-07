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
The script also requires some templates, that you need to download and then connect usinf the Book.config.templatePath property.
