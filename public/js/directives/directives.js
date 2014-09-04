
String.prototype.splice = function(idx, rem, s) {
    return (this.slice(0, idx) + s + this.slice(idx + Math.abs(rem)));
};

PMan.directive('caroufredsel', function  () {
  return {
    restrict: 'A',
    link: function  (scope, element, attrs) {
      $(element).carouFredSel({
          auto: {
              play: false,
              responsive: true,
              width: '100%',
              scroll: 2,
              pauseOnHover: 'resume',
              progress: '#timer1'
          },
          prev: "#carouselLeft",
          next: "#carouselRight"
      }, {
          transition: true
      });
    }
  }
});
var validityFromController;
var validityToController;
PMan.directive('bDatepicker', function(){
    return {
      require: '?ngModel',
      restrict: 'A',
      link: function ($scope, element, attrs, controller) {
            var updateModel, onblur;
            var dateFormat = "MM/DD/YYYY";
            
            if (controller != null) {

                updateModel = function (event) {
//                    alert(controller.$name);
                    if (controller.$name == 'validityFrom') {
                        validityFromController = controller;
                    } else if (controller.$name == 'validityTo') {
                        validityToController = controller;
                    }
                	var today = new Date();
            		today.setHours(0,0,0,0);
            		var b = moment.duration(0, 'd');
            		var yesterday = moment(today).subtract(b);
            		$scope.today = moment(today).format(dateFormat);
            		$scope.yesterday = moment(yesterday).format(dateFormat);
            		
            		controller.$setValidity('afterToday', true);
            		controller.$setValidity('afterYesterday', true);
            		controller.$setValidity('selectFrom', true);
            		controller.$setValidity('afterFrom', true);
            		
            		if($(element).hasClass('effective') || $(element).hasClass('delivery')) {
                		if(event.date < today) {
                			controller.$setValidity('afterToday', false);
                		}
                	} 
                	else if($(element).attr("id") == 'validityFrom') {
                		if(event.date < yesterday) {
                			controller.$setValidity('afterYesterday', false);
                		}
                		
                		var toVal = $('#validityTo').val();
                		if(toVal != undefined && toVal != '' && toVal != null) {
                			var to = moment(toVal, dateFormat);
                            var eventDate = event.date;
//                            angular.copy(eventDate, event.date);
                            eventDate = new Date(eventDate);
                            eventDate.setHours(0,0,0,0);
                			if(eventDate > to) {
                				$('#validityTo').datepicker("setDate", new Date(event.date));
                				$('#validityTo').datepicker('update');
                                if (typeof validityToController != 'undefined') {
                                    validityToController.$setValidity('afterFrom', true);
                                }
                			}
                		}
                	}
                	else if($(element).attr("id") == 'validityTo') {
                		var fromVal = $('#validityFrom').val();

                		if(fromVal == undefined || fromVal == '' || fromVal == null) {
                			controller.$setValidity('selectFrom', false);
                    		element.val('');
                		} else {
                			var from = moment(fromVal, dateFormat);
                            var eventDate2 = event.date;
                            eventDate2 = new Date(eventDate2);
                            eventDate2.setHours(0,0,0,0);
                			if(eventDate2 < from) {
                				$scope.validityFromDate = from.format(dateFormat);
                				controller.$setValidity('afterFrom', false);
                			}
                    	}
                	}
                    $(element).datepicker('hide');
                    $(element).blur();
                };

                onblur = function () {
                    //we'll update the model in the blur() handler
                    //because it's possible the user put in an invalid date
                    //in the input box directly.
                    //Bootstrap datepicker will have overwritten invalid values
                    //on blur with today's date so we'll stick that in the model.
                    //this assumes that the forceParse option has been left as default(true)
                    //https://github.com/eternicode/bootstrap-datepicker#forceparse
                    var date = element.val();
                    return $scope.$apply(function () {
                        return controller.$setViewValue(date);
                    });
                };

                controller.$render = function () {
                    var date = controller.$viewValue;
                    if (angular.isDefined(date) && typeof date == 'number') {
                        date = new Date(date);
                    }

                    if (angular.isDefined(date) && date != null && angular.isDate(date))
                    {
                    	$(element).datepicker('setDate', date);
//                        $(element).datepicker().data().datepicker.date = date;
//                        $(element).datepicker('setValue');
                        $(element).datepicker('update');
                    } else if (angular.isDefined(date)) {
                        throw new Error('ng-Model value must be a Date object - currently it is a ' + typeof date + ' - use ui-date-format to convert it from a string');
                    }
                    return controller.$viewValue;
                };
            }
            return attrs.$observe('bDatepicker', function (value) {
                var options;
                options = {
                    format: 'mm/dd/yyyy'
                };
                if (angular.isObject(value)) {
                    options = value;
                }
                if (typeof (value) === "string" && value.length > 0) {
                    options = angular.fromJson(value);
                }
                return $(element).datepicker(options).on('changeDate', updateModel).on('blur', onblur);
            });
        }
    };
});

