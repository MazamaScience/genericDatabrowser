// Main JS file.
// Registers an AngularJS module, to which we'll add our controllers, services, directives, and filters.

//JS code follows many of the guidelines specified at https://github.com/johnpapa/angular-styleguide

(function() {
  'use strict';

  // Define our application, 'App', and list module dependencies (all found in dependencies.js)
  angular
    .module('App', ['ui.router', 'ngMaps', 'ui.slider', 'ui.bootstrap'])
    .config(configure);

  // dependency injections
  // $stateProvider lets us define states and routes for ui.router
  // $urlRouterProvider lets us change the route
  configure.$inject = ['$stateProvider', '$urlRouterProvider'];

  function configure($stateProvider, $urlRouterProvider) {

    $stateProvider
      .state("index", {
        url: "/",
        templateUrl: "html/main.html"
      })
      .state("about", {
        url: "/about",
        templateUrl: "html/about.html"
      });

    $urlRouterProvider.otherwise("/");

  }

})();

// Main controller
// Exposes the model to the template
// Contains plot options, and overlay options

(function() {
  'use strict';

  angular.module('App')
    .controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = ['$scope', 'DataService', 'RequestService', '$location'];

  function MainCtrl($scope, DataService, RequestService, $location) {

    // vm stands for view model
    var vm = this;

    vm.request = DataService.request;

    vm.forms = DataService.forms;

    vm.updatePlot = updatePlot;                 
    vm.status = RequestService.status;          // request status and results
    vm.popup = { visible: false, url: null };   // plot zoom popup object

    // Initial plot
    updatePlot();

    ///////////////
    // FUNCTIONS
    ///////////////

    // Make request
    function updatePlot() {
      RequestService.get(DataService.request)
        .then(function(result) {
          DataService.result = result;
        });
    }

    ///////////////
    // SCOPE
    ///////////////

    // Watched for changes in plotURL, which translates to this function firing
    // whenever a successful request is made
    $scope.$watch(function() {
      return DataService.result;
    }, function() {
      if(DataService.result) {
        vm.url = DataService.result.data.rel_base + ".png";
        vm.popup.url = vm.url;
      }
    });

    // When URL params change apply those changes to the request object
    $scope.$watch(function() {
      return $location.search();
    }, function(params, old) {

      // If param is an attribute of request, add it's 
      // value to request
      for (var attr in params) {
        if (vm.request.hasOwnProperty(attr)) {
          vm.request[attr] = params[attr];
        }
      }

    }, true);

    // When the request object changes apply those changes to the URL params
    $scope.$watch(function() { 
      return vm.request; 
    }, function(params) {

      var par = $location.search();
      for (var attr in params) {
        par[attr] = params[attr];
      }
      $location.search(par);

    }, true);

  }

})();

// Creates a full page popup that fades out when clicked
// Relies on CSS rules from Mazama_databrowser_base.css
// There should be no need to make changes to this

angular.module('App')

	.directive('selectMenu', ['$compile', function ($compile) {

    return {
      restrict: 'E',		// Is an element <popup> </popup>
      transclude: true,		// Allows HTML content inside
      scope: {
        model: '=',
        options: '='
      },
      template: '<div class="btn-group" uib-dropdown><button type="button" class="btn btn-default btn-block" uib-dropdown-toggle>{{getText(model)}} <span class="caret"></span></button><ul class="dropdown-menu" role="menu"><li ng-repeat="opt in options" ng-click="click(opt)"><a>{{opt.text}}</a></li></ul></div>',
      link: function($scope, ele, atr) {

        var options = $scope.options;

        $scope.getText = function(m) {
          for (var i=0; i<options.length; i++) {
            if (options[i].value === m) {
              return options[i].text;
            }
          }
          return "";
        };

        $scope.click = function(opt) { 
          $scope.model = opt.value;
        };

        $compile(ele.html())($scope);
        
      }
    };

  }]);
