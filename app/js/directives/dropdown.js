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