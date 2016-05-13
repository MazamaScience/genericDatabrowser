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

/* ==============================================================================
 * controllers/main.js -- Controller for app/html/dmainhtml
 *
 * From https://docs.angularjs.org/guide/controller:
 *   Use controllers to:
 *     * Set up the initial state of the $scope object.
 *     * Add behavior to the $scope object.
 *
 * This controller controls the menus and options in the UI.
 */

(function() {
  'use strict';

  angular.module('App')
    .controller('MainCtrl', MainCtrl);

  // Dependency Injection:
  //   scope -- AngularJS binding between 'main DOM and this controller
  //   location -- pparses the URL in the browser address bar
  //   DataService -- stores overall state and settings
  //   RequestService -- handles request/response with the databrowser CGI
  MainCtrl.$inject = ['$scope', '$location', 'DataService', 'RequestService'];

  function MainCtrl($scope, $location, DataService, RequestService) {

    // ------------------------------------------------------------------------
    //     BEGIN MainCtrl definition     --------------------------------------

    // view model
    var vm = this;

    // MainCtrl internal data
    vm.request = DataService.request;           //  
    vm.forms = DataService.forms;               //
    vm.status = RequestService.status;          // request status and results

    // MainCtrl public methods
    vm.updatePlot = updatePlot;                 //
    vm.popup = { visible: false, url: null };   // plot zoom popup object

    //     END MainCtrl definition     ----------------------------------------
    // ------------------------------------------------------------------------


    // Initialize with a plot
    updatePlot();

    // Watch for changes in DataService.result.
    // Modify urls whenever a successful request is made.
    $scope.$watch(function() {
      return DataService.result;
    }, function() {
      if (DataService.result) {
        vm.url = DataService.result.data.rel_base + ".png";
        vm.popup.url = vm.url;
      }
    });

    // Watch for changes in the browser location bar.
    // When URL params change apply those changes to the request object.
    $scope.$watch(function() {
      return $location.search();
    }, function(params, old) {
      // If param is an attribute of request, add it's value to request
      for (var attr in params) {
        if (vm.request.hasOwnProperty(attr)) {
          vm.request[attr] = params[attr];
        }
      }
    }, true); // See 'objectEqualitiy' at https://docs.angularjs.org/api/ng/type/$rootScope.Scope

    // Watch for changes in the request.
    // Apply those changes to the URL params.
    $scope.$watch(function() { 
      return vm.request; 
    }, function(params) {

      var par = $location.search();
      for (var attr in params) {
        par[attr] = params[attr];
      }
      $location.search(par);

    }, true); // See 'objectEqualitiy' at https://docs.angularjs.org/api/ng/type/$rootScope.Scope


    // ------------------------------------------------------------------------
    //     BEGIN internal functions     ---------------------------------------
    // ------------------------------------------------------------------------

    // Make request for a new plot
    function updatePlot() {
      RequestService.get(DataService.request)
        .then(function(result) {
          DataService.result = result;
        });
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
      restrict: 'E',		  // Is an element <select-menu> </select-menu>
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
 * Relies on CSS rules from app/css/5_components.scss
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
/* ============================================================================
 * services/dataService.js -- Service containing state data.
 *
 * Services are always 'singleton'. Controllers pull from and modify this data.
 * 
 */

(function() {
  'use strict';

  angular.module('App')
    .factory('DataService', DataService);

  // Dependency Injection:
  //   none
  DataService.$inject = [];

  function DataService() {

    // ------------------------------------------------------------------------
    //     BEGIN DataService definition     -----------------------------------
    
    var Factory = this;
    
    // Data service state variables

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

    //     END DataService definition     -------------------------------------
    // ------------------------------------------------------------------------

  }

})();

/* ============================================================================
 * services/requestService.js -- Service for handling CGI request/response.
 * 
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
    
    // Data service state variables
    // NOTE:  __DATABROWSER__ is replaced during the Makefile installation process
    Factory.url = '/cgi-bin/__DATABROWSER__.cgi?';  // databrowser cgi url

    // DataService public methods
    Factory.status = getStatus; 
    Factory.get = get;

    return Factory;

    //     END RequestService definition     ----------------------------------
    // ------------------------------------------------------------------------

    function getStatus() {
      return {
        loading: false,
        error: false
      };
    }

    // Make a json request with an object of data
    function get(data) {
      Factory.status.loading = true;
      Factory.status.error = false;
      var request = $http({
        method: 'POST',
        url: Factory.url + serialize(data)
      });
      return (request.then(handleSuccess, handleError));
    }

    // ------------------------------------------------------------------------
    //     BEGIN internal functions     ---------------------------------------
    // ------------------------------------------------------------------------

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
    function handleError(response) {
      return ($q.reject(response.data.message));
    }

    // Success handling. This includes handling errors that are successfuly returned.
    function handleSuccess(response) {
      Factory.status.loading = false;
      if (response.data.status === "ERROR") {
        Factory.status.error = response.data.error_text;
        return ($q.reject(response.data.error_text));
      }
      return (response);
    }



  }

})();