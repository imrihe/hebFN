(function(){
    angular.module('hebFN.commentsWidget', []).
	directive('commentsWidget', comments);

    comments.$injector = [];

    function comments() {
	return {
	    restrict: 'E',
	    scope: {
		commentsList: '=',
		postFunction: '&',
		extraComments: '@?'
	    },
	    templateUrl: 'partials/comments-widget.html',
	    link: linker
	};

	function linker(scope, element, attrs) {    
	    var unWatch = scope.$watch('commentsList', function(n, o){
		if (!n) return; 

		if (scope.extraComments) {
		    scope.extraComments.forEach(function(c) {
			n.push(c);
		    });
		}

		n.sort(function(a, b) {
		    a = a.cDate;
		    b = b.cDate;
		    
		    return (a > b) ? -1 : (a < b) ? 1 : 0;
		});
		
		scope.sortedCommentsList = n;
		
		unWatch();
	    });
	};
    }
})();