PMan.directive('aDatepicker', function(){
    return {
        require: '?ngModel',
        restrict: 'A',
        link: function ($scope, element, attrs, controller) {
            var updateModel, onblur;
            var dateFormat = "MM/DD/YYYY";

            if (controller != null) {

                updateModel = function (event) {
//                    alert(controller.$name);
                    if (controller.$name == 'validityFrom') {
                        validityFromController = controller;
                    } else if (controller.$name == 'validityTo') {
                        validityToController = controller;
                    }
                    var today = new Date();
                    today.setHours(0,0,0,0);
                    var b = moment.duration(0, 'd');
                    var yesterday = moment(today).subtract(b);
                    $scope.today = moment(today).format(dateFormat);
                    $scope.yesterday = moment(yesterday).format(dateFormat);

                    controller.$setValidity('afterToday', true);
                    controller.$setValidity('afterYesterday', true);
                    controller.$setValidity('selectFrom', true);
                    controller.$setValidity('afterFrom', true);

                    if($(element).attr("id") == 'validityFrom') {
                        var toVal = $('#validityTo').val();
                        if(toVal != undefined && toVal != '' && toVal != null) {
                            var to = moment(toVal, dateFormat);
                            var eventDate = event.date;
//                            angular.copy(eventDate, event.date);
                            eventDate = new Date(eventDate);
                            eventDate.setHours(0,0,0,0);
                            if(eventDate > to) {
                                $('#validityTo').datepicker("setDate", new Date(event.date));
                                $('#validityTo').datepicker('update');
                                if (typeof validityToController != 'undefined') {
                                    validityToController.$setValidity('afterFrom', true);
                                }
                            }
                        }
                    }
                    else if($(element).attr("id") == 'validityTo') {
                        var fromVal = $('#validityFrom').val();

                        if(fromVal == undefined || fromVal == '' || fromVal == null) {
                            controller.$setValidity('selectFrom', false);
                            element.val('');
                        } else {
                            var from = moment(fromVal, dateFormat);
                            var eventDate2 = event.date;
                            eventDate2 = new Date(eventDate2);
                            eventDate2.setHours(0,0,0,0);
                            if(eventDate2 < from) {
                                $scope.validityFromDate = from.format(dateFormat);
                                $('#validityTo').datepicker("setDate", new Date(from));
                                $('#validityTo').datepicker('update');
                                if (typeof validityToController != 'undefined') {
                                    $scope.validityTo = from.format(dateFormat);
                                }
                            }
                        }
                    }
                    $(element).datepicker('hide');
                    $(element).blur();
                };

                onblur = function () {
                    //we'll update the model in the blur() handler
                    //because it's possible the user put in an invalid date
                    //in the input box directly.
                    //Bootstrap datepicker will have overwritten invalid values
                    //on blur with today's date so we'll stick that in the model.
                    //this assumes that the forceParse option has been left as default(true)
                    //https://github.com/eternicode/bootstrap-datepicker#forceparse
                    var date = element.val();
                    return $scope.$apply(function () {
                        return controller.$setViewValue(date);
                    });
                };

                controller.$render = function () {
                    var date = controller.$viewValue;
                    if (angular.isDefined(date) && typeof date == 'number') {
                        date = new Date(date);
                    }

                    if (angular.isDefined(date) && date != null && angular.isDate(date))
                    {
                        $(element).datepicker('setDate', date);
//                        $(element).datepicker().data().datepicker.date = date;
//                        $(element).datepicker('setValue');
                        $(element).datepicker('update');
                    } else if (angular.isDefined(date)) {
                        throw new Error('ng-Model value must be a Date object - currently it is a ' + typeof date + ' - use ui-date-format to convert it from a string');
                    }
                    return controller.$viewValue;
                };
            }
            return attrs.$observe('aDatepicker', function (value) {
                var options;
                options = {
                    format: 'mm/dd/yyyy'
                };
                if (angular.isObject(value)) {
                    options = value;
                }
                if (typeof (value) === "string" && value.length > 0) {
                    options = angular.fromJson(value);
                }
                return $(element).datepicker(options).on('changeDate', updateModel).on('blur', onblur);
            });
        }
    };
});

