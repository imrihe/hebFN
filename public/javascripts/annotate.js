
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
