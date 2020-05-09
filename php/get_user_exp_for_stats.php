<?php
$user_id = stripcslashes($_POST['user_id']);

$connectionInfo = array("UID" => "avivf@avivtest", "pwd" => "1qaZ2wsX!", "Database" => "avivtest", "LoginTimeout" => 30, "Encrypt" => 1, "TrustServerCertificate" => 0);
$serverName = "tcp:avivtest.database.windows.net,1433";
$conn = sqlsrv_connect($serverName, $connectionInfo);

$sql="select distinct exp_id, max_num_pairs, schema_name 
from exp_results inner join experiments on exp_results.exp_id = experiments.id
where user_id = ". $user_id ." and [name] != 'Test'";

$getResults= sqlsrv_query($conn, $sql);
if ($getResults == FALSE)
    echo "1";
while ($row = sqlsrv_fetch_array($getResults, SQLSRV_FETCH_ASSOC)) {
    $array[] = array(
        'exp_name'=>$row['schema_name'],
        'id'=>$row['id'],
        'max_num_pairs'=>$row['max_num_pairs'],
    );
}
sqlsrv_free_stmt($getResults);
echo json_encode($array);