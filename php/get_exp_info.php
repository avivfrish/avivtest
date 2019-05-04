<?php
/**
 * Created by PhpStorm.
 * User: avivf
 * Date: 2019-04-05
 * Time: 17:59
 */


$exp_id=stripcslashes($_POST['exp_id']);
$term_a_or_b=stripcslashes($_POST['term_a_or_b']);
$index_from_a = stripcslashes($_POST['index_from_a']);

$connectionInfo = array("UID" => "avivf@avivtest", "pwd" => "1qaZ2wsX!", "Database" => "avivtest", "LoginTimeout" => 30, "Encrypt" => 1, "TrustServerCertificate" => 0);
$serverName = "tcp:avivtest.database.windows.net,1433";
$conn = sqlsrv_connect($serverName, $connectionInfo);

if ($term_a_or_b == 'sch_id_2')
{

    $sql="select * from exp_pairs where exp_id=$exp_id and id=".$index_from_a;
}
else
{
    $sql="select * from exp_pairs where exp_id=$exp_id";
}

$getResults= sqlsrv_query($conn, $sql);
if ($getResults == FALSE)
    return (sqlsrv_errors());
$array = array();
while ($row = sqlsrv_fetch_array($getResults, SQLSRV_FETCH_ASSOC)) {
    $array[] = array(
        'id'=>$row['id'],
        'sch_id_1' => $row['sch_id_1'],
        'sch_id_2'=>$row['sch_id_2'],
        'score'=> $row['score'],
        'realConf'=> $row['realConf'],
        'order' => $row['order'],
        'h_1' => $row['h_sch_1'],
        'h_2' => $row['h_sch_2']
    );
}

//echo sizeof($array);
if ($term_a_or_b == 'sch_id_2')
{
    $index=0;
}
else{
    $index=rand(0,sizeof($array));

}
sqlsrv_free_stmt($getResults);

$selected=$array[$index];
$sql_get_col_1="select * from exp_schema where id=".$selected[$term_a_or_b];

$getResults_col= sqlsrv_query($conn, $sql_get_col_1);
if ($getResults_col == FALSE)
    return (sqlsrv_errors());
$col_prop = array();
while ($row = sqlsrv_fetch_array($getResults_col, SQLSRV_FETCH_ASSOC)) {
    $col_prop[] = array(
    'sch_id' => $row['id'],
    'col_name' => $row['col_name'],
    'col_type' => $row['col_type'],
    'col_parent_id' => $row['col_parent_id'],
    'index' => $index + 1 ,
    'score'=> $array['score'],
    'realConf'=> $array['realConf'],
    'order' => $array['order'],
    'h_1' => $array['h_1'],
    'h_2' => $array['h_2']
    );
}
sqlsrv_free_stmt($getResults_col);


$sql_get_instance_1="select * from exp_instance where sch_id=".$selected[$term_a_or_b];
$getResults_instance= sqlsrv_query($conn, $sql_get_instance_1);
if ($getResults_instance == FALSE)
    return (sqlsrv_errors());
if (sqlsrv_has_rows($getResults_instance))
{
    $instance = array();
    while ($row = sqlsrv_fetch_array($getResults_instance, SQLSRV_FETCH_ASSOC)) {
        $instance[] = array(
            'id'=>$row['id'],
            'sch_id' => $col_prop[0]['sch_id'],
            'instance' => $row['instance'],
            'col_name' => $col_prop[0]['col_name'],
            'col_type' => $col_prop[0]['col_type'],
            'col_parent_id' => $col_prop[0]['col_parent_id'],
            'order' => $array[$index]['order'],
            'score'=> $array[$index]['score'],
            'realConf'=> $array[$index]['realConf'],
            'index' => $array[$index]['index'],
            'h_1' => $array[$index]['h_1'],
            'h_2' => $array[$index]['h_2']
        );
    }

}
else{
    echo json_encode($col_prop);
    die();
}

sqlsrv_free_stmt($getResults_instance);



echo json_encode($instance);



