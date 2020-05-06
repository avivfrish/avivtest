<?php
$curr_user = stripcslashes($_POST['curr_user']);
$curr_exp_id = stripcslashes($_POST['curr_exp_id']);

$connectionInfo = array("UID" => "avivf@avivtest", "pwd" => "1qaZ2wsX!", "Database" => "avivtest", "LoginTimeout" => 30, "Encrypt" => 1, "TrustServerCertificate" => 0);
$serverName = "tcp:avivtest.database.windows.net,1433";
$conn = sqlsrv_connect($serverName, $connectionInfo);


$sql="with userWithAlgs as (
    select userconf/100 as confOfUser, token_path, term_match, word_net
    from exp_results join exp_pairs on exp_results.sch_id_1 = exp_pairs.sch_id_1 and
                                       exp_results.sch_id_2 = exp_pairs.sch_id_2
    where user_id = ". $curr_user ." and user_ans_is_match = 1 and exp_results.sch_id_1 != 0 and exp_pairs.exp_id=". $curr_exp_id ."
    ) ,
     norms as (
         select sqrt(sum(userWithAlgs.confOfUser * userWithAlgs.confOfUser)) as confOfUser_n2,
                sqrt(sum(userWithAlgs.token_path * userWithAlgs.token_path)) as Token_Path_n2,
                sqrt(sum(userWithAlgs.term_match * userWithAlgs.term_match)) as Term_Match_n2,
                sqrt(sum(userWithAlgs.word_net * userWithAlgs.word_net)) as WordNet_n2
         from userWithAlgs
     )
select cast(sum(userWithAlgs.confOfUser * userWithAlgs.token_path)/(select confOfUser_n2*Token_Path_n2 from norms) as decimal(5,4)) as Token_Path_Sim,
       cast(sum(userWithAlgs.confOfUser * userWithAlgs.term_match)/(select confOfUser_n2*Term_Match_n2 from norms) as decimal(5,4)) as Term_Match_Sim,
       cast(sum(userWithAlgs.confOfUser * userWithAlgs.word_net)/(select confOfUser_n2*WordNet_n2 from norms)  as decimal(5,4)) as WordNet_Sim
from userWithAlgs";

$getResults= sqlsrv_query($conn, $sql);
if ($getResults == FALSE)
    echo "1";

$array = array();
$token_path = "";
while ($row = sqlsrv_fetch_array($getResults, SQLSRV_FETCH_ASSOC)) {
    $token_path = $row['Token_Path_Sim'];
    $term_match = $row['Term_Match_Sim'];
    $WordNet = $row['WordNet_Sim'];

    $max_value = max($token_path, $term_match, $WordNet);
    $token_path_arg_max = 0;
    $Term_Match_arg_max = 0;
    $WordNet_arg_max = 0;

    if ($token_path == $max_value) {
        $token_path_arg_max = 1;
    } elseif ($term_match == $max_value){
        $Term_Match_arg_max = 1;
    } else {
        $WordNet_arg_max = 1;
    }

    $array[] = array(
        'algName'=>'AMC Token Path',
        'algSim'=>$token_path,
        'isMax'=>$token_path_arg_max
    );

    $array[] = array(
        'algName'=>'Ontobuilder Term Match',
        'algSim'=>$term_match,
        'isMax'=>$Term_Match_arg_max
    );

    $array[] = array(
        'algName'=>'WordNet Jiang Conrath',
        'algSim'=>$WordNet,
        'isMax'=>$WordNet_arg_max
    );
}
sqlsrv_free_stmt($getResults);
if(is_null($token_path)){
    echo "1";
} else{
    echo json_encode($array);
}