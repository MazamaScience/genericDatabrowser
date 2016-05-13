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