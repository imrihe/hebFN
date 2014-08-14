(function(){
    angular.module('fnExplore').
	directive('frameInfo', frameInfo).
	directive('defRoot', definition).
	directive('ex', ex).
	directive('fex', fex);

    frameInfo.$inject = ['$routeParams', '$compile',  'listFrames', 'frameData'];

    function frameInfo($routeParams, $compile, listFrames, frameData) {
	return {
	    templateUrl: 'partials/explore/frame-info.html',
	    restrict: 'E',
	    controller: infoCtrl,
	    controllerAs: 'exploreInfo'
	};

	function infoCtrl(){
	    var infoCtrl = this;

	    this.info = {};

	    activate();

	    /// initialization ///
	    function activate(){
		listFrames.then(function(response){
		    var data = response.data;
		    var name = ($routeParams.frame || data[0].frame['@name']);
		    frameData.forFrame(name).then(function(response){
			var data = response.data;
			
			infoCtrl.info = data;

			$('#frame-definition').html($compile(infoCtrl.info.engData.frame.definition)(infoCtrl).html());
		    });
		});
	    }
	};
    };

    function definition() {
	return {
	    restrict: 'E',
	    template: function(tElement, tAttrs) {
		return '<span class="def-root">'+tElement.html()+'</span>';
	    }
	};
    }

    function ex() {
	return {
	    restrict: 'E',
	    replace: true,
	    template: function(tElement, tAttrs) {
		return '<span class="ex">'+tElement.html()+'</span>';
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
    }
})();
