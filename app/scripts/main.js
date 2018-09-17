/**
 * @returns {{initialize: Function, focus: Function, blur: Function}}
 */
geotab.addin.generadorReportesPepsico = function () {
  'use strict';

  // the root container
  var elAddin;

  return {

    initialize: function (freshApi, freshState, initializeCallback) {
      elAddin = document.querySelector('#generadorReportesPepsico');
      // MUST call initializeCallback when done any setup
      initializeCallback();
      angularObj.initAngular(freshApi, freshState);
      angular.bootstrap(document.getElementById('generadorReportesPepsico'), ['myAplicacion']);
    },

    focus: function (freshApi, freshState) {
      // example of setting url state
      freshState.setState({
        //hello: 'world'
      });

      // getting the current user to display in the UI
      freshApi.getSession(session => {
        // elAddin.querySelector('#generadorReportesPepsico-user').textContent = session.userName;
      });

      // show main content
      elAddin.className = '';
    },

    blur: function () {
      // hide main content
      elAddin.className = 'hidden';
    }
  };
};