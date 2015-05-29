var haunter = require('../haunter.js');
haunter.setViewports([
	{ 
		name: 'iPhone4',
		width: 320, 
		height: 480
	}
]);
haunter.start('viewcats/body', 'Cat listing');
haunter.goToUrl('./demo-app/view-cats.html');
haunter.snap('.container', 'Make sure the three cats look ok');
haunter.end();