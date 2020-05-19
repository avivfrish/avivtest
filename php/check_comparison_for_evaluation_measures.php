<?php
$usersToShowStats = $_POST['usersToShowStats'];
$exp_id = $_POST['exp_id'];

$connectionInfo = array("UID" => "avivf@avivtest", "pwd" => "1qaZ2wsX!", "Database" => "avivtest", "LoginTimeout" => 30, "Encrypt" => 1, "TrustServerCertificate" => 0);
$serverName = "tcp:avivtest.database.windows.net,1433";
$conn = sqlsrv_connect($serverName, $connectionInfo);

$whereClause = "";
foreach ($usersToShowStats as $user){
    if($whereClause !== ""){
        $whereClause = $whereClause . "or user_id != " . $user . " ";

    } else{
        $whereClause = $whereClause . "user_id != " . $user . " ";
    }
}

$sql="select count(distinct user_id) as count_r
from exp_results
where (". $whereClause .") and exp_id = ".$exp_id;

$getResults= sqlsrv_query($conn, $sql);
if ($getResults == FALSE)
    echo "1";

$count = 0;
while ($row = sqlsrv_fetch_array($getResults, SQLSRV_FETCH_ASSOC)) {
    $count = $row['count_r'];
}
sqlsrv_free_stmt($getResults);
echo json_encode($count);