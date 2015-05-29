var haunter = require('../haunter.js');
haunter.start('home', 'Take a look at the home page');
haunter.setViewports([
	{ 
		name: 'desktop',
		width: 1024, 
		height: 748
	}
]);
haunter.snap('body', 'Make sure Hello World message is correct');
haunter.click('.dropdown-toggle');
haunter.snap('body', 'Open dropdown menu');
haunter.sendKeys('#search', 'How to cat');
haunter.snap('body', 'Write something on the search field');
haunter.end();