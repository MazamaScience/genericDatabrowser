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