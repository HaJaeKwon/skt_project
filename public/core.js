var mangoApp = angular.module('mangoApp', ['ui.router', 'ui.bootstrap', 'ngMaterial', 'ngMessages']);

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
		})

		.state('promoter', {
			url: '/promoter',
			templateUrl: 'templates/promoter.html',
			controller: 'promoterController'
		});

});

mangoApp.controller('homeController', function ($scope, $http, $state) {
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

mangoApp.controller('aboutController', function ($scope, $http, $state) {
	
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

mangoApp.controller('artistDetailController', function ($scope, $http, $state, $stateParams) {
	var artists = $scope.artists = [];
	artists.push({"name":"Maroon5", "cites":32, "total-invite-count":128303, "is-invite":false, "current-invite-count":0});

	var name = $scope.name = $stateParams.name.toLowerCase();
	console.log('name : ' + name);

	var maxPoint = 20;
	$scope.isInviteSuccess = false;

	$scope.ticketMoney = 80;

	$scope.myDate = new Date('3/1/2017');

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

				if($scope.invite.isPromote) {
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

mangoApp.controller('promoterController', function ($scope, $http, $state, $stateParams, $location, anchorSmoothScroll, $timeout, $q, $log) {
	
	$scope.artistList = [];
	$scope.artistList.push({'profile':'../images/profile_maroon50.png', 'name':'Maroon5', 'city':'US', 'totalCount':71834});
	$scope.artistList.push({'profile':'../images/profile_honne0.jpg', 'name':'Honne', 'city':'US', 'totalCount':124565});

	$scope.artist = $scope.artistList[0];
	$scope.isStep2 = false;

	$scope.selectArtist = function(a) {
		$scope.artist = a;
	}

	$scope.nextStep = function() {
		$scope.isStep2 = !$scope.isStep2;
		console.log($scope.isStep2);
	}

	$scope.gotoElement = function (eID){
      // set the location.hash to the id of
      // the element you wish to scroll to.
      $location.hash('bottom');
 
      // call $anchorScroll()
      anchorSmoothScroll.scrollTo(eID);
      
    };

    this.myDate = new Date();

  this.minDate = new Date(
    this.myDate.getFullYear(),
    this.myDate.getMonth() - 2,
    this.myDate.getDate()
  );

  this.maxDate = new Date(
    this.myDate.getFullYear(),
    this.myDate.getMonth() + 2,
    this.myDate.getDate()
  );

    this.onlyWeekendsPredicate = function(date) {
    var day = date.getDay();
    return day === 0 || day === 6;
    };

    $scope.clickPromote = function(a) {
    	console.log(a);
    	$http({
    		method:'PUT',
    		url:'api/invite/promote/' + a.name
    	}).then(function(res) {
    		console.log(res);
    	}, function(err) {
    		console.log('Error : ' + err);
    	});
    }

    var loopFunc = function() {
		$http({
			method:'GET',
			url:'api/invite/getAll'
		}).then(function(res) {
			var data = res.data.data;
			console.log(data);
			var isOk = false;
			for(var i=0; i<data.length; i++) {
				if(data[i].cur >= data[i].max) {
					$http({
						method:'GET',
						url:'api/artist/get/gallant'
					}).then(function(res) {
						$scope.artistList.push({'profile':'../images/profile_gallant0.jpg', 'name':res.data.data.name, 'city':res.data.data.city, 'totalCount':res.data.data.totalPoint});
					}, function(err) {
						console.log('Error : ' + err);
					});
				} else {
					setTimeout(loopFunc(), 1000);
				}
			}
			if(data.length == 0) setTimeout(loopFunc(), 1000);
		}, function(err) {
			console.log('Error: ' + err);
		});
	};
	setTimeout(loopFunc(), 1000);

});

mangoApp.service('anchorSmoothScroll', function(){
    
    this.scrollTo = function(eID) {

        // This scrolling function 
        // is from http://www.itnewb.com/tutorial/Creating-the-Smooth-Scroll-Effect-with-JavaScript
        
        var startY = currentYPosition();
        var stopY = elmYPosition(eID);
        var distance = stopY > startY ? stopY - startY : startY - stopY;
        if (distance < 100) {
            scrollTo(0, stopY); return;
        }
        var speed = Math.round(distance / 100);
        if (speed >= 20) speed = 20;
        var step = Math.round(distance / 25);
        var leapY = stopY > startY ? startY + step : startY - step;
        var timer = 0;
        if (stopY > startY) {
            for ( var i=startY; i<stopY; i+=step ) {
                setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
                leapY += step; if (leapY > stopY) leapY = stopY; timer++;
            } return;
        }
        for ( var i=startY; i>stopY; i-=step ) {
            setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
            leapY -= step; if (leapY < stopY) leapY = stopY; timer++;
        }
        
        function currentYPosition() {
            // Firefox, Chrome, Opera, Safari
            if (self.pageYOffset) return self.pageYOffset;
            // Internet Explorer 6 - standards mode
            if (document.documentElement && document.documentElement.scrollTop)
                return document.documentElement.scrollTop;
            // Internet Explorer 6, 7 and 8
            if (document.body.scrollTop) return document.body.scrollTop;
            return 0;
        }
        
        function elmYPosition(eID) {
            var elm = document.getElementById(eID);
            var y = elm.offsetTop;
            var node = elm;
            while (node.offsetParent && node.offsetParent != document.body) {
                node = node.offsetParent;
                y += node.offsetTop;
            } return y;
        }

    };
    
});

mangoApp.controller('DemoCtrl', DemoCtrl);

  function DemoCtrl ($timeout, $q, $log) {
    var self = this;

    self.simulateQuery = false;
    self.isDisabled    = false;

    // list of `state` value/display objects
    self.states        = loadAll();
    self.querySearch   = querySearch;
    self.selectedItemChange = selectedItemChange;
    self.searchTextChange   = searchTextChange;

    self.newState = newState;

    function newState(state) {
      alert("Sorry! You'll need to create a Constitution for " + state + " first!");
    }

    // ******************************
    // Internal methods
    // ******************************

    /**
     * Search for states... use $timeout to simulate
     * remote dataservice call.
     */
    function querySearch (query) {
      var results = query ? self.states.filter( createFilterFor(query) ) : self.states,
          deferred;
      if (self.simulateQuery) {
        deferred = $q.defer();
        $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
        return deferred.promise;
      } else {
        return results;
      }
    }

    function searchTextChange(text) {
      $log.info('Text changed to ' + text);
    }

    function selectedItemChange(item) {
      $log.info('Item changed to ' + JSON.stringify(item));
    }

    /**
     * Build `states` list of key/value pairs
     */
    function loadAll() {
      var allStates = 'Alabama, Alaska, Arizona, Arkansas, California, Colorado, Connecticut, Delaware,\
              Florida, Georgia, Hawaii, Idaho, Illinois, Indiana, Iowa, Kansas, Kentucky, Louisiana,\
              Maine, Maryland, Massachusetts, Michigan, Minnesota, Mississippi, Missouri, Montana,\
              Nebraska, Nevada, New Hampshire, New Jersey, New Mexico, New York, North Carolina,\
              North Dakota, Ohio, Oklahoma, Oregon, Pennsylvania, Rhode Island, South Carolina,\
              South Dakota, Tennessee, Texas, Utah, Vermont, Virginia, Washington, West Virginia,\
              Wisconsin, Wyoming, Seoul';

      return allStates.split(/, +/g).map( function (state) {
        return {
          value: state.toLowerCase(),
          display: state
        };
      });
    }

    /**
     * Create filter function for a query string
     */
    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);

      return function filterFn(state) {
        return (state.value.indexOf(lowercaseQuery) === 0);
      };

    }
  }
