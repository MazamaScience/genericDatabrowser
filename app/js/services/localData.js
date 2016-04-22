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
      lat: 47,
      lng: -122,
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

    var map = function($scope) {
      return {
        center: [47, -122],
        zoom: 4,
        events: {
          click: function(e) {
            factory.request.lat = Math.round(Math.pow(10,4) * e.latLng.lat()) / Math.pow(10,4);
            factory.request.lng = Math.round(Math.pow(10,4) * e.latLng.lng()) / Math.pow(10,4);
            $scope.$apply();
          }
        }
      };
    };

    var marker = {
      options: function() {
        return {
          draggable: true
        };
      },
      decimals: 4
    };

    var factory = {
      request: request,
      forms: forms,
      map: map,
      marker: marker
    };
    
    return factory;

  }

})();