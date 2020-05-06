<?php
$user=stripcslashes($_POST['admin_email']);
$pass=md5($_POST['admin_pass']);

/*
$connectionInfo = array("UID" => "avivf@avivtest", "pwd" => "1qaZ2wsX!", "Database" => "avivtest", "LoginTimeout" => 30, "Encrypt" => 1, "TrustServerCertificate" => 0);
$serverName = "tcp:avivtest.database.windows.net,1433";
$conn = sqlsrv_connect($serverName, $connectionInfo);


$sql = "SELECT * from admins where [usr]='$user' and [pass] ='$pass'";
$getResults= sqlsrv_query($conn, $sql);
if ($getResults == FALSE)
{
    echo 'err';
    die();
}
$usr=array();
if (sqlsrv_has_rows($getResults)===false)
{
    echo 'no_user';
    die();
}
while ($row = sqlsrv_fetch_array($getResults, SQLSRV_FETCH_ASSOC)) {
    $usr[]=array(
        'uid' => $row['id'],
        'email' => $row['usr'],
        'full_name' => $row['f_name'],
    );
}
echo json_encode($usr);
session_start();
$_SESSION['id'] = $usr[0]['id'];
$_SESSION['email'] = $usr[0]['email'];
$_SESSION['f_name'] = $usr[0]['f_name'];
$_SESSION['time'] = time();*/

$servername = "tcp:avivtest.database.windows.net,1433";
$username = "avivf@avivtest";
$password = "1qaZ2wsX!";
$dbname = "avivtest";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    echo 'err';
    die();
}

$sql = "SELECT * from admins where [usr]='$user' and [pass] ='$pass'";
$getResults = $conn->query($sql);

if ($getResults == FALSE)
{
    echo 'err';
    die();
}

$usr=array();
if ($getResults->num_rows > 0) {
    while ($row = $getResults->fetch_assoc()) {
        $usr[]=array(
            'uid' => $row['id'],
            'email' => $row['usr'],
            'full_name' => $row['f_name'],
        );
    }
} else {
    echo 'no_user';
    die();
}

echo json_encode($usr);
session_start();
$_SESSION['id'] = $usr[0]['id'];
$_SESSION['email'] = $usr[0]['email'];
$_SESSION['f_name'] = $usr[0]['f_name'];
$_SESSION['time'] = time();

$conn->close();


