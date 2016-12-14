angular.module('searchApp', ['ngSanitize', 'algoliasearch'])
.controller('SearchController', ['$scope', '$sce', 'algolia', '$q', function($scope, $sce, algolia, $q) {
    var algolia = algolia.Client('BVC5SUAF7Y', '3d5444b71f55b27a26ae8075604beb11');
    var hitsPerPage = 3;
    var latLngParam;
    var vm = this;
    vm.q = '';
    vm.content = null;
    vm.toggleRefine = toggleRefine;
    vm.toggleDisRefine = toggleDisRefine;
    vm.showMore = showMore;
    vm.paymentOptions;
    vm.foodType;
    vm.starsRoundedWhole = [{name: 0},{name: 1},{name: 2},{name: 3},{name: 4},{name: 5}];

    vm.helper = algoliasearchHelper(algolia, 'rest_search', {
        facets: ['food_type','payment_options'],
        disjunctiveFacets: ['stars_rounded_whole'],
        hitsPerPage: hitsPerPage,
        maxValuesPerFacet: 7,
        getRankingInfo: true,
        aroundLatLng: latLngParam
    });

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
            latLngParam = position.coords.latitude + ',' + position.coords.longitude;
            vm.helper.setQueryParameter('aroundLatLng', latLngParam).search();
        });
    } else {
        //geolocation IS NOT available do nothing
    }

    vm.helper.on('result', function(content) {
        if(!vm.paymentOptions)
            vm.paymentOptions = content.getFacetValues('payment_options');
        if(!vm.foodType)
            vm.foodType = content.getFacetValues('food_type');
        //vm.starsRoundedWhole = content.getFacetValues('stars_rounded_whole', {sortBy: ['name:asc']});
        vm.processTime = (content.processingTimeMS / 1000) % 60;
        vm.hits = content.nbHits;
        vm.pages = content.nbPages;
        vm.page = content.page + 1;

        content.hits.map(function(item){
            item.starsRounded = Math.round(item.stars_count*2)/2;
            item.starClass = Math.floor(item.starsRounded) + '-' + String(item.starsRounded % 1) * 10;
            return item;
        });
        $scope.$apply(function() {
            vm.content = content;
        });
    });

    $scope.$watch('SearchController.q', function(q) {
        vm.helper.setQuery(q).search();
    });

    // run an initial search based upon IP
    vm.helper.setQueryParameter('aroundLatLngViaIP', true).search();

    function toggleRefine ($event, facet, value) {
        $event.preventDefault();
        var currentFacet = vm.helper.getRefinements(facet);

        if(currentFacet[0] && currentFacet[0].value != value){
            vm.helper.clearRefinements(facet);
        }
        vm.helper.toggleRefine(facet, value).search();
    }
    function toggleDisRefine ($event, facet, value) {
        $event.preventDefault();
        vm.helper.toggleRefine(facet, value).search();
    }

    function showMore(){
        hitsPerPage += hitsPerPage;
        vm.helper.state.hitsPerPage = hitsPerPage;
        vm.helper.search();
        //vm.helper.setHitsPerPage(hitsPerPage).search();
    }
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
