<?php
$exp_id=stripcslashes($_POST['exp_id']);
$num_of_true_pairs=$_POST['num_of_true_pairs'];
$num_of_false_pairs=$_POST['num_of_false_pairs'];

$connectionInfo = array("UID" => "avivf@avivtest", "pwd" => "1qaZ2wsX!", "Database" => "avivtest", "LoginTimeout" => 30, "Encrypt" => 1, "TrustServerCertificate" => 0);
$serverName = "tcp:avivtest.database.windows.net,1433";
$conn = sqlsrv_connect($serverName, $connectionInfo);

$final_pairs_order = array();

$sql="select [order] as rel_order
from exp_pairs                       
where exp_id = ".$exp_id." and realConf = 1";

$getResults= sqlsrv_query($conn, $sql);
if ($getResults == FALSE)
{
    echo 'err';
    die();
}

$true_pair_arr=array();
while ($row = sqlsrv_fetch_array($getResults, SQLSRV_FETCH_ASSOC)) {
    array_push($true_pair_arr, $row['rel_order']);
}
sqlsrv_free_stmt($getResults);

$random_true_keys=array_rand($true_pair_arr, $num_of_true_pairs);
foreach ($random_true_keys as $key) {
    array_push($final_pairs_order, $random_true_keys[$key]);
}


$sql="select [order] as rel_order                      
from exp_pairs                       
where exp_id = ".$exp_id." and realConf = 0";

$getResults= sqlsrv_query($conn, $sql);
if ($getResults == FALSE)
{
    echo 'err';
    die();
}

$false_pair_arr=array();
while ($row = sqlsrv_fetch_array($getResults, SQLSRV_FETCH_ASSOC)) {
    array_push($false_pair_arr, $row['rel_order']);
}
sqlsrv_free_stmt($getResults);

$random_false_keys=array_rand($false_pair_arr, $num_of_false_pairs);
foreach ($random_false_keys as $key) {
    array_push($final_pairs_order, $random_false_keys[$key]);
}

shuffle($final_pairs_order);

echo json_encode($final_pairs_order);