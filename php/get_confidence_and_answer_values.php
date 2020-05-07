<?php
$curr_user = stripcslashes($_POST['curr_user']);
$curr_exp_id = stripcslashes($_POST['curr_exp_id']);

$exp_where_clause = "";
if(is_array($curr_exp_id)){
    $exp_where_clause = "exp_id IN ". implode(',', $curr_exp_id);
} else{
    $exp_where_clause = "exp_id = ". $curr_exp_id;
}

$connectionInfo = array("UID" => "avivf@avivtest", "pwd" => "1qaZ2wsX!", "Database" => "avivtest", "LoginTimeout" => 30, "Encrypt" => 1, "TrustServerCertificate" => 0);
$serverName = "tcp:avivtest.database.windows.net,1433";
$conn = sqlsrv_connect($serverName, $connectionInfo);


$sql="select userconf, IIF(realconf = user_ans_is_match, 1, 0) as isCorrectAnswer
from exp_results
where exp_results.sch_id_1 != 0 and user_id = ". $curr_user ." and " . $exp_where_clause ." 
order by rec_time asc";
echo $sql;
$getResults= sqlsrv_query($conn, $sql);
if ($getResults == FALSE)
    echo "1";

$array = array();
while ($row = sqlsrv_fetch_array($getResults, SQLSRV_FETCH_ASSOC)) {
    $array[] = array(
        'user_conf'=>$row['userconf'],
        'isCorrectAnswer'=>$row['isCorrectAnswer']
    );
}
sqlsrv_free_stmt($getResults);

echo json_encode($array);