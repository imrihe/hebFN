(function(){
    angular.module('hebFN.englishFrame', [
	'ngSanitize',
	'fnServices'
    ]).
	directive('englishFrameInfo', englishFrameInfo).
	directive('defRoot', definition).
	directive('ex', ex).
	directive('fex', fex);


    englishFrameInfo.$inject = ['$compile', 'frameDataManager'];

    function englishFrameInfo($compile, frameDataManager){
	return {
	    templateUrl: 'partials/english-frame-info.html',
	    restrict: 'E',
	    scope: {frameName: '='},
	    link: linker
	};

	function linker(scope, element, attrs) {

	    scope.toggle = function(what) {
		scope[what] = !scope[what];
	    };

	    if (angular.isDefined(scope.frameName)) {
		frameDataManager.frameData(scope.frameName).then(function(response){
		    scope.info = response.data;
		    
		    $('#frame-definition').html($compile(scope.info.engData.frame.definition)(scope).html());
		});
	    }
	}
    };

    function definition() {
	return {
	    restrict: 'E',
	    replace: true,
	    template: function(tElement, tAttrs) {
		return '<div class="def-root">'+tElement.html()+'</div>';
	    }
	};
    }

    function ex() {
	return {
	    restrict: 'E',
	    replace: true,
	    template: function(tElement, tAttrs) {
		return '<div class="ex">'+tElement.html()+'</div>';
	    }
	};
    };

    function fex() {
	return {
	    restrict: 'E',
	    replace: true,
	    template: function(tElement, tAttrs) {
		return '<span class="fex '+tAttrs.name+'" name="'+tAttrs.name+'">'+tElement.html()+'</span>';
	    },
	    link: function(scope, element, attrs) {
		var feConfig = scope.info.engData.frame.FE.filter(
		    function(x){
			return (x['@name'] === attrs.name || x['@abbrev'] === attrs.name);
		    })[0];
		
		if (feConfig) {
		    element.css({
			backgroundColor: '#'+feConfig['@bgColor'],
			color: '#'+feConfig['@fgColor']
		    });
		}
	    }
	};
    };
})();
