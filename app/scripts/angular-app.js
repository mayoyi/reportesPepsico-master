'use strict';
var angularObj = {
  app: null,
  initAngular: function(api, user) {
    angularObj.app = angular.module('reportes', ['angularjs-dropdown-multiselect', 'angular-click-outside']);
    angularObj.app.directive('multiSelect', function() {
      return {
        restrict: 'E',
        scope: {
          selecteditems: '=',
          items: '=',
          name: '='
        },
        replace: true,
        template: `<div><label class="geotabOptionsMenuElementLabel md-part-5 sm-part-12">{{name}}</label>
                <div class="geotabOptionsMenuElementValue relative md-part-7 sm-part-12">
                  <span class="optionsMenu_filterContainer full-size org-filter">
                  <input class="inputBox checkmateFormEditField" type="text" placeholder="Buscar {{name}}" ng-model="search.name">
                  <span class="imageContainer icon-fixed">
                    <span ng-if="!showList" class="geotabButtonIcons arrowDown inline" outside-if-not="list" click-outside="close()" ng-click="show($event)"></span>
                    <span ng-if="showList" class="geotabButtonIcons inline closeCross" outside-if-not="list" click-outside="close()" ng-click="show($event)"></span>
                  </span>
                  </span>
                  <div id="list" ng-show="showList" class="filterMenuContainer popupWindow scrollHost touchScrollClass" ng-style="{height: listHeight +'px'}" style="display: block; min-width: 150px; bottom: auto; left: 0; top: 27px; max-width: 251px; width: 251px; min-height: 200px;">
                    <ul class="entityNavigator">
                      <li class="selectAllButton" title="Seleccionar todo">
                        <input type="checkbox" data-type="4" class="geotabSwitchButton" id="selectAll" ng-click="selectAll()" ng-checked="allSelected">
                        <label class="geotabButton ellipsis" for="selectAll" ng-if="items.length > 0" title="Seleccionar todo">
                          <div class="icon geotabIcons_status"></div>
                          Seleccionar todo
                        </label>
                      </li>
                      <li class="separator"></li>
                      <li class="selectButton" title="{{d.name}}" ng-repeat="d in items | filter: search | limitTo: displayedItems track by $index">
                        <input ng-change="select(d)" ng-model="d.checked" type="checkbox" data-type="4" class="geotabSwitchButton" id="{{d.id}}" ng-checked="d.checked">
                        <label class="geotabButton ellipsis" for="{{d.id}}" title="{{d.name}}">
                          <div class="icon geotabIcons_vehicle"></div>
                          {{d.name}}
                        </label>
                      </li>
                    </ul>
                  </div>
                  <button class="optionsMenu_AutocompleteButton geotabButton" ng-click="unSelectAll()">Reestablecer selección</button>
                </div>
                <p class="filterSelectionInformation">
                  Seleccionados:
                  <span class="optionsMenu_filterSelectedItems" ng-if="selecteditems.length !== items.length">
                    <span ng-repeat="d in selecteditems | limitTo: 100 track by $index">{{d.name}}<span ng-if="!$last">,</span> </span>
                  </span><span ng-if="selecteditems.length > 100 && selecteditems.length !== items.length">{{selecteditems.length > 100 ? '...' : ''}}</span>
                  <span class="optionsMenu_filterSelectedItems" ng-if="selecteditems.length === items.length || selecteditems.length === 0">{{selecteditems.length === items.length ? 'Todo' : 'Nada' }}</span>
                </p></div>`,
        controller: ['$scope', function itemsController(scope) {
          scope.showList = false;
          scope.listHeight = 100;
          scope.allSelected = false;
          scope.displayedItems = 25;
          scope.loadMore = function() {
            scope.displayedItems += 25;
          };
          $('#list').on('scroll', function(e) {
            var nav = $('.entityNavigator');
            if (e.target.scrollTop + e.target.offsetHeight > nav.height()) {
              if (scope.displayedItems < scope.items.length) {
                scope.displayedItems += 25;
              }
              scope.$apply();
            }

          });

          scope.show = function($event) {
            scope.showList = !scope.showList;
            var position = $event.target.getBoundingClientRect();
            scope.listHeight = $(window).height() - (position.top + 20 + 20);
          };

          scope.close = function() {
            scope.showList = false;
          };

          scope.select = function(item) {
            if (item.checked === true) {
              scope.selecteditems.push(item);
            } else {
              scope.selecteditems.splice(scope.selecteditems.indexOf(item), 1);
            }
            if (scope.items.length === scope.selecteditems.length) {
              scope.allSelected = true;
            } else {
              scope.allSelected = false;
            }
          };

          scope.selectAll = function() {
            scope.allSelected = !scope.allSelected;
            for (var i = 0; i < scope.items.length; i++) {
              scope.items[i].checked = scope.allSelected;
            }
            if (scope.allSelected === true) {
              scope.selecteditems = JSON.parse(JSON.stringify(scope.items));
            } else {
              scope.selecteditems = [];
            }
          };

          scope.unSelectAll = function() {
            scope.allSelected = false;
            for (var i = 0; i < scope.items.length; i++) {
              scope.items[i].checked = scope.allSelected;
            }
            scope.selecteditems = [];
          };

        }]
      };
    });
    angularObj.app.factory('reportsService', ['$http', function($http) {
      var factory = {};
      var config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/octet-stream'
        },
        responseType: 'blob'
      };
      factory.consult = function(data) {
        return $http.post('https://www.metricamovil.com/ApiReportesKOF/Consulta', data, config);
      };
      return factory;
    }]);
    angularObj.app.controller('reportsCtrl', ['$scope', 'reportsService', function($scope, reportsService) {
      $scope.selectedDevices = [];
      $scope.consultType = 'day';

      function detectIE() {
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
          // IE 10 or older => return version number
          return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }
        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
          // IE 11 => return version number
          var rv = ua.indexOf('rv:');
          return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }
        var edge = ua.indexOf('Edge/');
        if (edge > 0) {
          // Edge (IE 12+) => return version number
          return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }
        // other browser
        return false;
      }

      $scope.consult = function() {
        var devicesIds = [];
        var dateConsult;
        if($scope.consultType === 'day') {
          dateConsult = moment($('#dateConsult').val(), 'DD/MM/YYYY');
        } else if($scope.consultType === 'week') {
          dateConsult = moment($('#dateConsult').val(), 'DD/MM/YYYY');
        } else if($scope.consultType === 'month') {
          dateConsult = moment($('#dateConsult').val(), 'MM/YYYY');
        }

        if ($scope.selectedDevices.length === 0) {
          swal('No se puede realizar la consulta', 'Seleccione al menos un vehículo para generar el reporte', 'warning');
          return;
        }
        for (var i = 0; i < $scope.selectedDevices.length; i++) {
          devicesIds.push($scope.selectedDevices[i].id);
        }

        var consultInfo = {
          lstIds: devicesIds,
          dtConsult: dateConsult.format('YYYY-MM-DD HH:mm'),
          sUser: user,
          sBrowser: window.navigator.userAgent,
          sType: $scope.consultType
        };

        $('#reportessabanakof').waitMe({
          effect: 'pulse',
          text: 'Consultando',
          bg: 'rgba(255, 255, 255, 1)',
          color: '#000',
          maxSize: '',
          textPos: 'vertical',
          fontSize: '',
          source: ''
        });
        swal('Procesando', 'El reporte se enviará por correo', 'success');
        reportsService.consult(consultInfo).then(function(resp) {
          var isIE = detectIE();
          var fileName = dateConsult.format('YYYYMMDD') + '_Report.xlsx';
          if (isIE) {
            var blob = new Blob([resp.data]);
            window.navigator.msSaveBlob(blob, fileName);
            $('#reportessabanakof').waitMe('hide');
          } else {
            var fileURL = URL.createObjectURL(resp.data);
            var a = document.createElement('a');
            a.href = fileURL;
            a.download = fileName;
            a.click();
            a.remove();
            $('#reportessabanakof').waitMe('hide');
          }
        }, function(error) {
          var arrayBuffer;
          var fileReader = new FileReader();
          fileReader.onload = function() {
            arrayBuffer = this.result;
            swal(arrayBuffer);
          };
          fileReader.readAsText(error.data);
          $('#reportessabanakof').waitMe('hide');
        });
      };

      $('#dateConsult').datepicker({
        changeMonth: true,
        changeYear: true,
        controlType: 'select',
        dateFormat: 'dd/mm/yy',
        monthNamesShort: $.datepicker.regional.es.monthNames,
        showButtonPanel: false,
        onSelect: function() {
          $(this).data('datepicker').inline = true;
        },
        onClose: function() {
          $(this).data('datepicker').inline = false;
        },
        afterShow: function() {
          var calendar = document.getElementsByClassName('ui-datepicker-calendar');
          var calendarElement = angular.element(calendar);
          var thisDate;
          var firstDate;
          var lastDate;
          if($scope.consultType === 'week') {
            var rowActive = document.getElementsByClassName('ui-state-active');
            var rowActiveElement = angular.element(rowActive);
            rowActiveElement.parent().parent().addClass('selected-week');
            thisDate = $(this).datepicker('getDate');
            if(thisDate !== null) {
              firstDate = moment(thisDate, 'MM-DD-YYYY').isoWeekday(1).format('DD/MM/YYYY');
              lastDate = moment(thisDate, 'MM-DD-YYYY').isoWeekday(7).format('DD/MM/YYYY');
              $(this).val(firstDate + ' - ' + lastDate);
            }
          } else if($scope.consultType === 'month') {
            calendarElement.addClass('hidden');
            thisDate = $(this).val();
            if(thisDate !== null) {
              if(moment(thisDate, 'MM/YYYY', true).isValid()) {
                firstDate = moment(thisDate, 'MM/YYYY').format('MM/YYYY');
              } else {
                firstDate = moment(thisDate, 'DD/MM/YYYY').format('MM/YYYY');
              }
              $(this).val(firstDate);
            }
          } else {
            calendarElement.removeClass('hidden');
          }

          return [true, '', ''];
        }
      });

      var today = new Date();
      var startDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 0, 0, 0);

      function getLastWeek() {
        var today = new Date();
        var discountedDays = today.getDay() === 0 ? 7 : today.getDay();
        var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - discountedDays);
        return lastWeek;
      }

      function getLastMonth() {
        var today = new Date();
        var thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        thisMonth.setDate(thisMonth.getDate() - 1);
        //var lastMont = new Date(thisMont.getDate() - 1);
        //var lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        return thisMonth;
      }

      var lastWeek = getLastWeek();
      var lastMonth = getLastMonth();

      $.datepicker._updateDatepicker_original = $.datepicker._updateDatepicker;
      $.datepicker._updateDatepicker = function(inst) {
        $.datepicker._updateDatepicker_original(inst);
        var afterShow = this._get(inst, 'afterShow');
        if (afterShow) {
          afterShow.apply((inst.input ? inst.input[0] : null));
        }
      };

      $('#dateConsult').datepicker('setDate', startDay);
      $('#dateConsult').datepicker('option', 'maxDate', startDay);

      $scope.setConsultType = function(value) {
        if(value === 'day' || value === 'week') {
          if(value === 'day') {
            $('#dateConsult').datepicker('option', 'maxDate', startDay);
          } else if(value === 'week') {
            $('#dateConsult').datepicker('option', 'maxDate', lastWeek);
          }
          var thisDate = $('#dateConsult').val();
          var momentDate;
          if(moment(thisDate, 'MM/YYYY', true).isValid()) {
            momentDate = moment(thisDate, 'MM/YYYY').format('DD/MM/YYYY');
          } else {
            momentDate = moment(thisDate, 'DD/MM/YYYY').format('DD/MM/YYYY');
          }
          $('#dateConsult').val(momentDate);
          $('#dateConsult').datepicker('option', 'onChangeMonthYear', function(year, month) {});
        } else if(value === 'month') {
          $('#dateConsult').datepicker('option', 'maxDate', lastMonth);
          $('#dateConsult').datepicker('setDate', moment(lastMonth).format('MM/YYYY'));

          $('#dateConsult').datepicker('option', 'onChangeMonthYear', function(year, month) {
            momentDate = moment(new Date(year, month - 1, 1)).format('MM/YYYY');
            $(this).val(momentDate);
            $(this).datepicker('hide');
          });
        }
      };

      api.call('Get', { typeName: 'Device' }, function(result) {
        $scope.devices = $.grep(result, function(a){ if(a.serialNumber !== '000-000-0000') { return a; } });
      }, function(error) {
        swal(error);
      });
    }]);
  }
};