var INTEGER_REGEXP = /^\d+$/;
PMan.directive('integer', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function(viewValue) {
        if (INTEGER_REGEXP.test(viewValue)) {
          // it is valid
          ctrl.$setValidity('integer', true);
          return viewValue;
        } else {
          // it is invalid, return undefined (no model update)
          ctrl.$setValidity('integer', false);
          return undefined;
        }
      });
    }
  };
});

var INTEGER_REGEXP = /^[a-zA-Z0-9]*$/;
PMan.directive('alphanum', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function(viewValue) {
                if (INTEGER_REGEXP.test(viewValue)) {
                    // it is valid
                    ctrl.$setValidity('alphanum', true);
                    return viewValue;
                } else {
                    // it is invalid, return undefined (no model update)
                    ctrl.$setValidity('alphanum', false);
                    return undefined;
                }
            });
        }
    };
});

var FLOAT_REGEXP = /^(\-?\d+((\.|\,)\d+)?)?$/;
PMan.directive('smartFloat', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function(viewValue) {
        if (FLOAT_REGEXP.test(viewValue)) {
          ctrl.$setValidity('float', true);
          return parseFloat(viewValue.replace(',', '.'));
        } else {
          ctrl.$setValidity('float', false);
          return undefined;
        }
      });
    }
  };
});

PMan.directive('datepicker', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope,filter, element, attr, ngModel) {
            var date = element.val();
            var formattedDate = filter('date')(date, 'MM/dd/yyyy');
            return formattedDate;
        }
    };
});

PMan.filter('paginationnew', function(){
     return function(input, start){
      start = +start;
      return input.slice(start);
    };
});

PMan.constant('paginationConfig', {
  boundaryLinks: false,
  directionLinks: true,
  firstText: 'First',
  previousText: 'Prev',
  nextText: 'Next',
  lastText: 'Last'
})

PMan.directive('pagination', ['paginationConfig', function(paginationConfig) {
  return {
    restrict: 'EA',
    scope: {
      numPages: '=',
      currentPage: '=',
      maxSize: '=',
      onSelectPage: '&'
    },
    templateUrl: 'partials/pagination.html',
    replace: true,
    link: function(scope, element, attrs) {

      // Setup configuration parameters
      var boundaryLinks = angular.isDefined(attrs.boundaryLinks) ? scope.$eval(attrs.boundaryLinks) : paginationConfig.boundaryLinks;
      var directionLinks = angular.isDefined(attrs.directionLinks) ? scope.$eval(attrs.directionLinks) : paginationConfig.directionLinks;
      var firstText = angular.isDefined(attrs.firstText) ? attrs.firstText : paginationConfig.firstText;
      var previousText = angular.isDefined(attrs.previousText) ? attrs.previousText : paginationConfig.previousText;
      var nextText = angular.isDefined(attrs.nextText) ? attrs.nextText : paginationConfig.nextText;
      var lastText = angular.isDefined(attrs.lastText) ? attrs.lastText : paginationConfig.lastText;

      // Create page object used in template
      function makePage(number, text, isActive, isDisabled) {
        return {
          number: number,
          text: text,
          active: isActive,
          disabled: isDisabled
        };
      }

      scope.$watch('numPages + currentPage + maxSize', function() {
        scope.pages = [];

        // Default page limits
        var startPage = 1, endPage = scope.numPages;

        // recompute if maxSize
        if ( scope.maxSize && scope.maxSize < scope.numPages ) {
          startPage = Math.max(scope.currentPage - Math.floor(scope.maxSize/2), 1);
          endPage   = startPage + scope.maxSize - 1;

          // Adjust if limit is exceeded
          if (endPage > scope.numPages) {
            endPage   = scope.numPages;
            startPage = endPage - scope.maxSize + 1;
          }
        }

        // determine which pages to show
        var maxDisplayPages = 3;
        var startDisplayPage;
        if(scope.currentPage - (maxDisplayPages/2) <= startPage) {
          // towards left edge
          startDisplayPage = startPage;
        } else if(scope.currentPage + (maxDisplayPages/2) >= endPage) {
          // towards right edge
          startDisplayPage = endPage - maxDisplayPages + 1;
        } else {
          // in the mid-section of pages
          startDisplayPage = scope.currentPage - maxDisplayPages/2;
        }

        // Add page number links
        var displayCount = maxDisplayPages;
        for (var number = startPage; number <= endPage; number++) {
          if(number >= startDisplayPage && displayCount > 0) {
            var page = makePage(number, number, scope.isActive(number), false);
            scope.pages.push(page);
            displayCount -= 1;
          }
        }

        // Add previous & next links
        if (directionLinks) {
          var previousPage = makePage(scope.currentPage - 1, previousText, false, scope.noPrevious());
          scope.pages.unshift(previousPage);

          var nextPage = makePage(scope.currentPage + 1, nextText, false, scope.noNext());
          scope.pages.push(nextPage);
        }

        // Add first & last links
        if (boundaryLinks) {
          var firstPage = makePage(1, firstText, false, scope.noPrevious());
          scope.pages.unshift(firstPage);

          var lastPage = makePage(scope.numPages, lastText, false, scope.noNext());
          scope.pages.push(lastPage);
        }


        if ( scope.currentPage > scope.numPages ) {
          scope.selectPage(scope.numPages);
        }
      });
      scope.noPrevious = function() {
        return scope.currentPage === 1;
      };
      scope.noNext = function() {
        return scope.currentPage === scope.numPages;
      };
      scope.isActive = function(page) {
        return scope.currentPage === page;
      };

      scope.selectPage = function(page) {
        if ( ! scope.isActive(page) && page > 0 && page <= scope.numPages) {
          scope.currentPage = page;
          scope.onSelectPage({ page: page });
        }
      };
    }
  };
}]);

