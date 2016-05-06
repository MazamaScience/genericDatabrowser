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
