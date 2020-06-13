<?php
$exp_id=$_POST['exp_id'];
$num_of_true_pairs=$_POST['num_of_true_pairs'] - 1;
$num_of_false_pairs=$_POST['num_of_false_pairs'] - 1;
$total_pairs = $_POST['num_of_false_pairs'] + $_POST['num_of_true_pairs'];

$connectionInfo = array("UID" => "avivf@avivtest", "pwd" => "1qaZ2wsX!", "Database" => "avivtest", "LoginTimeout" => 30, "Encrypt" => 1, "TrustServerCertificate" => 0);
$serverName = "tcp:avivtest.database.windows.net,1433";
$conn = sqlsrv_connect($serverName, $connectionInfo);

$final_pairs_order = array();

$sql1="select [order] as rel_order
from exp_pairs                       
where exp_id = ".$exp_id." and realConf = 1";

$getResults1= sqlsrv_query($conn, $sql1);
if ($getResults1 == FALSE)
{
    echo 'err';
    die();
}

$true_pair_arr=array();
while ($row = sqlsrv_fetch_array($getResults1, SQLSRV_FETCH_ASSOC)) {
    if($row['rel_order'] != 1 and
        (($row['rel_order'] != 5 and $total_pairs<=10) or ($row['rel_order'] != 15 and $total_pairs>10))){
        array_push($true_pair_arr, $row['rel_order']);
    }
}

$random_true_keys1=array_rand($true_pair_arr, $num_of_true_pairs);

foreach ($random_true_keys1 as $key) {
    array_push($final_pairs_order, $true_pair_arr[$key]);
}


$sql2="select [order] as rel_order                      
from exp_pairs                       
where exp_id = ".$exp_id." and realConf = 0";

$getResults2= sqlsrv_query($conn, $sql2);
if ($getResults2 == FALSE)
{
    echo 'err';
    die();
}

$false_pair_arr=array();
while ($row = sqlsrv_fetch_array($getResults2, SQLSRV_FETCH_ASSOC)) {
    if($row['rel_order'] != 1 and
        (($row['rel_order'] != 5 and $total_pairs<=10) or ($row['rel_order'] != 15 and $total_pairs>10))){
        array_push($false_pair_arr, $row['rel_order']);
    }
}
sqlsrv_free_stmt($getResults2);

$random_false_keys2=array_rand($false_pair_arr, $num_of_false_pairs);
foreach ($random_false_keys2 as $key) {
    array_push($final_pairs_order, $false_pair_arr[$key]);
}

shuffle($final_pairs_order);

$final_res = array();
array_push($final_res, 1);
$i = 2;
foreach ($final_pairs_order as $order) {
    if(($i == 15 and $total_pairs>10) or ($i == 5 and $total_pairs<=10)){
        array_push($final_res, $i);
    }
    array_push($final_res, $order);
    $i = $i + 1;
}

echo json_encode($final_res);