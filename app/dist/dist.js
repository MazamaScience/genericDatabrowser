/* ==============================================================================
 * app.js -- Main application file.
 * 
 * This chunk performs the following actions:
 *  * initialize the angular module
 *  * define routing behavior with ui.router
 * 
 * The 'gulp' utility will concatenate and minify this and other javascript code
 * and place in the app/dist/ directory as per directions in gulpfile.js.
 * 
 * Code style mostly follows: https://github.com/johnpapa/angular-styleguide
 */

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

// I store all of the in memory data here. Controllers pull from and modify
// this data.

(function() {
  'use strict';

  angular.module('App')
    .factory('DataService', DataService);

  DataService.$inject = [];

  function DataService() {

    var request = {
      language: "en",
      plotWidth: 700,
      plotType: "TrigFunctions",
      trigFunction: "cos",
      lineColor: "black",
      cycles: 3
    };

    var forms = {
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

    var factory = {
      request: request,
      forms: forms
    };
    
    return factory;

  }

})();

// Service for making JSON requests. Also provides access to the request status, i.e. 
// loading or error messages

(function() {
  'use strict';

  angular.module('App')
    .factory('RequestService', RequestService);

  RequestService.$inject = ['$http', '$q'];
    
  function RequestService($http, $q) {

    // Databrowser cgi url, this is always the same
    var url = '/cgi-bin/__DATABROWSER__.cgi?';

    // Current status
    var status = {
      loading: false,
      error: false
    };

    var factory = {
      status: getStatus,
      get: get
    };

    return factory;

    ///////////////
    ///////////////
    ///////////////

    function getStatus() {
      return status;
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
      status.loading = false;
      if (response.data.status === "ERROR") {
        status.error = response.data.error_text;
        return ($q.reject(response.data.error_text));
      }
      return (response);
    }

    // Make a json request with an object of data
    function get(data) {
      status.loading = true;
      status.error = false;
      var request = $http({
        method: 'POST',
        url: url + serialize(data)
      });
      return (request.then(success, error));
    }


  }

})();
/* ==============================================================================
 * directives/selectMenu.js -- Drop-down select menu.
 *
 * Relies on CSS rules from app/css/2_reset.scss
 *
 * USAGE:
 * <select-menu model="MainCtrl.request.lineColor" options="MainCtrl.forms.lineColors"></select-menu>
 */

(function() {
  'use strict';

angular.module('App')
	.directive('selectMenu', selectMenu);

  // Dependency Injection:
  //   $compile -- Compiles an HTML string or DOM into a template and produces a
  //               template function, which can then be used to link scope and
  //               the template together.
  selectMenu.$inject = ['$compile'];

  function selectMenu($compile) {

    var directive = {
      restrict: 'E',		// Is an element <popup> </popup>
      transclude: true,		// Allows HTML content inside
      scope: {
        model: '=',
        options: '='
      },
      template: '<div class="btn-group" uib-dropdown><button type="button" class="btn btn-default btn-block" uib-dropdown-toggle>{{getText(model)}} <span class="caret"></span></button><ul class="dropdown-menu" role="menu"><li ng-repeat="opt in options" ng-click="click(opt)"><a>{{opt.text}}</a></li></ul></div>',
      link: compileTemplate
    };

    return directive;

    // Compile the template with information from scope
    function compileTemplate($scope, ele, atr) {

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

  }

})();
/* ==============================================================================
 * directives/popup.js -- Full page popup that fades out when clicked.
 *
 * Relies on CSS rules from Mazama_databrowser_base.css
 */

(function() {
  'use strict';

  angular.module('App')
  	.directive('popup', popup);

  function popup() {

    var directive = {
      restrict: 'E',		// Is an element <popup> </popup>
      transclude: true,	// Allows HTML content inside
      scope: {
        visible: '='		// Binds it to some boolean attribute, will show when true
        					      // Because this is binded with "=" when the popup is clicked
        					      // The external variable this is bound to will change to false
      },
      template: '<div class="popup-wrapper" ng-click="visible=false" ng-class="{visible: visible}"><div class="row popup" ng-transclude></div></div>'
    };

    return directive;

  }

})();