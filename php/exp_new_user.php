<?php
$u_nickname=stripcslashes($_POST['u_nickname']);
$email=stripcslashes($_POST['email']);
$u_country=stripcslashes($_POST['u_country']);
$education=stripcslashes($_POST['education']);
$occupation=stripcslashes($_POST['occupation']);
$english_level=stripcslashes($_POST['english_level']);
$age=stripcslashes($_POST['age']);
$gender=stripcslashes($_POST['gender']);
$u_exp_reason=stripcslashes($_POST['u_exp_reason']);
$task_type=stripcslashes($_POST['task_type']);

$connectionInfo = array("UID" => "avivf@avivtest", "pwd" => "1qaZ2wsX!", "Database" => "avivtest", "LoginTimeout" => 30, "Encrypt" => 1, "TrustServerCertificate" => 0);
$serverName = "tcp:avivtest.database.windows.net,1433";
$conn = sqlsrv_connect($serverName, $connectionInfo);

$sql="Insert INTO exp_users(u_nickname, email, u_country, education, occupation, english_level, age, gender, u_exp_reason, u_end_comments) 
OUTPUT INSERTED.id
values ('$u_nickname','$email','$u_country','$education','$occupation','$english_level','$age','$gender','$u_exp_reason',null)";

$getResults= sqlsrv_query($conn, $sql);
if ($getResults == FALSE)
{
    echo 'err';
    die();
}
# get new user id
$user_id="";
while ($row = sqlsrv_fetch_array($getResults, SQLSRV_FETCH_ASSOC)) {
    $user_id=$row['id'];
}
sqlsrv_free_stmt($getResults);

$where_demo_or_not = "and schema_name";
if($task_type === 'demo'){
    $where_demo_or_not = $where_demo_or_not . "= 'Demo'";
} else {
    $where_demo_or_not = $where_demo_or_not . "!= 'Demo'";
}


$get_exp_id="SELECT * from experiments where is_active=1 and [name]!= 'Test'" . $where_demo_or_not;

$getResults= sqlsrv_query($conn, $get_exp_id);
if ($getResults == FALSE)
{
    echo 'err';
    die();
}
$arr=array();
while ($row = sqlsrv_fetch_array($getResults, SQLSRV_FETCH_ASSOC)) {
    $arr[] = array(
        'id'=>$row['id'],
        'schema_name'=>$row['schema_name'],
        'max_num_pairs'=> $row['max_num_pairs'],
        'max_duration'=> $row['max_duration'],
        'disp_type' => $row['disp_type'],
        'disp_instance'=> $row['disp_instance'],
        'disp_h' => $row['disp_h'],
        'disp_system_sugg' => $row['disp_system_sugg'],
        'disp_major_res' => $row['disp_major_res']
    );
}
sqlsrv_free_stmt($getResults);
$ind=rand(0,sizeof($arr)-1);
# get id for test scheme
$get_exp_id_test="SELECT * from experiments where is_active=1 and [name]= 'Test'";

$getResults= sqlsrv_query($conn, $get_exp_id_test);
if ($getResults == FALSE)
{
    echo 'err';
    die();
}
$test_sch="";
while ($row = sqlsrv_fetch_array($getResults, SQLSRV_FETCH_ASSOC)) {
    $test_sch=[
        'id'=>$row['id'],
        'schema_name'=>$row['schema_name'],
        'max_num_pairs'=> $row['max_num_pairs'],
        'max_duration'=> $row['max_duration'],
        'disp_type' => $row['disp_type'],
        'disp_instance'=> $row['disp_instance'],
        'disp_h' => $row['disp_h'],
        'disp_system_sugg' => $row['disp_system_sugg'],
        'disp_major_res' => $row['disp_major_res']
    ];
}

$res=[$arr[$ind],$test_sch,$user_id];

echo json_encode($res);