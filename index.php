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
    <!--
        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.0/css/all.css" crossorigin="anonymous">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script src="js/popper.min.js"></script>
    <script src="js/angular.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js"></script>
    <link href="https://fonts.googleapis.com/css?family=Cinzel" rel="stylesheet">
    <link rel="icon" href="/images/systemLogo.png"/>
    <script src="js/project.js" ></script>


    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <!-- Bootstrap core CSS -->
    <link href="css/bootstrap.css" rel="stylesheet">
    <!-- Material Design Bootstrap -->
    <link href="css/mdb.css" rel="stylesheet">


    <!-- Add charts script -->

    <script src="randexp/build/randexp.min.js"></script>

    <!-- new script
    <script src="highchart/highcharts.js"></script>-->
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/stock/modules/heatmap.js">
    <script src="https://code.highcharts.com/modules/exporting.js"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js"></script>

    <!--New scripts-->
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.0/css/all.css" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@2.9.2"></script>

    <!-- Your custom styles (optional) -->
    <link href="css/style.css" rel="stylesheet">
</head>
<body ng-controller='incognitomatch' ng-init="init_site()" id="all_body">
    
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
<script src="js/mdb.min.js"></script>

</html>