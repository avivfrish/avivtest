<?php
$usersToShowStats = $_POST['usersToShowStats'];

$connectionInfo = array("UID" => "avivf@avivtest", "pwd" => "1qaZ2wsX!", "Database" => "avivtest", "LoginTimeout" => 30, "Encrypt" => 1, "TrustServerCertificate" => 0);
$serverName = "tcp:avivtest.database.windows.net,1433";
$conn = sqlsrv_connect($serverName, $connectionInfo);

$whereClause = "where ";
foreach ($usersToShowStats as $user){
    if($whereClause !== "where "){
        $whereClause = $whereClause . "or user_id = " . $user . " ";

    } else{
        $whereClause = $whereClause . "user_id = " . $user . " ";
    }
}

$sql="select distinct experiments.id as id, max_num_pairs
from exp_results, experiments
where experiments.id = exp_results.exp_id and ( ".$whereClause." )";

$getResults= sqlsrv_query($conn, $sql);
if ($getResults == FALSE)
    echo "1";

$array = array();
while ($row = sqlsrv_fetch_array($getResults, SQLSRV_FETCH_ASSOC)) {
    $array[] = array(
        'id'=>$row['id'],
        'max_num_pairs'=>$row['max_num_pairs']
    );
}
sqlsrv_free_stmt($getResults);

echo json_encode($array);