PMan.directive('quantityCheck', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function(qtyNew) {
                if (scope.lineItem.qty < qtyNew) {
                    // it is invalid, return undefined (no model update)
                    this.ctrl.$setValidity('quantityCheck', false);
                    return undefined;
                } else {
                    // it is valid
                    ctrl.$setValidity('quantityCheck', true);
                    return qtyNew;
                }
            });
        }
    };
});

PMan.directive('currencyInput', function() {
    return {
        restrict: 'A',
        scope: {
            field: '='
        },
        replace: true,
        template: '<span><input type="text" ng-model="field"></input>{{field}}</span>',
        link: function(scope, element, attrs) {

            $(element).bind('keyup', function(e) {
                var input = element.find('input');
                var inputVal = input.val();

                //clearing left side zeros
                while (scope.field.charAt(0) == '0') {
                    scope.field = scope.field.substr(1);
                }

                scope.field = scope.field.replace(/[^\d.\',']/g, '');

                var point = scope.field.indexOf(".");
                if (point >= 0) {
                    scope.field = scope.field.slice(0, point + 3);
                }

                var decimalSplit = scope.field.split(".");
                var intPart = decimalSplit[0];
                var decPart = decimalSplit[1];

                intPart = intPart.replace(/[^\d]/g, '');
                if (intPart.length > 3) {
                    var intDiv = Math.floor(intPart.length / 3);
                    while (intDiv > 0) {
                        var lastComma = intPart.indexOf(",");
                        if (lastComma < 0) {
                            lastComma = intPart.length;
                        }

                        if (lastComma - 3 > 0) {
                            intPart = intPart.splice(lastComma - 3, 0, ",");
                        }
                        intDiv--;
                    }
                }

                if (decPart === undefined) {
                    decPart = "";
                }
                else {
                    decPart = "." + decPart;
                }
                var res = intPart + decPart;

                scope.$apply(function() {scope.field = res});

            });

        }
    };
});
PMan.directive('ckEditor', function() {
    return {
        require: '?ngModel',
        link: function(scope, elm, attr, ngModel) {
            var ck = CKEDITOR.replace(elm[0]);

            if (!ngModel) return;

            ck.on('pasteState', function() {
                scope.$apply(function() {
                    ngModel.$setViewValue(ck.getData());
                });
            });

            ngModel.$render = function(value) {
                ck.setData(ngModel.$viewValue);
            };
        }
    };
});