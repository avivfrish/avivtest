<?php
	session_start();
	if (isset($_SESSION['id']))
	{
		echo $_SESSION;
	}


?>
<html lang="en" ng-app="template" id="schemaMatchingExp">
<title>InCognitoMatch</title>
<head>


    <!--New scripts-->
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.0/css/all.css" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@2.9.2"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels"></script>

</head>
<body ng-controller='avivTest' ng-init="init_avivTest()" id="all_body">
    
	<?php
		include "html/home.html";
        include "html/finish_exp.html";
        include "html/nav.html";
        include "html/riddle.html";
        include "html/exp.html";
        include "html/new_user.html";
		include "html/instruction_after.html";
        include "html/statistics.html";
	?>

</body>

</html>