angular.module('searchApp', ['ngSanitize', 'algoliasearch'])
.controller('searchController', ['$scope', '$sce', 'algolia', '$q', function($scope, $sce, algolia, $q) {
    var algolia = algolia.Client('BVC5SUAF7Y', 'c196706d8976847f9c55b77930e36a92');
    var hitsPerPage = 3;

    var latLngParam;

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
            latLngParam = position.coords.latitude + ',' + position.coords.longitude;
            $scope.helper.search();
        });
    } else {
        //geolocation IS NOT available
    }

    $scope.q = '';
    $scope.content = null;

    $scope.helper = algoliasearchHelper(algolia, 'rest_search', {
        facets: ['food_type','payment_options'],
        disjunctiveFacets: ['stars_count'],
        hitsPerPage: hitsPerPage,
        maxValuesPerFacet: 7,
        getRankingInfo: true,
        aroundLatLng: latLngParam
    });
    $scope.helper.on('result', function(content) {
        $scope.paymentOptions = content.getFacetValues('payment_options');
        $scope.foodType = content.getFacetValues('food_type');
        $scope.processTime = (content.processingTimeMS / 1000) % 60;
        $scope.hits = content.nbHits;
        $scope.pages = content.nbPages;
        $scope.page = content.page + 1;

        content.hits.map(function(item){
            item.starsRounded = Math.round(item.stars_count*2)/2;
            item.starClass = Math.floor(item.starsRounded) + '-' + String(item.starsRounded % 1) * 10;
            return item;
        });
        $scope.$apply(function() {
            $scope.content = content;
        });
    });
    $scope.toggleRefine = function($event, facet, value) {
        $event.preventDefault();
        $scope.helper.toggleRefine(facet, value).search();
    };
    $scope.showMore = function(){
        hitsPerPage += hitsPerPage;
        $scope.helper.state.hitsPerPage = hitsPerPage;
        $scope.helper.search();
        //$scope.helper.setHitsPerPage(hitsPerPage).search();
    }
    $scope.$watch('q', function(q) {
        $scope.helper.setQuery(q).search();
    });

    $scope.helper.search();
    //$scope.helper.removeFacetExclusion('payment_options', 'Diners Club');
}]);

/*
$().ready(function() {
    var search = instantsearch({
        // Replace with your own values
        appId: 'BVC5SUAF7Y',
        apiKey: 'c196706d8976847f9c55b77930e36a92', // search only API key, no ADMIN key
        indexName: 'instant_search',
        urlSync: true
    });
    search.addWidget(
        instantsearch.widgets.searchBox({
            container: '#search-input',
            placeholder: 'Search for products'
        })
    );

    search.addWidget(
        instantsearch.widgets.hits({
            container: '#hits',
            hitsPerPage: 10,
            templates: {
                item: getTemplate('hit'),
                empty: getTemplate('no-results')
            },
            transformData: function(hit) {
                hit.starsRounded = Math.round(hit.stars_count*2)/2;
                hit.starClass = Math.floor(hit.starsRounded) + '-' + String(hit.starsRounded % 1) * 10;
                return hit;
            }
        })
    );
    search.addWidget(
        instantsearch.widgets.stats({
            container: '#stats'
        })
    );
    search.addWidget(
        instantsearch.widgets.menu({
            container: '#type',
            attributeName: 'food_type',
            limit: 7,
            sortBy: ['count:desc', 'name:asc']
        })
    );

    search.addWidget(
        instantsearch.widgets.starRating({
            container: '#stars',
            attributeName: 'stars_count',
            max: 5,
            labels: {
                andUp: '& Up'
            }
        })
    );

    search.addWidget(
        instantsearch.widgets.menu({
            container: '#payment_options',
            attributeName: 'payment_options',
            limit: 7,
            sortBy: ['count:desc', 'name:asc']
        })
    );

    search.start();


    function getTemplate(templateName) {
        return document.getElementById(templateName + '-template').innerHTML;
    }
});

*/
