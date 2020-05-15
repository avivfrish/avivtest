<?php
$user_id=$_POST['user_id'];
$user_comments=stripcslashes($_POST['comments']);

$connectionInfo = array("UID" => "avivf@avivtest", "pwd" => "1qaZ2wsX!", "Database" => "avivtest", "LoginTimeout" => 30, "Encrypt" => 1, "TrustServerCertificate" => 0);
$serverName = "tcp:avivtest.database.windows.net,1433";
$conn = sqlsrv_connect($serverName, $connectionInfo);

$sql="update exp_users set u_end_comments = '". $user_comments ."' where id = ". $user_id;

$getResults= sqlsrv_query($conn, $sql);
if ($getResults == FALSE)
{
    echo 'err';
    die();
}
sqlsrv_free_stmt($getResults);
echo 'done';