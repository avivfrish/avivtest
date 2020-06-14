<?php
$usersToShowStats = $_POST['usersToShowStats'];
$groupsToShowStats = $_POST['groupsToShowStats'];

$connectionInfo = array("UID" => "avivf@avivtest", "pwd" => "1qaZ2wsX!", "Database" => "avivtest", "LoginTimeout" => 30, "Encrypt" => 1, "TrustServerCertificate" => 0);
$serverName = "tcp:avivtest.database.windows.net,1433";
$conn = sqlsrv_connect($serverName, $connectionInfo);

$firstWhereClause = "where ";
$secondWhereClause = "where ";

foreach ($usersToShowStats as $user){

    if($firstWhereClause !== "where "){
        $firstWhereClause = $firstWhereClause . "or user_id = " . $user . " ";

    } else{
        $firstWhereClause = $firstWhereClause . "( user_id = " . $user . " ";
    }

}

if($firstWhereClause !== "where "){
    $firstWhereClause = $firstWhereClause . ") ";
}

$firstGroupForFirstStatement = True;
foreach ($groupsToShowStats as $group){

    if($firstWhereClause !== "where "){

        if($firstGroupForFirstStatement === True){
            $firstWhereClause = $firstWhereClause . "and ( exp_id = " . $group["id"] . " ";
            $firstGroupForFirstStatement = False;
        } else {
            $firstWhereClause = $firstWhereClause . "or exp_id = " . $group["id"] . " ";
        }

    } else{
        $firstWhereClause = $firstWhereClause . "( exp_id = " . $group["id"] . " ";
        $firstGroupForFirstStatement = False;
    }

    if($secondWhereClause !== "where "){
        $secondWhereClause = $secondWhereClause . "or (exp_id = " . $group["id"] . " and [order] <= " . $group["max_num_pairs"] . ") ";

    } else{
        $secondWhereClause = $secondWhereClause . "(exp_id = " . $group["id"] . " and [order] <= " . $group["max_num_pairs"] . ") ";
    }
}

if($firstWhereClause !== "where "){
    $firstWhereClause = $firstWhereClause . ") ";
}

/*
$sql="WITH answers_table AS (
    select sch_id_1, sch_id_2, userconf, IIF(realconf = user_ans_is_match, 1, 0) as isCorrectAnswer
    from exp_results
    where exp_id = 3
)
select [order], AVG(userconf) as avgConf, 100*AVG(CAST(isCorrectAnswer AS DECIMAL(5,4))) as avgCorrAns
from answers_table join (select [order], sch_id_1, sch_id_2
                         from exp_pairs
                         where exp_id = 3 and [order]<=20) questions_orders
on answers_table.sch_id_1 = questions_orders.sch_id_1
       and answers_table.sch_id_2 = questions_orders.sch_id_2
group by [order]
order by [order] asc";


$sql="WITH answers_table AS (
    select sch_id_1, sch_id_2, userconf, IIF(realconf = user_ans_is_match, 1, 0) as isCorrectAnswer
    from exp_results ".
    $firstWhereClause . "and exp_results.sch_id_1 != 0
)
select [order], AVG(userconf) as avgConf, 100*AVG(CAST(isCorrectAnswer AS DECIMAL(5,4))) as avgCorrAns
from answers_table join (select [order], sch_id_1, sch_id_2
                         from exp_pairs ".
                         $secondWhereClause . "and exp_pairs.sch_id_1 != 0) questions_orders
on answers_table.sch_id_1 = questions_orders.sch_id_1
       and answers_table.sch_id_2 = questions_orders.sch_id_2
group by [order]
order by [order] asc";*/

$sql = "WITH answers_table AS (
    select exp_id, sch_id_1, sch_id_2, userconf, IIF(realconf = user_ans_is_match, 1, 0) as isCorrectAnswer,
           ROW_NUMBER() over (partition by exp_id, user_id order by rec_time) as row_number
    from exp_results ".
    $firstWhereClause ."and exp_results.sch_id_1 != 0
)
select row_number, AVG(userconf) as avgConf, 100*AVG(CAST(isCorrectAnswer AS DECIMAL(5,4))) as avgCorrAns
from answers_table join (select exp_id, sch_id_1, sch_id_2
                         from exp_pairs ".
                        $secondWhereClause."and exp_pairs.sch_id_1 != 0) questions_orders
                         on answers_table.exp_id = questions_orders.exp_id
                             and answers_table.sch_id_1 = questions_orders.sch_id_1
                             and answers_table.sch_id_2 = questions_orders.sch_id_2
                         group by row_number
                         order by row_number";
echo $sql;

$getResults= sqlsrv_query($conn, $sql);
if ($getResults == FALSE)
    echo "1";

$array = array();
while ($row = sqlsrv_fetch_array($getResults, SQLSRV_FETCH_ASSOC)) {
    $array[] = array(
        'avgConf'=>$row['avgConf'],
        'avgCorrAns'=>$row['avgCorrAns']
    );
}
sqlsrv_free_stmt($getResults);

echo json_encode($array);