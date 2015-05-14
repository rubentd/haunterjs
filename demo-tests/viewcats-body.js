var haunter = require('../haunter.js');
haunter.start('viewcats/body', 'Cat listing');
haunter.goToUrl('./demo-app/view-cats.html');
haunter.snap('.container', 'Make sure the three cats look ok');
haunter.end();