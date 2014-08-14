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
	    this.showFEs = false;
	    this.showRelations = false;

	    activate();

	    this.toggle = function(what) {
		infoCtrl[what] = !infoCtrl[what];
	    };

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
    }
})();
