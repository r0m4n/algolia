<?php
// initialize API Client & Index
include('algoliasearch-client-php-master/algoliasearch.php');
$client = new \AlgoliaSearch\Client("BVC5SUAF7Y", "fef3f3ffdeb548da18aba98395cf3533");
$index = $client->initIndex('instant_search');
$csv = array_map('str_getcsv', file('restaurants_info.csv'));

if ($csv){
    $batch = array();
    // iterate over results and send them by batch of 10000 elements
    foreach ($csv as $row){
        $new_row = array();


        // select the identifier of this row
        //"objectID","food_type","stars_count","reviews_count","neighborhood","phone_number","price_range","dining_style"
        $new_row['objectID'] = $row[0];
        $new_row['food_type'] = $row[1];
        $new_row['stars_count'] = $row[2];
        $new_row['reviews_count'] = $row[3];
        $new_row['neighborhood'] = $row[4];
        $new_row['phone2'] = $row[5];
        $new_row['price_range'] = $row[6];
        $new_row['dining_style'] = $row[7];
        array_push($batch, $new_row);
    }
    echo 'Attempting load:';
    $res = $index->partialUpdateObjects($batch);
    echo 'Result:'.$res;
}else{
    echo 'Failed';
}