// Creates a full page popup that fades out when clicked
// Relies on CSS rules from Mazama_databrowser_base.css
// There should be no need to make changes to this

angular.module('App')

	.directive('popup', function () {

    return {
      restrict: 'E',		// Is an element <popup> </popup>
      transclude: true,		// Allows HTML content inside
      scope: {
        visible: '='		// Binds it to some boolean attribute, will show when true
        					// Because this is binded with "=" when the popup is clicked
        					// The external variable this is bound to will change to false
      },
      template: '<div class="popup-wrapper" ng-click="visible=false" ng-class="{visible: visible}"><div class="row popup" ng-transclude></div></div>'
    };

  });
/* ============================================================================
 * services/localData.js -- Service for storing internal data.
 * 
 * Controllers pull from and modify this data.
 */

(function() {
  'use strict';

  angular.module('App')
    .factory('DataService', DataService);

  // Dependency Injection:
  //   None
  DataService.$inject = [];

  function DataService() {

    // ------------------------------------------------------------------------
    //     BEGIN localData definition     -------------------------------------

    var Factory = this;

    // DataService internal data arrays
    Factory.request = {
      language: "en",
      plotWidth: 700,
      plotType: "TrigFunctions",
      trigFunction: "cos",
      lineColor: "black",
      cycles: 3
    };

    Factory.forms = {
      trigFunctions: [{
        text: "Cosine",
        value: "cos"
      }, {
        text: "Sine",
        value: "sin"
      }, {
        text: "Tangent",
        value: "tan"
      }, {
        text: "Arc cosine",
        value: "acos"
      }, {
        text: "Arc sine",
        value: "asin"
      }, {
        text: "Arc tangent",
        value: "atan"
      }, {
        text: "Generate Error",
        value: "error"
      }],
      lineColors: [{
        text: "Black",
        value: "black"
      }, {
        text: "Red",
        value: "red"
      }, {
        text: "Blue",
        value: "blue"
      }]
    };

    return Factory;

    //     END localData definition     ---------------------------------------
    // ------------------------------------------------------------------------

  }

})();

/* ============================================================================
 * services/RequestService.js -- Service for making JSON requests
 * 
 * Also provides access to the request status, i.e. loading or error messages.
 */

(function() {
  'use strict';

  angular.module('App')
    .factory('RequestService', RequestService);

  // Dependency Injection:
  //   http and q -- requesting data
  RequestService.$inject = ['$http', '$q'];
    
  function RequestService($http, $q) {

    // ------------------------------------------------------------------------
    //     BEGIN RequestService definition     --------------------------------

    var Factory = this;

    // Databrowser cgi url, this is always the same
    Factory.url = '/cgi-bin/__DATABROWSER__.cgi?';

    // RequestService internal data arrays
    Factory.status = {
      loading: false,
      error: false
    };

    // RequestService public methods
    Factory.get = get;

    return Factory;

    //     END DataService definition     -------------------------------------
    // ------------------------------------------------------------------------

    ///////////////
    ///////////////
    ///////////////

    function getStatus() {
      return Factory.status;
    }

    // Serialize object
    function serialize(obj) {
      var str = "";
      for (var key in obj) {
        if (str !== "") {
          str += "&";
        }
        str += key + "=" + obj[key];
      }
      return str;
    }

    // Error handling (this won't usually happen)
    function error(response) {
      return ($q.reject(response.data.message));
    }

    // Success handling. This includes handling errors that are
    // successfuly returned.
    function success(response) {
      Factory.status.loading = false;
      if (response.data.status === "ERROR") {
        Factory.status.error = response.data.error_text;
        return ($q.reject(response.data.error_text));
      }
      return (response);
    }

    // Make a json request with an object of data
    function get(data) {
      Factory.status.loading = true;
      Factory.status.error = false;
      var request = $http({
        method: 'POST',
        url: Factory.url + serialize(data)
      });
      return (request.then(success, error));
    }


  }

})();
