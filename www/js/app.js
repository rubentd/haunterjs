var SERVER = 'http://localhost:8080';

/*
 * Routes
 */
angular.module('haunter', ['ngRoute'])
	.config(['$routeProvider', function($routeProvider) {
  $routeProvider
	.when('/browse/:path*', {
		templateUrl: 'templates/pages/finder/index.html',
		controller: 'HaunterFinderController'
	}).when('/details/:path*', {
		templateUrl: 'templates/pages/details/index.html',
		controller: 'HaunterDetailsController'
	}).otherwise({
		templateUrl: 'templates/pages/finder/index.html',
		controller: 'HaunterFinderController'
	});
}]);

/*
 * Controllers
 */
angular.module('haunter')
	.controller('HaunterFinderController', ['$http', '$scope', '$routeParams', function($http, $scope, $routeParams){
		
	var path = $routeParams.path;
	if(path != undefined && path != ''){
		//Get contents of current folder
		$http.get(SERVER + '/contents?path=' + path).success( function(data){
			$scope.current = data;
		});
		$scope.currentPath = path + '/';
	}else{
		$http.get(SERVER + '/root-contents').success( function(data){
			$scope.current = data;
		});
	}

}]);
angular.module('haunter')
	.controller('HaunterBreadcrumbsController', ['$scope', '$routeParams', function($scope, $routeParams){
	
	var path = $routeParams.path;
	$scope.pathPieces = [];
	//Current path for breadcrumbs
	if(path != undefined){
		var pieces = path.split('/');
		var url = '#/browse';
		for(var i = 0; i < pieces.length; i++){
			$scope.pathPieces[i] = {};
			$scope.pathPieces[i].name = pieces[i];
			url += '/' + pieces[i];
			$scope.pathPieces[i].path = url;
		}
	}
}]); 	
angular.module('haunter')
	.controller('HaunterHeaderController', ['$http', '$scope', function($http, $scope){

	$http.get(SERVER + '/failed-tests').success( function(failedTests){
		$scope.failedTests = failedTests;
		$scope.totalFailed = failedTests.length;
		$scope.goToTest = function goToTest(testPath){
			$('#failed-tests-modal').modal('hide');
			$('.modal-backdrop').hide();
			$('body').removeClass('modal-open');
			location.href = '#/details/' + testPath;
		};
	});

}]); 
angular.module('haunter')
	.controller('HaunterDetailsController', ['$http', '$scope', '$routeParams', function($http, $scope, $routeParams){
		
	var path = $routeParams.path;
	if(path != undefined){
		$http.get(SERVER + '/details/?path=' + path).success( function(data){
			$scope.testData = data;
		});
	}

	$scope.showModalSnap = function(snap, keepScr){
		//Update modal labels
		$scope.keep = snap;
		$scope.delete = (snap == 'baseline') ? 'latest' : 'baseline';
		$scope.keepScr = keepScr;
	};

	$scope.confirmSnap = function(snapType, snapPath){
		if(snapType == 'baseline'){
			/*
			 * This means the new screenshot is wrong.
			 * The user must fix the problem and then 
			 * run the tests again
			 */
			//Delete latest
			$http.get(SERVER + '/keep-baseline?screenshotPath=' + snapPath)
				.success( function(data){
				$('#confirm-modal').modal('hide');
				$('#latest-deleted').modal('show');
			});

		}else if(snapType == 'latest'){
			/*
			 * This means the baseline must be updated
			 * The latest wil be the new baseline
			 */
			//Update baseline (make latest become new baseline)
			snapPath = snapPath.replace('.diff.png', '.png');
			$http.get(SERVER + '/update-baseline?screenshotPath=' + snapPath)
				.success( function(data){
				$('#confirm-modal').modal('hide');
				$('#baseline-updated').modal('show');
			});
		}
	};

}]); 

/*
 * Directives
 */
angular.module('haunter')
	.directive("haunterHeader", function(){
	return {
		restrict: 'E',
		templateUrl: 'templates/directives/h-header.html',
		controller: 'HaunterHeaderController'
	};
});
angular.module('haunter')
	.directive("haunterBreadcrumbs", function(){
	return {
		restrict: 'E',
		templateUrl: 'templates/directives/h-breadcrumbs.html',
		controller: 'HaunterBreadcrumbsController'
	};
});
angular.module('haunter')
	.directive("haunterFolder", function(){
	return {
		restrict: 'E',
		templateUrl: 'templates/directives/h-folder.html'
	};
});
angular.module('haunter')
	.directive("haunterTest", function(){
	return {
		restrict: 'E',
		templateUrl: 'templates/directives/h-test.html'
	};
});
angular.module('haunter')
	.directive("haunterSnap", function(){
	return {
		restrict: 'E',
		templateUrl: 'templates/directives/h-snap.html'
	};
});

