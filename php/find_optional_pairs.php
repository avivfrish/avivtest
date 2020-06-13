<?php
$exp_id=stripcslashes($_POST['exp_id']);

$connectionInfo = array("UID" => "avivf@avivtest", "pwd" => "1qaZ2wsX!", "Database" => "avivtest", "LoginTimeout" => 30, "Encrypt" => 1, "TrustServerCertificate" => 0);
$serverName = "tcp:avivtest.database.windows.net,1433";
$conn = sqlsrv_connect($serverName, $connectionInfo);

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

$res=[$true_pair_arr, $false_pair_arr];
echo json_encode($res);