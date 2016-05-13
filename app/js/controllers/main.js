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
