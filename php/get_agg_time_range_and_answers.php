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
            $firstWhereClause = $firstWhereClause . "and ( exp_results.exp_id = " . $group["id"] . " ";
            $firstGroupForFirstStatement = False;
        } else {
            $firstWhereClause = $firstWhereClause . "or exp_results.exp_id = " . $group["id"] . " ";
        }

    } else{
        $firstWhereClause = $firstWhereClause . "( exp_results.exp_id = " . $group["id"] . " ";
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
$sql="WITH time_table AS (
    select user_id, [order], IIF(realconf = user_ans_is_match, 1, 0) as isCorrectAnswer, rec_time
    from exp_results join (select [order], sch_id_1, sch_id_2, exp_id
                           from exp_pairs
                           where exp_id = 3 and [order]<=20) questions_orders
                          on exp_results.sch_id_1 = questions_orders.sch_id_1 and exp_results.sch_id_2 = questions_orders.sch_id_2
                            and exp_results.exp_id = questions_orders.exp_id
    where user_id = 356
)
SELECT time_table1.[order] as qOrder,
       (AVG(datediff(second, time_table1.rec_time, time_table2.rec_time)))  as avgdiffSec,
       AVG(CAST(time_table1.isCorrectAnswer AS DECIMAL(5,2))) as avgCorrAns
FROM time_table time_table1
         JOIN time_table time_table2
              ON ( time_table1.[order] = time_table2.[order] - 1
                  and time_table1.user_id = time_table2.user_id)
GROUP BY time_table1.[order]
order by time_table1.[order] asc";

$sql="WITH time_table AS (
    select user_id, [order], IIF(realconf = user_ans_is_match, 1, 0) as isCorrectAnswer, rec_time
    from exp_results join (select [order], sch_id_1, sch_id_2, exp_id
                           from exp_pairs ".
                            $secondWhereClause.") questions_orders
                          on exp_results.sch_id_1 = questions_orders.sch_id_1 and exp_results.sch_id_2 = questions_orders.sch_id_2
                            and exp_results.exp_id = questions_orders.exp_id ".
    $firstWhereClause ."
)
SELECT time_table1.[order] as qOrder,
       (AVG(datediff(second, time_table1.rec_time, time_table2.rec_time)))  as avgdiffSec,
       AVG(CAST(time_table2.isCorrectAnswer AS DECIMAL(5,2))) as avgCorrAns
FROM time_table time_table1
         JOIN time_table time_table2
              ON ( time_table1.[order] = time_table2.[order] - 1
                  and time_table1.user_id = time_table2.user_id)
GROUP BY time_table1.[order]
order by time_table1.[order] asc";*/


$sql ="WITH time_table AS (
    select user_id, IIF(realconf = user_ans_is_match, 1, 0) as isCorrectAnswer,
           rec_time, ROW_NUMBER() over (partition by exp_results.exp_id, user_id order by rec_time) as row_number
    from exp_results ".
    $firstWhereClause ."
    )
SELECT time_table1.row_number as qOrder,
       (AVG(datediff(second, time_table1.rec_time, time_table2.rec_time)))  as avgdiffSec,
       AVG(CAST(time_table2.isCorrectAnswer AS DECIMAL(5,2))) as avgCorrAns
FROM time_table time_table1
         JOIN time_table time_table2
              ON ( time_table1.row_number = time_table2.row_number - 1
                  and time_table1.user_id = time_table2.user_id)
GROUP BY time_table1.row_number
order by time_table1.row_number";

$getResults= sqlsrv_query($conn, $sql);
if ($getResults == FALSE)
    echo "1";

$array = array();
while ($row = sqlsrv_fetch_array($getResults, SQLSRV_FETCH_ASSOC)) {
    $array[] = array(
        'avgTime'=>$row['avgdiffSec'],
        'avgCorrAns'=>$row['avgCorrAns']
    );
}
sqlsrv_free_stmt($getResults);

echo json_encode($array);