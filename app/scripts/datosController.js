var api;
var app = angular.module('myAplicacion', ['ngMaterial', 'material.components.expansionPanels', 'md.data.table', 'ngMaterialDatePicker', 'angularjs-dropdown-multiselect']);

app.controller('accesoDatosController', ['$scope', '$filter', '$http', '$mdSelect', '$window', function ($scope, $filter, $http, $mdSelect, $window) {
    var authenticationCallback1;
    api = GeotabApi(function (autenticacionCallback) {
        authenticationCallback1 = autenticacionCallback;
        authenticationCallback1('my332.geotab.com', 'pepsico_mexico', 'mayra.delgado@metricamovil.com', 'Amoalverde12$',
            function (errorString) {
                //alert(errorString);
                swal({
                    type: "error",
                    text: errorString
                });

            });
    }, {
        rememberMe: true,
        jsonp: true
    });
    api.call("Get", {
        "typeName": "Device"
    }, function (result) {
        $scope.lstDeviceGeotab = result;
        $scope.lstDeviceGeotab.forEach(function (device) {
            vehiculos[device.id] = device;
            $scope.lstDevice.id = device.id;
        });
        $scope.$apply();
    }, function (e) {
        console.error("Failed:", e.message);
    });

    //Componente select devices
    $scope.showList = false;
    $scope.listHeight = 100;
    $scope.allSelected = false;
    $scope.displayedItems = 25;
    $scope.selecteditems = [];
    $scope.loadMore = function () {
        $scope.displayedItems += 25;
    };
    $('#list').on('scroll', function (e) {
        var nav = $('.entityNavigator');
        if (e.target.scrollTop + e.target.offsetHeight > nav.height()) {
            if ($scope.displayedItems < $scope.items.length) {
                $scope.displayedItems += 25;
            }
            $scope.$apply();
        }

    });

    $scope.show = function ($event) {
        $scope.showList = !$scope.showList;
        var position = $event.target.getBoundingClientRect();
        $scope.listHeight = $(window).height() - (position.top + 20 + 20);
    };

    $scope.close = function () {
        $scope.showList = false;
    };

    $scope.select = function (item) {
        if (item.checked === true) {
            $scope.selecteditems.push(item);
        } else {
            $scope.selecteditems.splice($scope.selecteditems.indexOf(item), 1);
        }
        if ($scope.lstDeviceGeotab.length === $scope.selecteditems.length) {
            $scope.allSelected = true;
        } else {
            $scope.allSelected = false;
        }
    };

    $scope.selectAll = function () {
        $scope.allSelected = !$scope.allSelected;
        for (var i = 0; i < $scope.lstDeviceGeotab.length; i++) {
            $scope.lstDeviceGeotab[i].checked = $scope.allSelected;
        }
        if ($scope.allSelected === true) {
            $scope.selecteditems = JSON.parse(JSON.stringify($scope.lstDeviceGeotab));
        } else {
            $scope.selecteditems = [];
        }
    };

    $scope.unSelectAll = function () {
        $scope.allSelected = false;
        for (var i = 0; i < $scope.lstDeviceGeotab.length; i++) {
            $scope.lstDeviceGeotab[i].checked = $scope.allSelected;
        }
        $scope.selecteditems = [];
    };


    //************************************************************************************ */
    $scope.lstDeviceGeotab = [];
    $scope.dispositivoSeleccionado = [];
    $scope.lstDevice = [];
    $scope.resultConsultaVehiculos = [];
    $scope.resultReporteFechas = [];
    $scope.resultConsultaVehiculosFiltro = [];
    $scope.resultadoFechas = [];
    $scope.resultadoVehiculos = [];
    $scope.vinNameDevice = [];
    $scope.totalcirculo = [];
    $scope.resultApi = [];
    $scope.Data = {
        start: new Date(),
        end: new Date()
    };
    $scope.dia = new Date();
    $scope.eventos = [];
    var vehiculos = {};


    /* Inicio Api calls Geotab*/


    /*$window.addEventListener('click', function (e) {
        $mdSelect.hide();
    });*/
    /* $window.addEventListener("click", function (e) {
         // $mdSelect.hide();
     });*/

    $scope.selected = [];
    $scope.options = {
        boundaryLinks: true,
        rowSelection: true
    }
    $scope.query = {
        order: 'GOId',
        limit: 5,
        page: 1
    };
    $scope.logPagination = function (page, limit) {
        console.log('page: ', page);
        console.log('limit: ', limit);
    }


    // funcion que permite ingresar texto en el search 
    $scope.updateSearch = function updateSearch(e) {
        e.stopPropagation();
    };

    $scope.getDevice = function (device) {
        try {
            $scope.dispositivoSeleccionado = device;
            $scope.$apply();

        } catch (error) {
            console.log(error.message);
        }
    }
    $scope.fechasreport = function () {

        // $scope.dispositivoSeleccionado = $scope.lstDeviceGeotab;

        swal({
            imageUrl: '../img/cargando5.gif',
            timer: 5000,
            showConfirmButton: false
        });
        var conAjax = $http.post("https://cppa.metricamovil.com/PMFReports/DateReport", {
            start: moment($scope.Data.start).format('MM-DD-YYYY'),
            end: moment($scope.Data.end).format('MM-DD-YYYY')
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function successCallback(response) {
            console.log(response);

            $scope.resultReporteFechas = response.data;
            if ($scope.resultReporteFechas.length === 0) {
                swal({
                    type: 'error',
                    //title: 'Oops...',
                    text: 'No existen registros en el rango de fechas seleccionado',
                });
            }

        });
    }

    $scope.consultaDatos = function (deviceId) {
        try {

            var calls = $scope.getCalls(deviceId);

            //api call
            api.multiCall(calls, function (results) {
                console.log(results);

                var totalEventos = {};

                var btnPanico = results[0].filter(function (panico) {
                    return panico.data === 1
                }).length;
                totalEventos.btnPanico = btnPanico;
                var btnCinturon = results[1].filter(function (cinturon) {
                    return cinturon.data === 1
                }).length;
                totalEventos.btncinturon = btnCinturon;
                var btnReversa = results[2].filter(function (reversa) {
                    return reversa.data === 1
                }).length;
                totalEventos.btnReversa = btnReversa;
                var btnCirculo5 = results[3].filter(function (circulo5) {
                    return circulo5.data === 1
                }).length;
                totalEventos.btnCirculo5 = btnCirculo5;
                var btnCirculo6 = results[4].filter(function (circulo6) {
                    return circulo6.data === 1
                }).length;
                totalEventos.btncirculo6 = btnCirculo6;
                var btnCirculo7 = results[5].filter(function (circulo7) {
                    return circulo7.data === 1
                }).length;
                totalEventos.btncirculo7 = btnCirculo7;
                var btnCirculo8 = results[6].filter(function (circulo8) {
                    return circulo8.data === 1
                }).length;
               
                var conAjax = $http.post("https://cppa.metricamovil.com/PMFReports/DeviceReport", JSON.stringify({
                    devices: [deviceId],
                    start: moment($scope.Data.start).add('hours', 5).format('YYYY-MM-DD HH:mm:ss'),
                    end: moment($scope.Data.end).add('hours', 5).format('YYYY-MM-DD HH:mm:ss')
                })).then(function successCallback(response) {
                    console.log(response);
                    $scope.resultApi = response.data;
                    totalEventos.btncirculo8 = btnCirculo8;
                    totalEventos.comunicacion = results[7][0].dateTime;

                    totalEventos.ids = deviceId;
                    totalEventos.serialNumber = vehiculos[deviceId].serialNumber;
                    totalEventos.vehicleIdentificationNumber = vehiculos[deviceId].vehicleIdentificationNumber;
                    totalEventos.name = vehiculos[deviceId].name;
                    totalEventos.idSuntech = $scope.resultApi[0].deviceId;
                    totalEventos.panicoSuntech = $scope.resultApi[0].panicButtons;
                    totalEventos.llamadas = $scope.resultApi[0].calls;
                    totalEventos.paroMotor = $scope.resultApi[0].Out2;                    
                    totalEventos.lastComunicacion = $scope.resultApi[0].lastCommunication;
                    $scope.eventos.push(totalEventos);
                    //$scope.$apply();
                    
                }, function errorCallback(response) {
                    console.log(response);
                })

                /*totalEventos.btncirculo8 = btnCirculo8;
                totalEventos.comunicacion = results[7][0].dateTime;

                totalEventos.ids = deviceId;
                totalEventos.serialNumber = vehiculos[deviceId].serialNumber;
                totalEventos.vehicleIdentificationNumber = vehiculos[deviceId].vehicleIdentificationNumber;
                totalEventos.name = vehiculos[deviceId].name;
                $scope.eventos.push(totalEventos);
                $scope.$apply();*/



            }, function (e) {
                console.log(e.message);
            });
        } catch (error) {
            console.log(error.message);
        }
    }


    $scope.consultaVehiculos = function () {
        try {
            $scope.dispositivoSeleccionadoAux = this.selecteditems;
            if ($scope.dispositivoSeleccionadoAux.length === 0) {
                swal({
                    type: 'error',
                    text: 'Debes seleccionar un vehículo para continuar la consulta.'
                });
            }

            if ($scope.dispositivoSeleccionadoAux.length > 0) {

                $scope.dispositivoSeleccionadoAux.forEach(function (dispositivo) {
                    $scope.consultaDatos(dispositivo.id);
                    swal({
                        imageUrl: 'https://rawgit.com/MayraDelgado/reportes/master/app/img/cargando5.gif',
                        timer: 8000,
                        showConfirmButton: false,
                        background: 'rgba(100,100,100,0)'
                    });
                });

            }

        } catch (error) {
            console.log(error.message);
        }
    }

    /* $scope.consultaVehiculos = function () {
         try {
             $scope.dispositivoSeleccionadoAux = this.dispositivoSeleccionado;
             if ($scope.dispositivoSeleccionadoAux.length === 0) {
                 $('#container').waitMe({
                     effect: 'pulse',
                     text: '',
                     bg: rgba(255, 255, 255, 0.7),
                     color: '#000',
                     maxSize: '',
                     waitTime: -1,
                     textPos: 'vertical',
                     fontSize: '',
                     source: '',
                     onClose: function () {}
                 });
             }
         } catch (error) {
             console.log(error.message);
         }
     }*/


    $scope.crearCSVFechas = function () {
        if ($scope.resultReporteFechas.length === 0) {
            swal(
                '',
                'No hay datos que descargar',
                "error",
            )
            console.log("No hay datos que descargar");
        } else
        if ($scope.resultReporteFechas.length > 0) {
            $("#fechaInstalacion").table2excel({
                filename: "AuditoríadeRegistros_Fechas"
            });
        }

    }
    $scope.crearCSVvehiculo = function () {
        if ($scope.eventos.length === 0) {
            swal(
                '',
                'No hay datos que descargar',
                "error",
            )
            console.log("No hay datos que descargar");
        } else
        if ($scope.eventos.length > 0) {
            /*$("#fechaDevice").table2excel({
                filename: "AuditoríadeRegistros_Dispositivos"
            });*/
            Exporter.export(fechaDevice, 'Registros_Dispositivos.xls', 'Data');
            //return false;
             refresh();
        }
   
    }
    function refresh(){
        location.reload(true);
    }

    $scope.getCalls = function (deviceId) {
        try {
            var ids = [
                "diagnosticAux1Id",
                "diagnosticAux2Id",
                "diagnosticAux3Id",
                "diagnosticAux5Id",
                "diagnosticAux6Id",
                "diagnosticAux7Id",
                "diagnosticAux8Id",
            ];
            var calls = [];

            ids.forEach(function (id) {
                calls.push(
                    ["Get", {
                        "typeName": "StatusData",
                        "search": {
                            "deviceSearch": {
                                "id": deviceId
                            },
                            "diagnosticSearch": {
                                "id": id
                            },
                            "fromDate": moment($scope.Data.start).add('hours', 5).format('YYYY-MM-DD HH:mm:ss'),
                            "toDate": moment($scope.Data.end).add('hours', 5).format('YYYY-MM-DD HH:mm:ss')
                        }
                    }]);
            });
            calls.push(
                ["Get", {
                    "typeName": "DeviceStatusInfo",
                    "search": {
                        "deviceSearch": {
                            "id": deviceId
                        }
                    }
                }]
            )
            return calls;
        } catch (error) {
            console.log(error.message);
            return error;
        }
    }
}]);
app.config(function ($mdDateLocaleProvider) {
    $mdDateLocaleProvider.formatDate = function (date) {
        return moment(date).format('MM-DD-YYYY');
    }
});
