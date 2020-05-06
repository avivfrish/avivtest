<?php
$curr_user = stripcslashes($_POST['curr_user']);
$curr_exp_id = stripcslashes($_POST['curr_exp_id']);

$connectionInfo = array("UID" => "avivf@avivtest", "pwd" => "1qaZ2wsX!", "Database" => "avivtest", "LoginTimeout" => 30, "Encrypt" => 1, "TrustServerCertificate" => 0);
$serverName = "tcp:avivtest.database.windows.net,1433";
$conn = sqlsrv_connect($serverName, $connectionInfo);

$sql="select (select count(*)
                from (
                 select sch_id_1, sch_id_2
                 from exp_results
                 where user_id = users.user_id and exp_id = users.exp_id and exp_results.user_ans_is_match = 1 and exp_results.sch_id_1 != 0
                 intersect
                 select sch_id_1, sch_id_2
                 from exp_pairs
                 where realConf = 1 and exp_id = users.exp_id and exp_pairs.[order] <= experiments.max_num_pairs and exp_pairs.sch_id_1 != 0) A) as commonCorrNum,
        (select count(*)
        from exp_results
        where user_id = users.user_id and exp_id = users.exp_id and exp_results.user_ans_is_match = 1 and exp_results.sch_id_1 != 0) as matchNum,
from exp_results users join experiments on users.exp_id = experiments.id 
where users.user_id = ". $curr_user . " and users.exp_id = ". $curr_exp_id;

$getResults= sqlsrv_query($conn, $sql);
if ($getResults == FALSE)
    echo "err";

$precision = 0;
while ($row = sqlsrv_fetch_array($getResults, SQLSRV_FETCH_ASSOC)) {
    $precision = $row['commonCorrNum'] / $row['matchNum'];
}
sqlsrv_free_stmt($getResults);

echo $precision;