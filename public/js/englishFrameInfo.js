(function(){
    angular.module('hebFN.englishFrame', ['ngSanitize']).
	directive('englishFrameInfo', englishFrameInfo).
	directive('defRoot', definition).
	directive('ex', ex).
	directive('fex', fex);


    englishFrameInfo.$inject = ['$compile'];

    function englishFrameInfo($compile){
	return {
	    templateUrl: 'partials/english-frame-info.html',
	    restrict: 'E',
	    scope: {frameData: '='},
	    link: linker
	};

	function linker(scope, element, attrs) {

	    scope.toggle = function(what) {
		scope[what] = !scope[what];
	    };
	    
	    var unWatch = scope.$watch('frameData', function(n, o){
		if (!n) return; 

		$('#frame-definition').html($compile(n.frame.definition)(scope).html());
		unWatch();
	    });
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
		var feConfig = scope.frameData.frame.FE.filter(
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
