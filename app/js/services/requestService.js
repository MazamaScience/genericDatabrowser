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
