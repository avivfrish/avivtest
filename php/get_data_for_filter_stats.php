<?php
$connectionInfo = array("UID" => "avivf@avivtest", "pwd" => "1qaZ2wsX!", "Database" => "avivtest", "LoginTimeout" => 30, "Encrypt" => 1, "TrustServerCertificate" => 0);
$serverName = "tcp:avivtest.database.windows.net,1433";
$conn = sqlsrv_connect($serverName, $connectionInfo);
$sql="select u_nickname as fullName, id
from exp_users
where id in (
    select distinct user_id
    from exp_results
    )
order by id desc";
$getResults= sqlsrv_query($conn, $sql);
if ($getResults == FALSE)
    echo "1";
$array = array();
while ($row = sqlsrv_fetch_array($getResults, SQLSRV_FETCH_ASSOC)) {
    $array[] = array(
        'fullName'=>$row['fullName'],
        'id'=>$row['id'],
        'isSingleUser' => 'True'
    );
}
sqlsrv_free_stmt($getResults);
$sql="select schema_name, id, max_num_pairs
from experiments
where name!='Test'";
$getResults= sqlsrv_query($conn, $sql);
if ($getResults == FALSE)
    echo "1";
while ($row = sqlsrv_fetch_array($getResults, SQLSRV_FETCH_ASSOC)) {
    $array[] = array(
        'exp_name'=>$row['schema_name'],
        'id'=>$row['id'],
        'max_num_pairs'=>$row['max_num_pairs'],
        'isSingleUser' => 'False'
    );
}
sqlsrv_free_stmt($getResults);
echo json_encode($array);