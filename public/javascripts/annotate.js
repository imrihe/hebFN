
var app=angular.module('annotate', ['utils']).//['ngSanitize']
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/', {templateUrl: 'annotate/partials/home',   controller: HomeCtrl}).
      when('/explore', {templateUrl: 'annotate/partials/explore', controller: FramesIdxCtrl,reloadOnSearch:false}).
      when('/add-lus/:frame', {templateUrl: 'annotate/partials/add-lus', controller: AddLUsCtrl,reloadOnSearch:false}).
      when('/add-sentences/:framename/:luname', {templateUrl: 'annotate/partials/add-sents', controller: AddSentsCtrl,reloadOnSearch:false}).
      when('/edit-lu/:framename/:luname/:lupos', {templateUrl: 'annotate/partials/edit-lu', controller: EditLuCtrl,reloadOnSearch:false}).
      when('/marker/:frame/:lu', {templateUrl: 'annotate/partials/marker', controller: MarkerCtrl,reloadOnSearch:false}).
      otherwise({redirectTo: '/'});
}]);


/* 
function UpdateTextHighlights()
{
    var fens=$("fen");
    for (var i =0;i< fens.length;i++) {
        //alert(fens[i].innerText);
    }
}*/



app.filter('startFrom', function() {
    return function(input, start) {
        if(input instanceof Array)
        {
            start = +start; //parse to int
            return input.slice(start);
        }
        else
        {
            return input;
        }
    };
});

app.directive('ngFocus', ['$parse', function($parse) {
  return function(scope, element, attr) {
    var fn = $parse(attr['ngFocus']);
    element.bind('focus', function(event) {
      scope.$apply(function() {
        fn(scope, {$event:event});
      });
    });
  }
}]);
 
app.directive('ngBlur', ['$parse', function($parse) {
  return function(scope, element, attr) {
    var fn = $parse(attr['ngBlur']);
    element.bind('blur', function(event) {
      scope.$apply(function() {
        fn(scope, {$event:event});
      });
    });
  }
}]);

app.directive('initFocus', function() {
    return {
        restrict: 'A', // only activate on element attribute
        link: function(scope, element, attrs) {
            element.focus();
        }
    };
});

app.directive('ngKeyup', function () {     
    return function (scope, element, attrs) {
        element.bind('keyup', function (event) {
          // Get the input value
          var val = this.value;
          
          // Apply the value to the controller
          scope.$apply(function ($parse) {
            // Get the controller function that should be
            // called with the value (val) when a keyup event occurs.
            
            //http://stackoverflow.com/questions/16232917/angularjs-how-to-pass-scope-variables-to-a-directive
            $parse[attrs.ngKeyup](val);
          });
        });
    };
});
