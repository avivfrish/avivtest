<?php

$usersToShowStats = $_POST['usersToShowStats'];
$groupsToShowStats = $_POST['groupsToShowStats'];

$connectionInfo = array("UID" => "avivf@avivtest", "pwd" => "1qaZ2wsX!", "Database" => "avivtest", "LoginTimeout" => 30, "Encrypt" => 1, "TrustServerCertificate" => 0);
$serverName = "tcp:avivtest.database.windows.net,1433";
$conn = sqlsrv_connect($serverName, $connectionInfo);

$whereClause = "where ";

foreach ($usersToShowStats as $user){

    if($whereClause !== "where "){
        $whereClause = $whereClause . "or users.user_id = " . $user . " ";

    } else{
        $whereClause = $whereClause . "( users.user_id = " . $user . " ";
    }

}

if($whereClause !== "where "){
    $whereClause = $whereClause . ") ";
}

$firstGroupForStatement = True;
foreach ($groupsToShowStats as $group){

    if($whereClause !== "where "){

        if($firstGroupForStatement === True){
            $whereClause = $whereClause . "and ( users.exp_id = " . $group["id"] . " ";
            $firstGroupForStatement = False;
        } else {
            $whereClause = $whereClause . "or users.exp_id = " . $group["id"] . " ";
        }

    } else{
        $whereClause = $whereClause . "( users.exp_id = " . $group["id"] . " ";
        $firstGroupForStatement = False;
    }
}

if($whereClause !== "where "){
    $whereClause = $whereClause . ") ";
}
/*
$sql="select users.user_id, users.exp_id, experiments.schema_name, (select count(*)
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
       (select count(*)
        from exp_pairs
        where realConf = 1 and exp_id = users.exp_id and exp_pairs.[order] <= experiments.max_num_pairs and exp_pairs.sch_id_1 != 0) as exactMatchNum,
       (select avg(exp_results.userconf)
        from exp_results
        where user_id = users.user_id and exp_id = users.exp_id and exp_results.sch_id_1 != 0) as avgConf,
        (select STRING_AGG(exp_results.userconf, ',')
        from exp_results
        where user_id = users.user_id and exp_id = users.exp_id and exp_results.sch_id_1 != 0) as listOfConfs,
       (select STRING_AGG(IIF(realconf = user_ans_is_match, 1, 0), ',')
        from exp_results
        where user_id = users.user_id and exp_id = users.exp_id and exp_results.sch_id_1 != 0) as listOfIsCorrect
from exp_results users join experiments on users.exp_id = experiments.id ".
    $whereClause .
"group by users.user_id, users.exp_id, experiments.max_num_pairs, experiments.schema_name";*/


$sql = "select users.user_id, users.exp_id, experiments.schema_name, (select count(*)
                                                              from (
                                                                       select sch_id_1, sch_id_2
                                                                       from exp_results
                                                                       where user_id = users.user_id and exp_id = users.exp_id and exp_results.user_ans_is_match = 1 and exp_results.sch_id_1 != 0
                                                                       intersect
                                                                       select sch_id_1, sch_id_2
                                                                       from exp_pairs
                                                                       where realConf = 1 and exp_id = users.exp_id and exp_pairs.sch_id_1 != 0) A) as commonCorrNum,
       (select count(*)
        from exp_results
        where user_id = users.user_id and exp_id = users.exp_id and exp_results.user_ans_is_match = 1 and exp_results.sch_id_1 != 0) as matchNum,
       (select count(*)
        from exp_results
        where user_id = users.user_id and exp_id = users.exp_id and exp_results.realconf = 1 and exp_results.sch_id_1 != 0) as exactMatchNum,
       (select avg(exp_results.userconf)
        from exp_results
        where user_id = users.user_id and exp_id = users.exp_id and exp_results.sch_id_1 != 0) as avgConf,
       (select STRING_AGG(exp_results.userconf, ',')
        from exp_results
        where user_id = users.user_id and exp_id = users.exp_id and exp_results.sch_id_1 != 0) as listOfConfs,
       (select STRING_AGG(IIF(realconf = user_ans_is_match, 1, 0), ',')
        from exp_results
        where user_id = users.user_id and exp_id = users.exp_id and exp_results.sch_id_1 != 0) as listOfIsCorrect
from exp_results users join experiments on users.exp_id = experiments.id ".
$whereClause.
"group by users.user_id, users.exp_id, experiments.max_num_pairs, experiments.schema_name";

$getResults= sqlsrv_query($conn, $sql);
if ($getResults == FALSE)
    echo "1";

$array = array();
while ($row = sqlsrv_fetch_array($getResults, SQLSRV_FETCH_ASSOC)) {
    $commonCorrNum = $row['commonCorrNum'];
    $precision = 0;
    $recall = 0;
    if ($commonCorrNum !== 0){
        $precision = $commonCorrNum / $row['matchNum'];
        $recall = $commonCorrNum / $row['exactMatchNum'];
        $cal = $row['avgConf'] - $precision;
    }

    $array[] = array(
        'user_id'=>$row['user_id'],
        'exp_id'=>$row['exp_id'],
        'exp_name'=>$row['schema_name'],
        'precision'=>$precision,
        'recall'=>$recall,
        'cal'=>$cal,
        'listOfConfs'=>$row['listOfConfs'],
        'listOfIsCorrect'=>$row['listOfIsCorrect']
    );
}
sqlsrv_free_stmt($getResults);

echo json_encode($array);