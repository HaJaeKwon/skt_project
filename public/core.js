var mangoApp = angular.module('mangoApp', ['ui.router', 'ui.bootstrap']);

mangoApp.config(function($stateProvider, $urlRouterProvider) {

	$urlRouterProvider.otherwise('/home');

	$stateProvider

		.state('home', {
			url: '/home',
			templateUrl: 'templates/home.html',
			controller: 'homeController'
		})

		.state('about', {
			url: '/about',
			templateUrl: 'templates/about.html',
			controller: 'aboutController'
		})

		.state('artists', {
			url: '/artists/:name',
			templateUrl: 'templates/artist-detail.html',
			controller: 'artistDetailController'
		});

});

mangoApp.controller('homeController', function mainController($scope, $http, $state) {
	$scope.myInterval = 3000;
  $scope.noWrapSlides = false;
  $scope.active = 0;
  var slides = $scope.slides = [];
  var currIndex = 0;

  $scope.addSlide = function(i) {
    var newWidth = 600 + slides.length + 1;
    slides.push({
      image: '../images/background' + i + '.jpg',
      text: ['Nice image','Awesome photograph','That is so cool','I love that'][slides.length % 4],
      id: currIndex++
    });
  };

  $scope.randomize = function() {
    var indexes = generateIndexesArray();
    assignNewIndexesToSlides(indexes);
  };

  for (var i = 0; i < 3; i++) {
    $scope.addSlide(i);
  }

  // Randomize logic below

  function assignNewIndexesToSlides(indexes) {
    for (var i = 0, l = slides.length; i < l; i++) {
      slides[i].id = indexes.pop();
    }
  }

  function generateIndexesArray() {
    var indexes = [];
    for (var i = 0; i < currIndex; ++i) {
      indexes[i] = i;
    }
    return shuffle(indexes);
  }

  // http://stackoverflow.com/questions/962802#962890
  function shuffle(array) {
    var tmp, current, top = array.length;

    if (top) {
      while (--top) {
        current = Math.floor(Math.random() * (top + 1));
        tmp = array[current];
        array[current] = array[top];
        array[top] = tmp;
      }
    }

    return array;
  }
});

mangoApp.controller('aboutController', function aboutController($scope, $http, $state) {
	
	$scope.formData = {};

	$http({
		method:'GET',
		url:'api/todos'
	}).then(function(res) {
		$scope.todos = res.data;
		console.log(res.data);
	}, function(err) {
		console.log('Error: ' + err);
	});

	// when submitting the add form, send the text to the node API
	$scope.createTodo = function() {
		$http({
			method:'POST',
			url:'api/todos',
			data:$scope.formData
		}).then(function(res) {
			$scope.formData = {}; // clear the form so our user is ready to enter another
			$scope.todos = res.data;
			console.log(res.data);
		}, function(err) {
			console.log('Error: ' + err);
		});
	};

	// delete a todo after checking it
	$scope.deleteTodo = function(id) {
		$http({
			method:'DELETE',
			url:'api/todos/' + id
		}).then(function(res) {
			$scope.todos = res.data;
			console.log(res.data);
		}, function(err) {
			console.log('Error: ' + err);
		});
	};
});

mangoApp.controller('artistDetailController', function aboutController($scope, $http, $state, $stateParams) {
	var artists = $scope.artists = [];
	artists.push({"name":"Maroon5", "cites":32, "total-invite-count":128303, "is-invite":false, "current-invite-count":0});

	var name = $scope.name = $stateParams.name.toLowerCase();
	console.log('name : ' + name);

	var maxPoint = 20;
	$scope.isInviteSuccess = false;

	$scope.inviteStart = function() {
		$scope.isInviteStart = true;

		$http({
			method:'POST',
			url:'api/invite/insert',
			data:{
				"name":name,
				"cur":1,
				"max":maxPoint
			}
		}).then(function(res) {
			console.log('post res : ' + res.data.data);
			$scope.invite = {
				"name":name,
				"cur":1,
				"max":maxPoint
			}
			setTimeout(loopFunc(), 1000);
		}, function(err) {
			console.log('Error: ' + err);
		});


	};

	$scope.clickInvite = function() {
		if($scope.invite.cur < $scope.invite.max) {
			$http({
				method:'PUT',
				url:'api/invite/like/' + name
			}).then(function(res) {
				console.log('invite updated : ' + res.data.data);
				$scope.invite.cur++;
			}, function(err) {
				console.log('Error: ' + err);
			});
		}
	};

	$http({
		method:'GET',
		url:'api/artist/get/' + name
	}).then(function(res) {
		$scope.artist = res.data.data;
		$scope.imageList = [];

		for(var i=0; i<3; i++) {
			$scope.imageList.push({
		      src: $scope.artist.img[i],
		      text: ['Nice image','Awesome photograph','That is so cool','I love that'][3 % 4],
		      id: i
		    });
		}

		console.log('imageList : ' + $scope.imageList[0].image);
		console.log('res : ' + res.data.data);
	}, function(err) {
		console.log('Error: ' + err);
	});

	$http({
		method:'GET',
		url:'api/invite/get/' + name
	}).then(function(res) {
		console.log('invite get res : ' + res.data.data);
		if(res.data.data!='') {
			$scope.isInviteStart = true;
			$scope.invite = res.data.data;
		}
	}, function(err) {
		console.log('Error: ' + err);
	});

	var loopFunc = function() {
		$http({
			method:'GET',
			url:'api/invite/get/' + name
		}).then(function(res) {
			console.log('invite get res : ' + res.data.data);
			if(res.data.data!='') {
				$scope.isInviteStart = true;
				$scope.invite = res.data.data;

				if($scope.invite.cur >= $scope.invite.max) {
					$scope.isInviteSuccess = true;
				} else {
					setTimeout(loopFunc(), 1000);
				}
			}
		}, function(err) {
			console.log('Error: ' + err);
		});
	};
	setTimeout(loopFunc(), 1000);
});