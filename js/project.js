let app = angular.module('template', []);

app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            let model = $parse(attrs.fileModel);
            let modelSetter = model.assign;

            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

app.directive('ngFile', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('change', function(){

                $parse(attrs.ngFile).assign(scope,element[0].files);
                scope.$apply();
            });
        }
    };
}]);

app.directive('starRating', function () {
    return {
        scope: {
            value: '='
        },
        template: '<div class="stars"><i class="fa fa-star" ng-repeat="r in entries"></i></div>',
        controller: function ($scope) {
            $scope.entries = _.range($scope.value);
        }
    }
});

// We can write our own fileUpload service to reuse it in the controller
app.service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function(files, uploadUrl, name, exp_name){
        let fd = new FormData();
        angular.forEach(files,function(file){
            fd.append('file[]',file);
        });
        fd.append('name', name);
        fd.append('exp_name', exp_name);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined,'Process-Data': false}
        }).then(function(data){
            let res=data.data;
            //console.log(res);
            if (res==="0")
            {
                //console.log("good");

            }
            else {
                console.log("error upload files");

            }
        })

    }
}]);

// myApp.controller('myCtrl', ['$scope', 'fileUpload', function($scope, fileUpload){

/*
function SyncScroll(table_id) {
    var table_idA = document.getElementById("HierarchyTable_contentA");
    var table_idB = document.getElementById("HierarchyTable_contentB");
    if (table_id=="HierarchyTable_contentA") {
        table_idB.scrollTop = table_idA.scrollTop;
    }
    else {
        table_idA.scrollTop = table_idB.scrollTop;
    }
};*/

app.controller('incognitomatch', function ($scope, $http,$compile, $interval, fileUpload, $window, $element, $timeout) {

    $scope.init_site = function () {
        // this function called when loading the site. init all params.
        // console.log("test");
        $scope.hide_pages();
        $scope.show_home();
        $scope.schema2=[];
        $scope.schema=[];
        $scope.h_1=[];
        $scope.h_2=[];
        $scope.last_time_mouse="";
        $scope.mouse_moves=[];
        $scope.curr_user={};
        $scope.curr_exp_id="";
        $scope.curr_count_ans=0;
        $scope.total_ans_needed=0;
        // Add number of true and false pairs
        $scope.total_true_pair_ans_needed=0;
        $scope.total_false_pair_ans_needed=0;

        $scope.curr_order=1;
        $scope.exclude_ids="";
        $scope.experiments=[];
        $scope.exp_ids=[];
        $scope.done_test=false;
        $scope.exp_after_test=[];
        $scope.files_to_upload={"csv":"","xml":[],"xsd":[]};
        $scope.time_to_pause="";
        $scope.disp_feedback=false;
        $scope.test_schema="";
        $scope.curr_realConf="";
        $scope.user_total_ans_right=0;
        $scope.last_ans=false;
        $scope.validFieldFigureEight = new RandExp(/[A-Gg-z0-9]{40}/).gen();
        $scope.user_current_confidence = 0;

        $scope.confidenceLineGraph = "";
        $scope.timeBarGraph = "";
        $scope.simAlgInMatch = "";
        //$scope.userScreenshotImg = "";

        // Var for stats
        $scope.filter_stat_by_user = "";
        $scope.filter_stat_by_group = "";
        $scope.usersToShowStats = [];
        $scope.groupsToShowStats = [];

        $scope.timeElapsed = "";
    };

    $scope.show_home = function(){
        // this function show the home div - the instructions.
        $("#home").show();
    };

    $scope.hide_scroll = function(){
        document.getElementById("schemaMatchingExp").style.overflow = 'hidden';
    };

    $scope.hide_pages = function () {
        //this function hide all pages.
        $("#home").hide();
        $("#riddle").hide();
        $("#experiment").hide();
        $("#begin_exp_user").hide();
        $("#finish_exp_empty").hide();
        $("#finish_exp_full").hide();
        $("#loading").hide();
        $("#instruction_after").hide();
        $("#statistics").hide();
        $('#notification_toast').hide();
        window.scrollTo(0,0);

        if($scope.timeElapsed !== ""){
            document.getElementById("time_elapsed").innerHTML =  "";
            document.getElementById("pause_modal_body").innerHTML = "";
            document.getElementById("time_remains_riddles").innerHTML =  "";
            clearInterval($scope.timeElapsed);
        }

        document.getElementById("schemaMatchingExp").style.overflow = 'auto';
    };

    $scope.scroll_down_home = function (){
        $('html, body').animate({
            scrollTop: $("#home_content").offset().top
        }, 500);
    };

    $scope.show_riddle = function () {
        //this function show the riddles div after the user read the instruction.

        $("#riddle").show();
        $("#tr_riddle_1").show();
        $("#tr_riddle_2").show();
        $("#tr_riddle_3").show();
        $("#tr_riddle_4").show();
        $("#tr_riddle_5").show();
        $("#tr_riddle_6").show();
        $("#tr_riddle_7").show();
        let hide1=Math.floor((Math.random() * 7) + 1);
        let choose = false;
        let hide2;
        while (!choose)
        {
            hide2=Math.floor((Math.random() * 7) + 1);
            if (hide1!==hide2)
            {
                choose = true;
            }
        }
        let str1="#tr_riddle_"+hide1;

        let str2="#tr_riddle_"+hide2;
        $(str1).hide();
        $(str2).hide();
        window.scrollTo(0,0);

        const countDownDate = new Date().getTime() + 2 * 60000;
        $scope.timeElapsed = setInterval(function() {
            var now = new Date().getTime();
            var distance = countDownDate - now;

            if (distance <= 0){
                $scope.show_test();
            } else {
                var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                document.getElementById("time_remains_riddles").innerHTML =  "Time Remains: " + minutes + "m, " + seconds + "s ";
            }
        }, 1000);
    };

    $scope.show_exp = function (exp_type) {
        // this function show the new user form after clicking on the "experiment" in the nav bar.
        $scope.exclude_ids="";
        $scope.curr_order=1;
        $scope.mouse_moves=[];
        $scope.done_test=false;
        $scope.disp_feedback=false;
        $scope.exp_type = exp_type;
        $("#begin_exp_user").show();

    };

    $scope.show_test = function() {
        clearInterval($scope.timeElapsed);
        document.getElementById("time_remains_riddles").innerHTML =  "";

        $http({
            method: 'POST',
            url: 'php/riddles.php',
            data: $.param({
                riddle_1: document.getElementById("riddle_1").value,
                riddle_2: document.getElementById("riddle_2").value,
                riddle_3: document.getElementById("riddle_3").value,
                riddle_4: document.getElementById("riddle_4").value,
                riddle_5: document.getElementById("riddle_5").value,
                riddle_6: document.getElementById("riddle_6").value,
                riddle_7: document.getElementById("riddle_7").value,
                user_id: $scope.curr_user['id']
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (data) {
            if (data.data !== "err") {
                $("#riddle").hide();
                document.getElementById("riddle_1").value = "";
                document.getElementById("riddle_2").value = "";
                document.getElementById("riddle_3").value = "";
                document.getElementById("riddle_4").value = "";
                document.getElementById("riddle_5").value = "";
                document.getElementById("riddle_6").value = "";
                document.getElementById("riddle_7").value = "";

                document.getElementById("time_elapsed").innerHTML =  "";
                document.getElementById("pause_modal_body").innerHTML = "";

                if($scope.exp_type === 'demo'){
                    $scope.done_test = true;
                    $scope.after_instructions();
                } else {
                    $scope.begin_exp($scope.test_schema);
                }
            } else {
                console.log(data.data);
            }

        });
    };

    $scope.show_statistics = function(applyChanges){
        // this function show the home div - the instructions.

        $scope.NotFirstShowOfStatistics = applyChanges;

        $scope.getDataForFiterStatistics(function(finish_conf) {

            $("#statistics").hide();
            $("#loading").show();

            $scope.usersToShowStats = [];
            $scope.groupsToShowStats = [];

            for (let index in $scope.allUserNames){
                if(index >= 2 && $scope.allUserNames[index].checked === true){
                    $scope.usersToShowStats.push($scope.allUserNames[index].id);
                }
            }

            for (let index in $scope.allTestExpNames){
                if(index >= 2 && $scope.allTestExpNames[index].checked === true){
                    $scope.groupsToShowStats.push({"id" : $scope.allTestExpNames[index].id,
                        "max_num_pairs" : $scope.allTestExpNames[index].max_num_pairs});
                }
            }

            if( ($scope.usersToShowStats.length === 0) || ( $scope.groupsToShowStats.length === 0)){
                $("#loading").hide();
                $("#statistics_body_full").hide();
                $("#statistics_body_empty").show();
                $("#statistics").show();
            } else {

                var isSingleUser = 'False';

                $scope.get_rel_exp_by_users(function(finish_rel_exp) {

                    $scope.rel_exp_ids_checked = [];
                    var no_rel_exp = true;
                    for (let index_1 in $scope.groupsToShowStats){
                        for (let index_2 in $scope.relExpForUsersToShowStats){
                            if($scope.groupsToShowStats[index_1].id === $scope.relExpForUsersToShowStats[index_2].id){
                                $scope.rel_exp_ids_checked.push($scope.groupsToShowStats[index_1].id);
                                no_rel_exp = false;
                            }
                        }
                    }
                    if(no_rel_exp === true){
                        $("#loading").hide();
                        $("#statistics_body_full").hide();
                        $("#statistics_body_empty").show();
                        $("#statistics").show();
                    } else {
                        $scope.showAggregateConfidenceLineGraph(function(finish_conf) {

                            $scope.showAggregateTimeRangeBarGraph(function(finish_conf) {

                                $scope.computeMeasures(function(finish_conf) {

                                    $scope.get_mouse_click_data(function(finish_click_data) {

                                        $scope.create_heat_map(function(finish_heat_map) {

                                            $("#loading").hide();
                                            $("#statistics_body_empty").hide();
                                            $("#statistics_body_full").show();
                                            $("#statistics").show();

                                        }, isSingleUser);
                                    }, isSingleUser);
                                });

                            });

                        });
                    }
                });
            }
        });
    };

    $scope.begin_exp = function(exp){
        //this function set the experiment form accordingly to the correct settings and call getExp function
        // to get the first pair.
        $scope.curr_exp_id = exp['id'];
        $scope.total_ans_needed = exp['max_num_pairs'];
        $scope.total_true_pair_ans_needed = Math.ceil($scope.total_ans_needed*0.4);
        $scope.total_false_pair_ans_needed = $scope.total_ans_needed - $scope.total_true_pair_ans_needed;

        $http({
            method: 'POST',
            url: 'php/find_pairs.php',
            data: $.param({
                exp_id: $scope.curr_exp_id,
                num_of_true_pairs: $scope.total_true_pair_ans_needed,
                num_of_false_pairs: $scope.total_false_pair_ans_needed
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (data) {
            $scope.pairs_order = [];
            for(let index in data.data){
                $scope.pairs_order.push(data.data[index]);
            }
            //console.log("$scope.pairs_order");
            //console.log($scope.pairs_order);

            window.scrollTo(0,0);
            document.getElementById("schemaMatchingExp").style.overflow = 'hidden';

            $("#experiment").show();

            if (exp['disp_type'] === 0)
            {
                $("#row_type_A").hide();
                $("#A_col_type").hide();
                $("#row_type_B").hide();
                $("#B_col_type").hide();
            }
            else
            {
                $("#row_type_A").show();
                $("#A_col_type").show();
                $("#row_type_B").show();
                $("#B_col_type").show();
            }
            if (exp['disp_instance'] === 0)
            {
                $("#row_instance_A").hide();
                $("#A_col_instance").hide();
                $("#row_instance_B").hide();
                $("#B_col_instance").hide();
            }
            else
            {
                $("#row_instance_A").show();
                $("#A_col_instance").show();
                $("#row_instance_B").show();
                $("#B_col_instance").show();
            }
            if (exp['disp_h'] === 0)
            {
                $("#HierarchyTableA").hide();
                $("#HierarchyTableB").hide();
            }
            else
            {
                $("#HierarchyTableA").show();
                $("#HierarchyTableB").show();
            }
            if (exp['disp_system_sugg'] === 0)
            {
                $("#system_suggest").hide();
                $("#exp_pair_score").hide();
            }
            else
            {
                $("#system_suggest").show();
                $("#exp_pair_score").show();
            }
            if (exp['disp_major_res'] === 0)
            {
                $("#major_decision").hide();
                $("#exp_pair_major").hide();
            }
            else
            {
                $("#major_decision").show();
                $("#exp_pair_major").show();
            }

            $scope.time_to_pause = Math.floor(exp['max_num_pairs']*0.25);
            if(exp['max_num_pairs']<=15){
                $scope.time_to_pause = Math.floor(exp['max_num_pairs']*0.5);
            }
            $scope.getExp($scope.curr_exp_id);
            document.getElementById("exp_hello").innerText = "Hello, " + $scope.curr_user["nickname"];

            // Insert tuple that presents the start of the exp
            $http({
                method: 'POST',
                url: 'php/exp_res.php',
                data: $.param({
                    exp_id: $scope.curr_exp_id,
                    user_id: $scope.curr_user['id'],
                    sch_id_1: 0,
                    sch_id_2: 0,
                    realconf: 1,
                    userconf: 0,
                    mouse_loc: [],
                    user_ans_match: 0
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).then(function (data) { });
        });
    };

    $scope.clear_user_form = function(){
        //this function clear the new user form after data saved.
        document.getElementById("new_user_nickname").value="";
        document.getElementById("new_user_email").value="";
        document.getElementById("new_user_country").value="";
        document.getElementById("new_user_education").value="";

        document.getElementById("new_user_occupation").value="";
        document.getElementById("new_user_english_level").value="";
        document.getElementById("new_user_age").value="";
        document.getElementById("new_user_gender").value="";
        document.getElementById("new_user_exp_reason").value="";
    };

    $scope.new_user_exp = function(){
        // this function create new user for experiment.
        if(document.getElementById("new_user_nickname").value !== ""){
            $scope.curr_count_ans=0;
            $http({
                method: 'POST',
                url: 'php/exp_new_user.php',
                data: $.param({
                    u_nickname: document.getElementById("new_user_nickname").value,
                    email: document.getElementById("new_user_email").value,
                    u_country: document.getElementById("new_user_country").value,
                    education: document.getElementById("new_user_education").value,
                    occupation: document.getElementById("new_user_occupation").value,
                    english_level: document.getElementById("new_user_english_level").value,
                    age: document.getElementById("new_user_age").value,
                    gender: document.getElementById("new_user_gender").value,
                    u_exp_reason: document.getElementById("new_user_exp_reason").value,
                    task_type: $scope.exp_type
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).then(function (data) {
                if (data.data !== "err")
                {
                    $("#begin_exp_user").hide();
                    $scope.exp_after_test = data.data[0];
                    $scope.test_schema=data.data[1];
                    $scope.curr_user={"nickname":document.getElementById("new_user_nickname").value,
                        "id": data.data[2]
                    };
                    $scope.show_riddle();
                    $scope.clear_user_form();
                } else {
                    console.log(data.data);
                }
            });
        }
    };

    $scope.send_comments = function(){
        // this function create new user for experiment.

        $scope.curr_count_ans=0;
        $http({
            method: 'POST',
            url: 'php/exp_send_user_comments.php',
            data: $.param({
                user_id: $scope.curr_user['id'],
                comments: document.getElementById("user_comments").value
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (data) {
            if (data.data !== "err")
            {
                $("#user_comments_form").hide();
                $("#user_comments_recieved").show();
                document.getElementById("user_comments").value = "";
            } else {
                console.log(data.data);
            }
        });
    };

    $scope.getExp2 = function (callback,exp_id) {
        // function to retrieves the term from shcema 1

        //console.log($scope.curr_order);
        //console.log($scope.pairs_order[$scope.curr_order-1])
        $http({
            method: 'POST',
            url: 'php/get_exp_info.php',
            data: $.param({
                exp_id: exp_id,
                order: $scope.pairs_order[$scope.curr_order-1], //Instead of $scope.curr_order
                term_a_or_b: 'sch_id_1',
                exclude_ids: $scope.exclude_ids
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (data) {

            $scope.schema=data.data;
            $scope.h_1=[];
            let h_1_temp=$scope.schema[0]['h_1'].split(".");
            let last=0;
            for (let j=0;j<h_1_temp.length;j++)
            {
                if ($scope.schema[0]['col_name'] === h_1_temp[j]){
                    $scope.h_1.push({"index":j,"val":h_1_temp[j],"color":'red', "weight":700});
                }
                else{
                    $scope.h_1.push({"index":j,"val":h_1_temp[j],"color":'green', "weight":100});
                }

                last=j;
            }
            for (let k=0;k<$scope.schema[0]['brothers'].length;k++)
            {
                $scope.h_1.push({"index":last,"val":$scope.schema[0]['brothers'][k],"color":'blue', "weight":100});
            }

            let str_instance="";
            if ("instance" in $scope.schema[0])
            {
                for (let i=0;i<$scope.schema.length;i++)
                {
                    str_instance=str_instance+$scope.schema[i]['instance']+", ";
                }
                str_instance=str_instance.substring(0, str_instance.length-2);
            }
            else {
                str_instance = "N/A";
            }

            //let index = Math.floor((Math.random() * schema.length) + 1);
            //console.log(schema[index]);
            document.getElementById("A_col_name").innerText= 'Term A - ' + $scope.schema[0]['col_name'];
            document.getElementById("A_col_type").innerText=$scope.schema[0]['col_type'];
            document.getElementById("A_col_instance").innerText=str_instance;
            $scope.exclude_ids = $scope.exclude_ids +  " and id!=" + $scope.schema[0]['index'];
            // console.log("ex_id",$scope.exclude_ids);
            $scope.curr_order = $scope.curr_order + 1; // Instead of the IF
            /*if ($scope.schema[0]['return_order'] === "change")
            {
                $scope.curr_order = $scope.curr_order + 1;
            }*/
            $scope.curr_realConf = $scope.schema[0]['realConf'];
            document.getElementById("user_confidence").value=50;
            document.getElementById("text_confidence_input").value = 50;
            callback($scope.schema);
        });

    };

    $scope.getExp = function(exp_id){
        // this function retrieves from the DB a pair to display in the expertiment.
        // first the callback function run - the term from schema 1.

        $scope.getExp2(function(schema){
            // then this function - the term from schema 2.
            $http({
                method: 'POST',
                url: 'php/get_exp_info.php',
                data: $.param({
                    exp_id: exp_id,
                    term_a_or_b: 'sch_id_2',
                    index_from_a: schema[0]['index']
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).then(function (data) {
                $scope.schema2=data.data;
                $scope.h_2=[];
                let h_2_temp=$scope.schema2[0]['h_2'].split(".");
                let last=0;
                for (let j=0;j<h_2_temp.length;j++)
                {
                    if ($scope.schema2[0]['col_name'] === h_2_temp[j]){
                        $scope.h_2.push({"index":j,"val":h_2_temp[j],"color":'red', "weight":700});
                    }
                    else{
                        $scope.h_2.push({"index":j,"val":h_2_temp[j],"color":'green', "weight":100});
                    }

                    last=j;
                }

                for (let k=0;k<$scope.schema2[0]['brothers'].length;k++)
                {
                    $scope.h_2.push({"index":last,"val":$scope.schema2[0]['brothers'][k],"color":'blue', "weight":100});
                }
                let str_instance="";
                if ("instance" in $scope.schema2[0]) {
                    for (let i = 0; i < $scope.schema2.length; i++) {
                        str_instance = str_instance + $scope.schema2[i]['instance'] + ", ";
                    }
                    str_instance=str_instance.substring(0, str_instance.length-2);
                }
                else {
                    str_instance = "N/A";
                }

                // Find major opinion on that pair
                $http({
                    method: 'POST',
                    url: 'php/get_major_opinion_for_correspondence.php',
                    data: $.param({
                        index_from_a: $scope.schema[0]['sch_id'],
                        index_from_b: $scope.schema2[0]['sch_id']
                    }),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).then(function (data) {
                    //console.log((data.data));
                    if (data.data === "1") { console.log(data.data); } //error
                    else {
                        let major_decision = data.data;
                        if(major_decision == 'null' || major_decision == ''){
                            major_decision = (Math.random()*100).toFixed(2);
                        }
                        document.getElementById("exp_pair_major").innerHTML= major_decision + "% Match";
                    }
                });

                document.getElementById("B_col_name").innerText='Term B - ' + $scope.schema2[0]['col_name'];
                document.getElementById("B_col_type").innerText=$scope.schema2[0]['col_type'];
                document.getElementById("B_col_instance").innerText=str_instance;
                document.getElementById("exp_pair_score").innerText= Math.round(($scope.schema2[0]['score'] + Number.EPSILON) * 100) +"% Similar";
                document.getElementById("HierarchyTable_contentA").scrollTo(0,0);
                document.getElementById("HierarchyTable_contentB").scrollTo(0,0);
            });
        },exp_id);
    };

    $scope.reset_conf_value = function() {
        document.getElementById("user_confidence").value = 50;
        document.getElementById("text_confidence_input").value = 50;
    };

    $scope.exp_res = function(){
        //this function save user answer for current pair to DB.

        if(document.getElementById("user_confidence").value == 50){
            $("#illegal_conf_choice").modal('show');
        } else {
            $http({
                method: 'POST',
                url: 'php/exp_res.php',
                data: $.param({
                    exp_id: $scope.curr_exp_id,
                    user_id: $scope.curr_user['id'],
                    sch_id_1: $scope.schema[0]['sch_id'],
                    sch_id_2: $scope.schema2[0]['sch_id'],
                    realconf: $scope.schema[0]['realConf'],
                    userconf: document.getElementById("user_confidence").value,
                    mouse_loc: $scope.mouse_moves,
                    user_ans_match: $scope.user_ans_match
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).then(function (data) {
                if (data.data === "1") {


                    // to disable init array of mouse locations add the comment sign
                    $scope.mouse_moves = [];

                    $scope.curr_count_ans = $scope.curr_count_ans + 1;
                    if ($scope.curr_count_ans >= $scope.total_ans_needed) // check if exp is done
                    {
                        if ($scope.done_test === false) // check if user in test exp, if yes - show instruction, else show finished
                        {
                            $scope.done_test = true;
                            $scope.curr_order = 1;
                            $scope.curr_count_ans = 0;

                            $("#experiment").hide();
                            $("#instruction_after").show();
                        } else {
                            $("#experiment").hide();
                            clearInterval($scope.timeElapsed);

                            document.getElementById("schemaMatchingExp").style.overflow = 'auto';

                            $("#loading").show();
                            var isSingleUser = 'True';
                            $scope.showConfidenceLineGraph(function (finish_conf) {

                                if (finish_conf === true) {
                                    $scope.showTimeRangeBarGraph(function (finish_time) {

                                        $scope.get_mouse_click_data(function (finish_click_data) {

                                            $scope.create_heat_map(function (finish_heatmap) {

                                                $scope.findClosestMatcher(function (finish_matcher) {

                                                    $scope.findPrecisionForUser(function (finish_precision) {

                                                        // document.getElementById("figureEightValidateField").placeholder = ($scope.validFieldFigureEight).toString();
                                                        $("#loading").hide();
                                                        $("#finish_exp_full").show();
                                                        $("#user_comments_recieved").hide();
                                                        $("#user_comments_form").show();
                                                        $scope.curr_order = 1;
                                                        $scope.curr_count_ans = 0;
                                                    });
                                                });

                                            }, isSingleUser);

                                        }, isSingleUser);

                                    });
                                } else {
                                    $("#loading").hide();
                                    $("#finish_exp_empty").show();
                                    $scope.curr_order = 1;
                                    $scope.curr_count_ans = 0;
                                }
                            });
                        }

                    } else if ($scope.done_test === true && ($scope.curr_count_ans % $scope.time_to_pause === 0)) {
                        // show pause modal every $scope.time_to_pause answers
                        // show pause only for non-test schema
                        $("#pause_exp_modal").modal('show');
                    }

                    if ( !($scope.done_test == true && $scope.curr_count_ans == 0) && ($scope.curr_count_ans < $scope.total_ans_needed)){
                        $scope.getExp($scope.curr_exp_id);
                    }
                    document.getElementById("user_confidence").value = 50;
                    document.getElementById("text_confidence_input").value = 50;

                    $scope.last_ans = $scope.user_ans_match;
                    $scope.user_ans_match = false; // init radio button match/no match
                } else // error while update the answer from user
                {
                    console.log(data.data);
                }

            });
        }
    };

    $scope.show_pause_after_feedback = function() {
        // this function show pause modal after the feedback modal dismissed.

        if($scope.done_test === true && ($scope.curr_count_ans % $scope.time_to_pause === 0)) {
            // show pause modal every $scope.time_to_pause answers
            // show pause only for non-test schema
            document.getElementById("pause_modal_body").innerHTML="Get ready for the next Step." +
                "<br>Pairs remaining: " + ($scope.total_ans_needed - $scope.curr_count_ans);
            $("#pause_exp_modal").modal('show');
            //console.log("pause");
        }

        // TODO: delete this?
        if ($scope.done_test === true)
        {
            $("#experiment").hide();
            $("#instruction_after").show();
        }
    };

    $scope.after_instructions = function () {
        // this function redirect user to begin the experiment
        $scope.begin_exp($scope.exp_after_test);
        $("#instruction_after").hide();
        const countDownDate = new Date().getTime() + $scope.exp_after_test['max_duration'] * 60000;
        $scope.timeElapsed = setInterval(function() {
            var now = new Date().getTime();
            var distance = countDownDate - now;

            if (distance <= 0){ // End the exp when allocated time has passed
                $("#experiment").hide();
                clearInterval($scope.timeElapsed);

                document.getElementById("schemaMatchingExp").style.overflow = 'auto';

                $("#loading").show();
                var isSingleUser = 'True';
                $scope.showConfidenceLineGraph(function(finish_conf) {

                    if(finish_conf === true){
                        $scope.showTimeRangeBarGraph(function(finish_time) {

                            $scope.get_mouse_click_data(function(finish_click_data) {

                                $scope.create_heat_map(function(finish_heatmap) {

                                    $scope.findClosestMatcher(function(finish_matcher) {

                                        $scope.findPrecisionForUser(function(finish_precision) {

                                            // document.getElementById("figureEightValidateField").placeholder = ($scope.validFieldFigureEight).toString();
                                            $("#loading").hide();
                                            $("#finish_exp_full").show();
                                            $("#user_comments_recieved").hide();
                                            $("#user_comments_form").show();
                                            $scope.curr_order = 1;
                                            $scope.curr_count_ans = 0;
                                        });
                                    });

                                }, isSingleUser);

                            }, isSingleUser);

                        });
                    } else {
                        $("#loading").hide();
                        $("#finish_exp_empty").show();
                        $scope.curr_order = 1;
                        $scope.curr_count_ans = 0;
                    }
                });
            }

            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);
            document.getElementById("time_elapsed").innerHTML =  "Time Remains: " + minutes + "m, " + seconds + "s ";
            document.getElementById("pause_modal_body").innerHTML = "Get ready for the next Step." +
                "<br>" + "Time Remains: " + minutes + "m, " + seconds + "s ";
        }, 1000);

    };

    $scope.new_admin = function() {
        // this function create new admin.
        $http({
            method: 'POST',
            url: 'php/new_admin.php',
            data: $.param({
                new_admin_email: document.getElementById("new_admin_email").value,
                new_admin_pass: document.getElementById("new_admin_pass").value,
                new_admin_name: document.getElementById("new_admin_name").value,
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (data) {
            if (data.data === "err")
            {
                document.getElementById("new_admin_log").innerHTML="Error";
                $timeout(function() {
                    document.getElementById("new_admin_log").innerHTML="";
                },3000);
            }
            else
            {
                document.getElementById("new_admin_log").innerHTML="Done";
                $timeout(function() {
                    document.getElementById("new_admin_log").innerHTML="";
                    $('#new_admin').modal('hide')
                },2000);
            }

        });

    };

    $scope.admin_login = function() {
        // this function check if admin authenticate correctly and adds menu options for admin.
        $http({
            method: 'POST',
            url: 'php/admin_login.php',
            data: $.param({
                admin_email: document.getElementById("admin_email").value,
                admin_pass: document.getElementById("admin_pass").value,
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (data) {
            if (data.data === "err") // sql error
            {
                document.getElementById("admin_login_log").innerHTML="Error";
                $timeout(function() {
                    document.getElementById("admin_login_log").innerHTML="";
                },3000);
            }
            else if (data.data === "no_user")
            {
                document.getElementById("admin_login_log").innerHTML="Wrong user or password";
                $timeout(function() {
                    document.getElementById("admin_login_log").innerHTML="";
                    $('#new_admin').modal('hide')
                },2000);
            }
            else {
                $scope.admin_details = data.data;
                document.getElementById("nav_admin").innerText = "";
                angular.element(document.getElementById("nav_admin")).append($compile(
                    "<a class=\"nav-link dropdown-toggle\"  id=\"navbarDropdownMenuLink\" data-toggle=\"dropdown\" href=\"#\"  aria-haspopup=\"true\"\n" +
                    "\t\t\t\t\t\t   aria-expanded=\"false\">More</a>\n" +
                    "\t\t\t\t\t\t<div class=\"dropdown-menu  dropdown-menu-right\" aria-labelledby=\"navbarDropdownMenuLink\" id=\"navbar_admin\">\n" +
                    "\t\t\t\t\t\t\t<a class=\"dropdown-item\" href=\"#\"  data-toggle=\"modal\" data-target=\"#new_admin\">New Admin</a>\n" +
                    "\t\t\t\t\t\t\t<a class=\"dropdown-item\" href=\"#\"  data-toggle=\"modal\" data-target=\"#add_exp_modal\">Add Task</a>\n" +
                    "\t\t\t\t\t\t\t<a class=\"dropdown-item\" href=\"#\"  data-toggle=\"modal\" data-target=\"#update_exp_modal\" ng-click=\"get_exp_for_update()\">Update Task</a>\n" +
                    "\t\t\t\t\t\t\t<a class=\"dropdown-item\" href=\"#\"  ng-click=\"hide_pages(); show_statistics(false)\">Show Statistics</a>\n" +
                    "\t\t\t\t\t\t\t<a class=\"dropdown-item\" href=\"#\"  ng-click=\"admin_logout()\">Logout</a>\n" +
                    "\t\t\t\t\t\t</div>")($scope));
                //console.log( $scope.admin_details);
                $timeout(function() {
                    document.getElementById("admin_email").value="";
                    document.getElementById("admin_pass").value="";
                    $('#admin_login').modal('hide')
                    document.getElementById("schemaMatchingExp").style.overflow = 'auto';
                },1000);
            }



        });

    };

    $scope.admin_logout = function(){
        // this function disconnect admin user and remove the admin panel from nav bar.
        $http({
            method: 'POST',
            url: 'php/admin_logout.php',
            data: $.param({

            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (data) {
            $scope.admin_details=[];
            document.getElementById("nav_admin").innerText = "";
            angular.element(document.getElementById("nav_admin")).append($compile(
                "<a class=\"nav-link dropdown-toggle\"  id=\"navbarDropdownMenuLink\" data-toggle=\"dropdown\" href=\"#\"  aria-haspopup=\"true\"\n" +
                "\t\t\t\t\t\t   aria-expanded=\"false\">More</a>\n" +
                "\t\t\t\t\t\t<div class=\"dropdown-menu  dropdown-menu-right\" aria-labelledby=\"navbarDropdownMenuLink\" id=\"navbar_admin\">\n" +
                "\t\t\t\t\t\t\t<a class=\"dropdown-item\" href=\"#\"  data-toggle=\"modal\" data-target=\"#admin_login\">Log in</a>\n" +
                "\t\t\t\t\t\t</div>")($scope));

        });

    };

    $scope.upload_exp_files = function(callback){
        $scope.files_to_upload={"csv":"","xml":[],"xsd":[]};

        let file = $scope.first_xml_file;
        // console.log(file);
        let exp_name = document.getElementById("exp_name").value;
        let uploadUrl = "php/fileUpload.php";
        let text = file.name;
        for (let i=0;i<file.length;i++)
        {
            $scope.files_to_upload['xml'].push(file[i].name);
        }
        fileUpload.uploadFileToUrl(file, uploadUrl, text,exp_name);


        file = $scope.first_xsd_file;
        //console.log(file);
        exp_name = document.getElementById("exp_name").value;
        uploadUrl = "php/fileUpload.php";
        text = file.name;
        $scope.files_to_upload['xsd'].push(file[0].name);
        fileUpload.uploadFileToUrl(file, uploadUrl, text,exp_name);


        file = $scope.file_csv;
        //console.log(file);
        exp_name = document.getElementById("exp_name").value;
        uploadUrl = "php/fileUpload.php";
        text = file.name;
        $scope.files_to_upload['csv']=file[0].name;
        fileUpload.uploadFileToUrl(file, uploadUrl, text,exp_name);

        file = $scope.sec_xml_file;
        //console.log(file);
        exp_name = document.getElementById("exp_name").value;
        uploadUrl = "php/fileUpload.php";
        text = file.name;
        for (let i=0;i<file.length;i++)
        {
            $scope.files_to_upload['xml'].push(file[i].name);
        }
        fileUpload.uploadFileToUrl(file, uploadUrl, text,exp_name);

        file = $scope.sec_xsd_file;
        //console.log(file);
        exp_name = document.getElementById("exp_name").value;
        uploadUrl = "php/fileUpload.php";
        text = file.name;
        $scope.files_to_upload['xsd'].push(file[0].name);
        fileUpload.uploadFileToUrl(file, uploadUrl, text,exp_name);

        //console.log($scope.files_to_upload);

        callback(); // create exp in db
    };

    $scope.add_exp = function () {

        $http({
            method: 'POST',
            url: 'php/new_exp.php',
            data: $.param({
                exp_name: document.getElementById("exp_name").value,
                exp_sch_name: document.getElementById("exp_sch_name").value,
                exp_max_num_pairs: document.getElementById("exp_max_num_pairs").value,
                exp_max_duration: document.getElementById("exp_max_duration").value,
                show_type: document.getElementById("show_type").checked,
                show_instance: document.getElementById("show_instance").checked,
                show_hierarchy: document.getElementById("show_hierarchy").checked,
                show_system_sugg: document.getElementById("show_system_sugg").checked,
                show_major_res: document.getElementById("show_major_res").checked,
                set_active: document.getElementById("set_active").checked
                //files: $scope.files_to_upload
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (data) {

            if (data.data === "err") {
                document.getElementById("add_exp_log").innerHTML="Error! ";
                $timeout(function() {
                    document.getElementById("add_exp_log").innerHTML="";
                },3000);
                console.log((data.data));
            } else {
                document.getElementById("add_exp_log").innerHTML="Added Succesfully! The Task ID is" + data.data;
                $timeout(function() {
                    document.getElementById("add_exp_log").innerHTML="";
                },3000);
                //console.log("new exp id:", data.data);
            }
        });
    };

    $scope.clear_add_exp_form = function() {
        document.getElementById("exp_name").value="";
        document.getElementById("exp_sch_name").value="";
        document.getElementById("exp_max_num_pairs").value="";
        document.getElementById("exp_max_duration").value="";
        document.getElementById("show_type").checked = false;
        document.getElementById("show_instance").checked = false;
        document.getElementById("show_hierarchy").checked = false;
        document.getElementById("show_system_sugg").checked = false;
        document.getElementById("show_major_res").checked = false;
        document.getElementById("set_active").checked = false;
    };

    $scope.show_coordinate = function($event){
        var xCor = ( $event['pageX'] * 1280 ) / document.body.clientWidth;
        var yCor = ( $event['pageY'] * 720 ) / document.body.clientHeight;
        //console.log(xCor);
        //console.log(yCor);
    };

    $scope.captureCoordinate = function($event){
        // this function save mouse location every 250 milliseconds (0.25 second)
        let d = new Date();
        if ($scope.last_time_mouse.length === 0)
        {
            $scope.last_time_mouse = d.getTime();
            let left=false,right=false,scroll=false;
            if ($event['which']===0){
                left=true;
            }
            else if ($event['which']===1){
                right=true;
            }
            else if ($event['which']===2){
                scroll=true;
            }

            var xCor = ( $event['pageX'] * 1280 ) / document.body.clientWidth;
            var yCor = ( $event['pageY'] * 720 ) / document.body.clientHeight;

            $scope.mouse_moves.push({"time":d.getTime(),"x":xCor,"y":yCor,"l":left,"r":right,"s":scroll});
        }
        else if (d.getTime() - $scope.last_time_mouse > 250 )
        {
            let left=false,right=false,scroll=false;
            if ($event['which']===0){
                left=true;
            }
            else if ($event['which']===1){
                right=true;
            }
            else if ($event['which']===2){
                scroll=true;
            }

            var xCor = ( $event['pageX'] * 1280 ) / document.body.clientWidth;
            var yCor = ( $event['pageY'] * 720 ) / document.body.clientHeight;

            $scope.mouse_moves.push({"time":d.getTime(),"x":xCor,"y":yCor,"l":left,"r":right,"s":scroll});
            $scope.last_time_mouse = d.getTime();

        }

    };

    $scope.getCustomRepeatArray = function (size) {
        // this function makes the hierarchy design in the exp form.
        // get the current level in the hierarchy and return an array in that size - this is for ng repeat.
        let sized_array=new Array(size);
        for (let b=0;b<size-1;b++)
        {
            sized_array[b]=b;
        }

        return sized_array;
    };

    $scope.get_exp_for_update = function () {
        // this function get all the experiments meta data for the update modal for the admin.
        $http({
            method: 'POST',
            url: 'php/get_exp_for_update.php',
            data: $.param({

            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (data) {
            if (data.data === "1") //error
            {
                console.log(data.data);
            }
            else
            {
                $scope.experiments = data.data;
                for (let i = 0; i < $scope.experiments.length; i++)
                {
                    $scope.exp_ids.push($scope.experiments[i]['id']);
                }
            }

        });
    };

    $scope.update_exp = function () {
        // this function update every experiment according to changes made by admin in the update experiment modal.
        let exps = [];
        for (let i = 0; i < $scope.exp_ids.length; i++)
        {
            let name_l="upt_exp_name_"+$scope.exp_ids[i];
            let schema_name_l="upt_exp_shcema_name_"+$scope.exp_ids[i];
            let max_num_pairs_l="upt_exp_max_num_pairs_"+$scope.exp_ids[i];
            let max_duration_l="upt_exp_max_duration_"+$scope.exp_ids[i];

            let upt_exp_disp_type = "upt_exp_disp_type_checked_"+$scope.exp_ids[i];
            let disp_type_val=0;
            if (angular.element("#"+upt_exp_disp_type).length  && document.getElementById(upt_exp_disp_type).checked === true)
            {
                disp_type_val=1;
            }
            else{
                upt_exp_disp_type = "upt_exp_disp_type_"+$scope.exp_ids[i];
                if (angular.element("#"+upt_exp_disp_type).length  && document.getElementById(upt_exp_disp_type).checked === true)
                {
                    disp_type_val=1;
                }
            }

            let upt_exp_disp_instacne = "upt_exp_disp_instacne_checked_"+$scope.exp_ids[i];
            let disp_inst_val=0;
            if (angular.element("#"+upt_exp_disp_instacne).length>0  && document.getElementById(upt_exp_disp_instacne).checked === true)
            {
                disp_inst_val=1;
            }
            else{
                upt_exp_disp_instacne = "upt_exp_disp_instacne_"+$scope.exp_ids[i];
                if (angular.element("#"+upt_exp_disp_instacne).length>0 && document.getElementById(upt_exp_disp_instacne).checked === true)
                {
                    disp_inst_val=1;
                }
            }

            let upt_exp_disp_h = "upt_exp_disp_h_checked_"+$scope.exp_ids[i];
            let disp_h_val=0;
            if (angular.element("#"+upt_exp_disp_h).length  && document.getElementById(upt_exp_disp_h).checked === true)
            {
                disp_h_val=1;
            }
            else{
                upt_exp_disp_h = "upt_exp_disp_h_"+$scope.exp_ids[i];
                if (angular.element("#"+upt_exp_disp_h).length  && document.getElementById(upt_exp_disp_h).checked === true)
                {
                    disp_h_val=1;
                }
            }

            let upt_exp_disp_system_sugg = "upt_exp_disp_system_sugg_checked_"+$scope.exp_ids[i];
            let disp_system_sugg_val=0;
            if (angular.element("#"+upt_exp_disp_system_sugg).length  && document.getElementById(upt_exp_disp_system_sugg).checked === true)
            {
                disp_system_sugg_val=1;
            }
            else{
                upt_exp_disp_system_sugg = "upt_exp_disp_system_sugg_"+$scope.exp_ids[i];
                if (angular.element("#"+upt_exp_disp_system_sugg).length  && document.getElementById(upt_exp_disp_system_sugg).checked === true)
                {
                    disp_system_sugg_val=1;
                }
            }

            let upt_exp_disp_major = "upt_exp_disp_major_checked_"+$scope.exp_ids[i];
            let disp_major_val=0;
            if (angular.element("#"+upt_exp_disp_major).length  && document.getElementById(upt_exp_disp_major).checked === true)
            {
                disp_major_val=1;
            }
            else{
                upt_exp_disp_major = "upt_exp_disp_major_"+$scope.exp_ids[i];
                if (angular.element("#"+upt_exp_disp_major).length  && document.getElementById(upt_exp_disp_major).checked === true)
                {
                    disp_major_val=1;
                }
            }

            let upt_exp_active = "upt_exp_is_active_checked_"+$scope.exp_ids[i];
            let disp_active_val=0;
            if (angular.element("#"+upt_exp_active).length  && document.getElementById(upt_exp_active).checked === true)
            {
                disp_active_val=1;
            }
            else{
                upt_exp_active = "upt_exp_is_active_"+$scope.exp_ids[i];
                if (angular.element("#"+upt_exp_active).length  && document.getElementById(upt_exp_active).checked === true)
                {
                    disp_active_val=1;
                }
            }

            exps.push({'id':$scope.exp_ids[i],
                'name':document.getElementById(name_l).value,
                'schema_name':document.getElementById(schema_name_l).value,
                'max_num_pairs':document.getElementById(max_num_pairs_l).value,
                'max_duration':document.getElementById(max_duration_l).value,
                'disp_type': disp_type_val,
                'disp_instance': disp_inst_val,
                'disp_h': disp_h_val,
                'disp_system_sugg': disp_system_sugg_val,
                'disp_major_res': disp_major_val,
                'is_active': disp_active_val
            })
        }

        $http({
            method: 'POST',
            url: 'php/update_exp.php',
            data: $.param({
                exps: exps
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (data) {
            if (data.data === "1") //error
            {
                document.getElementById("update_exp_log").innerHTML="Error! ";
                $timeout(function() {
                    document.getElementById("update_exp_log").innerHTML="";
                },3000);

            }
            else
            {
                document.getElementById("update_exp_log").innerHTML="Changes Saved! ";
                $timeout(function() {
                    document.getElementById("update_exp_log").innerHTML="";
                },3000);
            }

        });
    };

    $scope.getColors = function(numOfColors) {
        let letters = '0123456789ABCDEF';
        let color = '#';
        let colors=[];
        for (let j=0; j < numOfColors ; j++)
        {
            color = '#';
            for (let i = 0; i < 6; i++ ) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            colors.push(color);
        }
        return colors;
    };

    $scope.showAggregateConfidenceLineGraph = function (callback) {
        document.getElementById("confidenceLineGraphAggregate").innerHTML = "";
        let xLabels = [];
        let datasets_val = [];

        if($scope.usersToShowStats.length === 1){
            let all_users = [];
            let exps_id = [];
            for (let index in $scope.allUserNames){
                if(index >= 2){
                    all_users.push($scope.allUserNames[index].id);
                }
            }

            for (let index in $scope.relExpForUsersToShowStats) {
                exps_id.push($scope.relExpForUsersToShowStats[index].id);
            }

            $http({
                method: 'POST',
                url: 'php/get_agg_confidence_and_answer_values.php',
                data: $.param({
                    usersToShowStats : all_users,
                    groupsToShowStats : $scope.relExpForUsersToShowStats
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).then(function (data) {
                if (data.data.length !== 0) {

                    let yDataConf = [];
                    let yDataCorrAns = [];

                    let j = 1;
                    for (let item in data.data){

                        const avgConf = Math.round((data.data)[item]['avgConf'] * 100) / 100;
                        const avgCorrAns = Math.round((data.data)[item]['avgCorrAns'] * 100) / 100;

                        xLabels.push(j);
                        yDataConf.push(avgConf);
                        yDataCorrAns.push(avgCorrAns);

                        j++;
                    }
                    $http({
                        method: 'POST',
                        url: 'php/get_confidence_and_answer_values.php',
                        data: $.param({
                            curr_user: $scope.usersToShowStats[0],
                            curr_exp_id: exps_id,
                            multi_exp: "true"
                        }),
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }).then(function (data) {

                        if (data.data.length !== 0) {
                            let yData_user = [];
                            let point_styles = [];

                            var checkmark_icon = new Image();
                            checkmark_icon.src = '/images/checkmark_icon.png';
                            checkmark_icon.height = "20";
                            checkmark_icon.width = "20";

                            var x_icon = new Image();
                            x_icon.src = '/images/x_icon.png';
                            x_icon.height = "20";
                            x_icon.width = "20";

                            let j = 1;
                            for (let item in data.data){
                                const user_conf = (data.data)[item]['user_conf'];
                                const isCorrectAnswer = (data.data)[item]['isCorrectAnswer'];

                                yData_user.push(user_conf);

                                if(isCorrectAnswer == 1){
                                    point_styles.push(checkmark_icon);
                                }else{
                                    point_styles.push(x_icon);
                                }

                                j++;
                            }

                            //[82.95, 55.58, 74.26, 65.36, 90.92, 42.12], //yDataConf, [68.92, 48.5, 34.56, 69.25, 86.8, 15.67], //yDataCorrAns,
                            datasets_val = [{
                                label: "Avg. Confidence In User Exp",
                                data: yDataConf, //[88.42, 65.92, 69.5, 75, 96.36, 52.7]
                                borderColor: "#ff8405",
                                backgroundColor: "#ff8405",
                                borderWidth: 0.7,
                                pointRadius: 5,
                                pointHoverRadius: 7,
                                pointBackgroundColor: "#ff8405",
                                fill: false,
                            }, {
                                label: "Avg. Correct Answers In User Exp",
                                data: yDataCorrAns, //[76.86, 58.5, 34.3, 64.1, 84.42, 25.29]
                                borderColor: "#000dad",
                                backgroundColor: "#000dad",
                                borderWidth: 0.7,
                                pointRadius: 5,
                                pointHoverRadius: 7,
                                pointBackgroundColor: "#000dad",
                                fill: false,
                            }, {
                                label: "User Confidence Level and Correct Answers",
                                data: yData_user, //[63, 70, 85, 55, 75, 91]
                                borderColor: "#000000",
                                backgroundColor: "#000000",
                                borderWidth: 0.7,
                                pointRadius: 5,
                                pointHoverRadius: 7,
                                pointStyle: point_styles, //[checkmark_icon, x_icon, x_icon, checkmark_icon, checkmark_icon, x_icon]
                                //pointBackgroundColor: colorOfPoints,
                                fill: false,
                            }];


                            const ctx = document.getElementById("confidenceLineGraphAggregate").getContext("2d");
                            if ($scope.confidenceLineGraphAggregate){
                                $scope.confidenceLineGraphAggregate.destroy();
                            }

                            Chart.defaults.global.defaultFontColor = 'black';
                            Chart.defaults.global.defaultFontFamily = "Calibri";
                            Chart.defaults.global.defaultFontSize = 14;

                            $scope.confidenceLineGraphAggregate = new Chart(ctx, {
                                type: 'line',
                                data: {
                                    labels: xLabels,
                                    datasets: datasets_val
                                },
                                options: {
                                    tooltips: {
                                        mode: 'index',
                                        callbacks: {
                                            title: function (tooltipItem, data) {
                                                return 'Pair Order ' + data['labels'][tooltipItem[0]['index']];
                                            },
                                            label: function (tooltipItem, data) {
                                                var xLabel = data.datasets[tooltipItem.datasetIndex].label;
                                                var yLabel = tooltipItem.yLabel;
                                                if(xLabel == 'User Confidence Level and Correct Answers'){
                                                    var image = point_styles[tooltipItem['index']];
                                                    if (image == checkmark_icon){
                                                        return 'User answers correct with Confidence Level of: ' + yLabel + '%';
                                                    }
                                                    else {
                                                        return 'User answers incorrect with Confidence Level of: ' + yLabel + '%';
                                                    }
                                                } else {
                                                    return xLabel + ': ' + yLabel + '%';
                                                }
                                            }
                                        }
                                    },
                                    scales: {
                                        yAxes: [{
                                            ticks: {
                                                min: 0,
                                            },
                                            scaleLabel: {
                                                display: true,
                                                labelString: '%'
                                            }
                                        }],
                                        xAxes: [{
                                            scaleLabel: {
                                                display: true,
                                                labelString: 'Pair Order'
                                            }
                                        }],
                                    },
                                    legend: false,
                                    legendCallback: function(chart) {
                                        var text = [];
                                        var countLiInLine = 0;
                                        text.push('<ul class="' + chart.id + '-legend" style="cursor: default; text-align: center; margin-bottom: 0px;">');
                                        for (var i = 0; i < chart.data.datasets.length; i++) {
                                            var line_color = chart.data.datasets[i].backgroundColor;
                                            var label = chart.data.datasets[i].label;

                                            if(line_color == "#000000"){

                                                text.push('<li style="display: inline-block; list-style-type: none;">' +
                                                    '<span class="conf_legend" style="padding-top: 10px; color:' + line_color +' "></span>');
                                                text.push('<span style="margin-left: 15px; float: left; font-size: 14px; font-family: \'Calibri\';">'
                                                    + 'User Confidence' + '</span>');
                                                text.push('</li><div style="clear: both"></div>');

                                                text.push('<li style="display: inline-block; list-style-type: none;">' +
                                                    '<span class="conf_legend" style="padding-top: 0px; color:' + line_color +' ">' +
                                                    '<img src="/images/checkmark_icon.png" width="20" height="20" alt="">' + '</span>');
                                                text.push('<span style="margin-left: 15px; float: left; font-size: 14px; font-family: \'Calibri\';">'
                                                    + 'Correct Answer' + '</span>');

                                                text.push('<span class="conf_legend" style="padding-top: 1px; margin-left: 15px; color:' + line_color +' ">' +
                                                    '<img src="/images/x_icon.png" width="20" height="20" alt="">' + '</span>' +
                                                    '<span style="margin-left: 15px; float: left; font-size: 14px; font-family: \'Calibri\';">'
                                                    + 'Incorrect Answer' + '</span>');

                                                text.push('</li><div style="clear: both"></div>');
                                            } else {
                                                if(countLiInLine == 0 ){
                                                    text.push('<li style="display: inline-block; list-style-type: none;">' +
                                                        '<span class="conf_legend" style="color:' + line_color +' ">' +
                                                        '<i class="fas fa-circle fa-sm" style="display: inline-block;' +
                                                        ' color: ' + line_color + ';"></i></span>');

                                                    text.push('<span style="margin-left: 15px; float: left; font-size: 14px; font-family: \'Calibri\';">'
                                                        + chart.data.datasets[i].label + '</span>');

                                                    countLiInLine = countLiInLine + 1;
                                                } else {
                                                    text.push('<span class="conf_legend" style="margin-left: 15px; color:' + line_color +' ">' +
                                                        '<i class="fas fa-circle fa-sm" style="display: inline-block;' +
                                                        ' color: ' + line_color + ';"></i></span>');

                                                    text.push('<span style="margin-left: 15px; float: left; font-size: 14px; font-family: \'Calibri\';">'
                                                        + chart.data.datasets[i].label + '</span>');

                                                    text.push('</li><div style="clear: both"></div>');
                                                }
                                            }
                                        }
                                        text.push('</ul>');
                                        return text.join('');
                                    },

                                    title: {
                                        display: true,
                                        text: 'Confidence Level & Correct Answers as function of Pair Order',
                                        fontSize: 18
                                    }
                                }
                            });
                            document.getElementById("confidenceLineGraphAggregate").innerHTML = $scope.confidenceLineGraphAggregate;
                            document.getElementById("confidenceLineGraphAggregate-legends").innerHTML = ($scope.confidenceLineGraphAggregate).generateLegend();
                            callback(true);

                        } else {
                            callback(false);
                        }
                    });
                } else {
                    callback(false);
                }
            });
            callback(true);

        } else {
            $http({
                method: 'POST',
                url: 'php/get_agg_confidence_and_answer_values.php',
                data: $.param({
                    usersToShowStats : $scope.usersToShowStats,
                    groupsToShowStats : $scope.groupsToShowStats
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).then(function (data) {
                if (data.data.length !== 0) {

                    let yDataConf = [];
                    let yDataCorrAns = [];

                    let j = 1;
                    for (let item in data.data){

                        const avgConf = Math.round((data.data)[item]['avgConf'] * 100) / 100;
                        const avgCorrAns = Math.round((data.data)[item]['avgCorrAns'] * 100) / 100;

                        xLabels.push(j);
                        yDataConf.push(avgConf);
                        yDataCorrAns.push(avgCorrAns);

                        j++;
                    }

                    datasets_val = [{
                        label: "Avg. Confidence",
                        data: yDataConf, //[82.95, 55.58, 74.26, 65.36, 90.92, 42.12]
                        borderColor: "#ff8405",
                        backgroundColor: "#ff8405",
                        borderWidth: 0.7,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        pointBackgroundColor: "#ff8405",
                        fill: false,
                    }, {
                        label: "Avg. Correct Answers",
                        data: yDataCorrAns, //[68.92, 48.5, 34.56, 69.25, 86.8, 15.67],
                        borderColor: "#000dad",
                        backgroundColor: "#000dad",
                        borderWidth: 0.7,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        pointBackgroundColor: "#000dad",
                        fill: false,
                    }];

                    const ctx = document.getElementById("confidenceLineGraphAggregate").getContext("2d");
                    if ($scope.confidenceLineGraphAggregate){
                        $scope.confidenceLineGraphAggregate.destroy();
                    }

                    Chart.defaults.global.defaultFontColor = 'black';
                    Chart.defaults.global.defaultFontFamily = "Calibri";
                    Chart.defaults.global.defaultFontSize = 14;

                    $scope.confidenceLineGraphAggregate = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: xLabels,
                            datasets: datasets_val
                        },
                        options: {
                            tooltips: {
                                mode: 'index',
                                callbacks: {
                                    title: function (tooltipItem, data) {
                                        return 'Pair Order ' + data['labels'][tooltipItem[0]['index']];
                                    },
                                    label: function (tooltipItem, data) {
                                        var xLabel = data.datasets[tooltipItem.datasetIndex].label;
                                        var yLabel = tooltipItem.yLabel;
                                        return xLabel + ': ' + yLabel + '%';
                                    }
                                }
                            },
                            scales: {
                                yAxes: [{
                                    ticks: {
                                        min: 0,
                                    },
                                    scaleLabel: {
                                        display: true,
                                        labelString: '%'
                                    }
                                }],
                                xAxes: [{
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Pair Order'
                                    }
                                }],
                            },

                            legend: false,
                            legendCallback: function(chart) {
                                var text = [];
                                var countLiInLine = 0;
                                text.push('<ul class="' + chart.id + '-legend" style="cursor: default; text-align: center; margin-bottom: 0px;">');
                                for (var i = 0; i < chart.data.datasets.length; i++) {
                                    var line_color = chart.data.datasets[i].backgroundColor;
                                    var label = chart.data.datasets[i].label;
                                    if(countLiInLine == 0 ){
                                        text.push('<li style="display: inline-block; list-style-type: none;">' +
                                            '<span class="conf_legend" style="color:' + line_color +' ">' +
                                            '<i class="fas fa-circle fa-sm" style="display: inline-block;' +
                                            ' color: ' + line_color + ';"></i></span>');

                                        text.push('<span style="margin-left: 15px; float: left; font-size: 14px; font-family: \'Calibri\';">'
                                            + chart.data.datasets[i].label + '</span>');

                                        countLiInLine = countLiInLine + 1;
                                    } else {
                                        text.push('<span class="conf_legend" style="margin-left: 15px; color:' + line_color +' ">' +
                                            '<i class="fas fa-circle fa-sm" style="display: inline-block;' +
                                            ' color: ' + line_color + ';"></i></span>');

                                        text.push('<span style="margin-left: 15px; float: left; font-size: 14px; font-family: \'Calibri\';">'
                                            + chart.data.datasets[i].label + '</span>');

                                        text.push('</li><div style="clear: both"></div>');
                                    }
                                }
                                text.push('</ul>');
                                return text.join('');
                            },

                            title: {
                                display: true,
                                text: 'Confidence Level & Correct Answers as function of Pair Order',
                                fontSize: 18
                            }
                        }
                    });
                    document.getElementById("confidenceLineGraphAggregate").innerHTML = $scope.confidenceLineGraphAggregate;
                    document.getElementById("confidenceLineGraphAggregate-legends").innerHTML = ($scope.confidenceLineGraphAggregate).generateLegend();
                    callback(true);
                } else {
                    callback(false);
                }
            });
        }

    };

    $scope.showConfidenceLineGraph = function (callback) {
        document.getElementById("confidenceLineGraph").innerHTML = "";

        $http({
            method: 'POST',
            url: 'php/get_confidence_and_answer_values.php',
            data: $.param({
                curr_user: $scope.curr_user['id'],
                curr_exp_id: $scope.curr_exp_id,
                multi_exp: "false"
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (data) {

            if (data.data.length !== 0) {

                let xLabels = [];
                let yData = [];
                //let colorOfPoints = [];
                let point_styles = [];

                var checkmark_icon = new Image();
                checkmark_icon.src = '/images/checkmark_icon.png';
                checkmark_icon.height = "20";
                checkmark_icon.width = "20";

                var x_icon = new Image();
                x_icon.src = '/images/x_icon.png';
                x_icon.height = "20";
                x_icon.width = "20";

                let j = 1;
                for (let item in data.data){
                    const user_conf = (data.data)[item]['user_conf'];
                    const isCorrectAnswer = (data.data)[item]['isCorrectAnswer'];

                    xLabels.push(j);
                    yData.push(user_conf);

                    if(isCorrectAnswer == 1){
                        point_styles.push(checkmark_icon);
                        //colorOfPoints.push("#0ccd00");
                    }else{
                        point_styles.push(x_icon);
                        //colorOfPoints.push("#cd0800");
                    }

                    j++;
                }

                const ctx = document.getElementById("confidenceLineGraph").getContext("2d");
                if ($scope.confidenceLineGraph){
                    $scope.confidenceLineGraph.destroy();
                }

                Chart.defaults.global.defaultFontColor = 'black';
                Chart.defaults.global.defaultFontFamily = "Calibri";
                Chart.defaults.global.defaultFontSize = 14;

                $scope.confidenceLineGraph = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: xLabels,
                        datasets: [{
                            data: yData, //[63, 70, 85, 55, 75, 91],
                            borderColor: "#000000",
                            pointStyle: point_styles, //[checkmark_icon, x_icon, x_icon, checkmark_icon, checkmark_icon, x_icon],
                            borderWidth: 0.7,
                            pointRadius: 5,
                            pointHoverRadius: 7,
                            //pointBackgroundColor: colorOfPoints,
                            fill: false,
                        }
                        ]
                    },
                    options: {
                        tooltips: {
                            displayColors: false,
                            callbacks: {
                                custom: function(tooltip) {
                                    tooltip.displayColors = false;
                                },
                                title: function (tooltipItem, data) {
                                    return 'Pair Order ' + data['labels'][tooltipItem[0]['index']];
                                },
                                label: function (tooltipItem, data) {
                                    var image = data['datasets'][0]['pointStyle'][tooltipItem['index']];
                                    var yLabel = tooltipItem.yLabel;
                                    if (image == checkmark_icon){
                                        var imgString = '<div><img src="'+checkmark_icon.src+'" height="'+checkmark_icon.height+'"' +
                                            ' width="'+checkmark_icon.width+'"/></div>';
                                        return ['Correct Answer','Confidence Level: ' + yLabel + '%'];
                                    }
                                    else {
                                        var imgString = '<div><img src="'+x_icon.src+'" height="'+x_icon.height+'"' +
                                            ' width="'+x_icon.width+'"/></div>';
                                        return ['Incorrect Answer', 'Confidence Level: ' + yLabel + '%'];
                                    }
                                }
                            }
                        },
                        scales: {
                            yAxes: [{
                                ticks: {
                                    min: 0,
                                },
                                scaleLabel: {
                                    display: true,
                                    labelString: '%'
                                }
                            }],
                            xAxes: [{
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Pair Order'
                                }
                            }],
                        },
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Confidence Level & Correct Answers as function of Pair Order',
                            fontSize: 18
                        }
                    },
                });

                document.getElementById("confidenceLineGraph").innerHTML = $scope.confidenceLineGraph;
                callback(true);

            } else {
                callback(false);

            }
        });

    };

    $scope.showTimeRangeBarGraph = function (callback) {
        document.getElementById("timeBarGraph").innerHTML = "";

        $http({
            method: 'POST',
            url: 'php/get_time_range_and_answers.php',
            data: $.param({
                curr_user: $scope.curr_user['id'],
                curr_exp_id: $scope.curr_exp_id
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (data) {

            if (data.data.length !== 0) {

                let xLabels = [];
                let yData = [];
                let colorOfPoints = [];

                let j = 1;
                for (let item in data.data){
                    const diff_sec = Math.round((data.data)[item]['diff_sec'] * 100) / 100;
                    const isCorrectAnswer = (data.data)[item]['isCorrectAnswer'];

                    xLabels.push(j);
                    yData.push(diff_sec);

                    if(isCorrectAnswer == 1){
                        colorOfPoints.push("#0ccd00");
                    }else{
                        colorOfPoints.push("#cd0800");
                    }

                    j++;
                }

                //colorOfPoints = ["#0ccd00", "#cd0800", "#cd0800", "#0ccd00","#0ccd00", "#cd0800"];

                const ctx = document.getElementById("timeBarGraph").getContext("2d");
                if ($scope.timeBarGraph){
                    $scope.timeBarGraph.destroy();
                }

                Chart.defaults.global.defaultFontColor = 'black';
                Chart.defaults.global.defaultFontFamily = "Calibri";
                Chart.defaults.global.defaultFontSize = 14;

                $scope.timeBarGraph = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: xLabels,
                        datasets: [{
                            data: yData, //[12, 25, 20, 15, 6, 32]
                            borderColor: "#000000",
                            backgroundColor: colorOfPoints,
                        }
                        ]
                    },

                    options: {
                        tooltips: {
                            displayColors: false,
                            callbacks: {
                                title: function (tooltipItem, data) {
                                    return 'Pair Order' + data['labels'][tooltipItem[0]['index']];
                                },
                                label: function (tooltipItem, data) {
                                    var pointColor = data['datasets'][0]['backgroundColor'][tooltipItem['index']];
                                    var yLabel = tooltipItem.yLabel;
                                    if(pointColor == "#0ccd00"){
                                        return ['Correct Answer','Answer time: ' + yLabel + ' seconds'];
                                    }else {
                                        return ['Incorrect Answer','Answer time: ' + yLabel + ' seconds'];
                                    }
                                }
                            }
                        },
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Answer Time as function of Pair Order',
                            fontSize: 18
                        },
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true
                                },
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Time (sec)'
                                }
                            }],
                            xAxes: [{
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Pair Order'
                                }
                            }],
                        }
                    },
                });

                document.getElementById("timeBarGraph").innerHTML = $scope.timeBarGraph;
                callback(true);

            } else {
                //console.log('Data for bar graph data - time range is empty');
                callback(false);
            }
        });

    };

    $scope.showAggregateTimeRangeBarGraph = function (callback) {
        document.getElementById("timeBarGraphAggregate").innerHTML = "";

        $http({
            method: 'POST',
            url: 'php/get_agg_time_range_and_answers.php',
            data: $.param({
                usersToShowStats : $scope.usersToShowStats,
                groupsToShowStats : $scope.groupsToShowStats
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (data) {

            if (data.data.length !== 0) {

                /*if ($scope.usersToShowStats.length == 1){
                    data.data = [{'avgTime': 12, 'avgCorrAns': 1},{'avgTime': 25, 'avgCorrAns': 0},
                        {'avgTime': 20, 'avgCorrAns': 0},{'avgTime': 15, 'avgCorrAns': 1},
                        {'avgTime': 6, 'avgCorrAns': 4},{'avgTime': 32, 'avgCorrAns': 0}];
                } else {
                    data.data = [{'avgTime': 8.214, 'avgCorrAns': 0.6892},{'avgTime': 22.23, 'avgCorrAns': 0.485},
                        {'avgTime': 27.124, 'avgCorrAns': 0.3456},{'avgTime': 16.87, 'avgCorrAns': 0.6925},
                        {'avgTime': 10.627, 'avgCorrAns': 0.868},{'avgTime': 40.3525, 'avgCorrAns': 0.1567}];
                }*/
                let xLabels = [];
                let yData = [];
                let avgCorrAnsArr = [];
                let colorOfPoints = [];

                let j = 1;
                for (let item in data.data){
                    const avgTime = Math.round((data.data)[item]['avgTime'] * 100) / 100;
                    var avgCorrAns = Math.round((data.data)[item]['avgCorrAns'] * 100);

                    xLabels.push(j);
                    yData.push(avgTime);
                    avgCorrAnsArr.push(avgCorrAns);

                    // Colors
                    // functions for bar colors - agg time range
                    function Interpolate(start, end, steps, count) {
                        var s = start,
                            e = end,
                            final = s + (((e - s) / steps) * count);
                        return Math.floor(final);
                    }

                    function Color(_r, _g, _b) {
                        var r, g, b;
                        var setColors = function(_r, _g, _b) {
                            r = _r;
                            g = _g;
                            b = _b;
                        };

                        setColors(_r, _g, _b);
                        this.getColors = function() {
                            var colors = {
                                r: r,
                                g: g,
                                b: b
                            };
                            return colors;
                        };
                    }

                    red = new Color(232, 9, 26),
                        yellow = new Color(255, 255, 0),
                        green = new Color(6, 170, 60),
                        start = red,
                        end = yellow;

                    if (avgCorrAns > 50) {
                        start = yellow;
                        end = green;
                        avgCorrAns = avgCorrAns % 51;
                    }
                    var startColors = start.getColors(),
                        endColors = end.getColors();
                    var r = Interpolate(startColors.r, endColors.r, 50, avgCorrAns);
                    var g = Interpolate(startColors.g, endColors.g, 50, avgCorrAns);
                    var b = Interpolate(startColors.b, endColors.b, 50, avgCorrAns);

                    var colorString = "rgb(" + r + "," + g + "," + b + ")";
                    colorOfPoints.push(colorString);

                    j++;
                }

                const ctx = document.getElementById("timeBarGraphAggregate").getContext("2d");

                if ($scope.timeBarGraphAggregate){
                    $scope.timeBarGraphAggregate.destroy();
                }

                Chart.defaults.global.defaultFontColor = 'black';
                Chart.defaults.global.defaultFontFamily = "Calibri";
                Chart.defaults.global.defaultFontSize = 14;

                $scope.timeBarGraphAggregate = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: xLabels,
                        datasets: [{
                            data: yData,
                            borderColor: "#000000",
                            backgroundColor: colorOfPoints,
                        }
                        ]
                    },
                    options: {
                        tooltips: {
                            callbacks: {
                                title: function (tooltipItem, data) {
                                    return 'Pair Order ' + data['labels'][tooltipItem[0]['index']];
                                },
                                label: function (tooltipItem, data) {
                                    var yLabel = avgCorrAnsArr[tooltipItem['index']];
                                    if($scope.usersToShowStats.length === 1){
                                        if(yLabel == 100){
                                            return 'Correct Answer';
                                        }else {
                                            return 'Incorrect Answer';
                                        }
                                    } else {
                                        return 'Avg. Correct Answers: ' + yLabel + '%';
                                    }
                                },
                                afterLabel: function (tooltipItem, data) {
                                    var yLabel = data['datasets'][0]['data'][tooltipItem['index']];
                                    if($scope.usersToShowStats.length === 1){
                                        return 'Answer time: ' + yLabel + ' seconds';
                                    } else {
                                        return 'Avg. Answer Time: ' + yLabel + ' seconds';
                                    }
                                }
                            }
                        },
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Answer Time as function of Pair Order',
                            fontSize: 18
                        },
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true
                                },
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Time (sec)'
                                }
                            }],
                            xAxes: [{
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Pair Order'
                                }
                            }],
                        }
                    }
                });

                document.getElementById("timeBarGraphAggregate").innerHTML = $scope.timeBarGraphAggregate;
                callback(true);

            } else {
                callback(false);
            }
        });

    };

    $scope.add_user_data_finish_exp = function(){

        $http({
            method: 'POST',
            url: 'php/exp_add_user_data_finish_exp.php',
            data: $.param({
                user_id:  $scope.curr_user['id'],
                id_card: document.getElementById("new_user_card_id").value,
                u_validFieldFigureEight: $scope.validFieldFigureEight
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (data) {
            if (data.data !== "err")
            {
                document.getElementById("show_message_after_finish_figure_8").innerText = "Results saved Successfully!";
                document.getElementById("show_message_after_finish_figure_8").style.color = "green";
            }
            else
            {
                document.getElementById("show_message_after_finish_figure_8").innerText = "Error while saving results.";
                document.getElementById("show_message_after_finish_figure_8").style.color = "red";
                console.log(data.data);
            }

        });
    };

    $scope.create_heat_map = function(callback, isSingleUser) {

        const max_x = 1280; //window.innerWidth + (100 - (window.innerWidth % 100)); //1300; //1290.0;
        const max_y = 720; //window.innerHeight + (100 - (window.innerHeight % 100));//window.screen.availHeight + (100 - window.screen.availHeight % 100);  //1300; //1290.0;
        const jump_in_x = 80; //30;
        const jump_in_y = 80; //80; //100;

        let xLabels = [];
        for(let x=jump_in_x; x<=max_x; x=x+jump_in_x){
            xLabels.push(x);
        }

        let yLabels = [];
        for(let y=jump_in_y; y<=max_y; y=y+jump_in_y){
            yLabels.push(y);
        }

        var idForHeatMap = 'heatMapGraphAggregate';
        if(isSingleUser === 'True'){
            idForHeatMap = 'heatMapUser';
        }

        Highcharts.chart(idForHeatMap, {

            chart: {
                height: (9 / 16 * 100) + '%', // 16:9 ratio
                type: 'heatmap',
                marginTop: 40,
                marginBottom: 80,
                plotBorderWidth: 1,
                plotBackgroundImage: '/images/questionScreen.png',
                style: {
                    fontFamily: 'Calibri',
                    fontSize: 14
                },
            },
            title: {
                text: 'Mouse Location During The Task',
                style: {
                    fontSize: 18,
                    fontWeight: 'bold'
                }
            },

            xAxis: {
                categories: xLabels,
            },

            yAxis: {
                categories: yLabels,
                title: true,
                reversed: true
            },

            colorAxis: {
                min: 0,
                minColor: 'rgb(255,255,255)',
                maxColor: '#ff2400'
            },

            legend: {
                align: 'right',
                layout: 'vertical',
                margin: 0,
                verticalAlign: 'top',
                y: 25,
                symbolHeight: 280
            },

            tooltip: {
                formatter: function () {
                    return '<b>' + this.point.value + '</b> Mouse Location Observed.';
                }
            },

            series: [{
                name: 'Mouse Location',
                borderWidth: 0,
                opacity: 0.5,
                data: $scope.arrDataForHeatMap,
                states: {
                    hover: {
                        enabled: false
                    }
                }
            }],

            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 800
                    },
                    chartOptions: {
                        yAxis: {
                            labels: {
                                formatter: function () {
                                    return this.value; // .charAt(0);
                                }
                            }
                        }
                    }
                }]
            }

        });
        callback();

    };

    $scope.get_mouse_click_data = function(callback, isSingleUser){
        $scope.allClicks = {};
        $http({
            method: 'POST',
            url: 'php/get_mouse_click_data.php',
            data: $.param({
                curr_user: $scope.curr_user['id'],
                curr_exp_id: $scope.curr_exp_id,
                isSingleUser : isSingleUser,
                usersToShowStats : $scope.usersToShowStats,
                groupsToShowStats : $scope.groupsToShowStats
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (data) {

            const max_x = 1280; //window.innerWidth + (100 - (window.innerWidth % 100));
            const max_y = 720; //window.innerHeight + (100 - (window.innerHeight % 100));
            const jump_in_x = 80;
            const jump_in_y = 80;

            $scope.arrForHeatMap = {};
            for(let x=jump_in_x; x<=max_x; x=x+jump_in_x){
                for(let y=jump_in_y; y<=max_y; y=y+jump_in_y){
                    $scope.arrForHeatMap[[x, y]] = 0;
                }
            }

            let count = 1;
            for(let index in data.data){
                const all_clicks_for_q = data.data[index];
                const all_clicks_list = all_clicks_for_q.split(';');
                for (let i_click in all_clicks_list){
                    if((all_clicks_list[i_click]).includes('(')) {
                        let click = JSON.parse((all_clicks_list[i_click].replace('(','['))
                            .replace(')',']'));

                        if(click[1] < max_x && click[2] < max_y){
                            const x_reminder = click[1] % jump_in_x;
                            const x_cell = jump_in_x*(Math.floor((click[1]-x_reminder)/jump_in_x)+1);

                            const y_reminder = click[2] % jump_in_y;
                            const y_cell = jump_in_y*(Math.floor((click[2]-y_reminder)/jump_in_y)+1);

                            $scope.arrForHeatMap[[x_cell, y_cell]] += 1;
                        }

                    }
                }
            }

            $scope.arrDataForHeatMap = [];
            let i = 0;
            for(let x=jump_in_x; x<=max_x; x=x+jump_in_x){
                let j = 0;
                for(let y=jump_in_y; y<=max_y; y=y+jump_in_y){
                    const item = [i,j,$scope.arrForHeatMap[[x, y]]];
                    $scope.arrDataForHeatMap.push(item);
                    j += 1;
                }
                i += 1;
            }
            callback();

        });
    };

    $scope.get_rel_exp_by_users = function (callback) {
        $http({
            method: 'POST',
            url: 'php/get_rel_exp_by_users.php',
            data: $.param({
                usersToShowStats : $scope.usersToShowStats
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (data) {
            $scope.relExpForUsersToShowStats = [];
            if (data.data !== '1') {

                for (let i = 0; i < data.data.length; i++)
                {
                    $scope.relExpForUsersToShowStats.push({"id" : data.data[i]['id'],
                        "max_num_pairs" : data.data[i]['max_num_pairs']});
                }
                callback(true);
            } else {
                console.log('Get rel task for filtered users failed');
                callback(false);
            }
        });
    };

    $scope.getDataForFiterStatistics = function (callback) {

        if($scope.NotFirstShowOfStatistics === false){
            $scope.allUserNames = [];
            $scope.allTestExpNames = [];

            $http({
                method: 'POST',
                url: 'php/get_data_for_filter_stats.php',
                data: $.param({

                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).then(function (data) {

                if (data.data !== '1') {

                    $scope.allUserNames.push({"fullName" : "None", "checked" : false});
                    $scope.allUserNames.push({"fullName" : "All", "checked" : true});

                    $scope.allTestExpNames.push({"exp_name" : "None", "checked" : false});
                    $scope.allTestExpNames.push({"exp_name" : "All", "checked" : true});

                    for (let i = 0; i < data.data.length; i++)
                    {
                        if(data.data[i]['isSingleUser'] === 'True'){
                            $scope.allUserNames.push({"fullName" : data.data[i]['fullName'],
                                "id" : data.data[i]['id'], "checked" : true});
                        }else {
                            $scope.allTestExpNames.push({"exp_name" : data.data[i]['exp_name'],
                                "id" : data.data[i]['id'], "max_num_pairs" : data.data[i]['max_num_pairs'], "checked" : true});
                        }
                    }
                    callback(true);
                } else {
                    console.log('Get data for statistics filter failed');
                    callback(false);

                }
            });
        } else {
            callback(true);
        }
    };

    $scope.update_checkbox_stats = function (isUser, itemClicked) {

        if(isUser === 'True'){
            if(itemClicked === 'All'){
                $scope.allUserNames[0].checked = false; // None

                if($scope.allUserNames[1].checked === true){ // All was clicked
                    for (let index in $scope.allUserNames){
                        if(index >= 1 ) { // All or Others
                            $scope.allUserNames[index].checked = false;
                        }
                    }
                } else {
                    for (let index in $scope.allUserNames){
                        if(index >= 1 ) { // All or Others
                            $scope.allUserNames[index].checked = true;
                        }
                    }
                }

            } else if(itemClicked === 'None'){
                if($scope.allUserNames[0].checked === true){ // None
                    $scope.allUserNames[0].checked = false;
                } else {
                    $scope.allUserNames[0].checked = true;
                }

                for (let index in $scope.allUserNames){
                    if(index >= 1 ) { // All or Others
                        $scope.allUserNames[index].checked = false;
                    }
                }
            } else {
                $scope.allUserNames[0].checked = false; // None
                $scope.allUserNames[1].checked = false; // All

                for (let index in $scope.allUserNames){
                    if($scope.allUserNames[index].id === itemClicked){
                        $scope.allUserNames[index].checked = !($scope.allUserNames[index].checked);
                    }
                }
            }
        }else {
            if(itemClicked === 'All'){
                $scope.allTestExpNames[0].checked = false; // None

                if($scope.allTestExpNames[1].checked === true){ // All was clicked
                    for (let index in $scope.allTestExpNames){
                        if(index >= 1 ) { // All or Others
                            $scope.allTestExpNames[index].checked = false;
                        }
                    }
                } else {
                    for (let index in $scope.allTestExpNames){
                        if(index >= 1 ) { // All or Others
                            $scope.allTestExpNames[index].checked = true;
                        }
                    }
                }

            } else if(itemClicked === 'None'){
                if($scope.allTestExpNames[0].checked === true){ // None
                    $scope.allTestExpNames[0].checked = false;
                } else {
                    $scope.allTestExpNames[0].checked = true;
                }

                for (let index in $scope.allTestExpNames){
                    if(index >= 1 ) { // All or Others
                        $scope.allTestExpNames[index].checked = false;
                    }
                }
            } else {
                $scope.allTestExpNames[0].checked = false; // None
                $scope.allTestExpNames[1].checked = false; // All

                for (let index in $scope.allTestExpNames){
                    if($scope.allTestExpNames[index].id === itemClicked){
                        $scope.allTestExpNames[index].checked = !($scope.allTestExpNames[index].checked);
                    }
                }
            }
        }

    };

    $scope.computeMeasuresByOption = function (callback, users, exps) {

        $http({
            method: 'POST',
            url: 'php/compute_precision_recall.php',
            data: $.param({
                usersToShowStats : users,
                groupsToShowStats : exps
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (data) {

            if (data.data.length !== 0) {

                let expNames = [];
                let precision = [];
                let recall = [];
                let cal = [];
                let res = [];

                let expMeasures = {};
                for(let index in exps){
                    expMeasures[exps[index]['id']] = {'expName': 'None', 'sumPrec': 0, 'sumRec': 0,
                        'sumCal': 0,'sumGamma': 0, 'sumUsers' : 0};
                }

                for(let index in data.data){
                    const exp_id = (data.data[index])['exp_id'];
                    const exp_name = (data.data[index])['exp_name'];
                    const prec = (data.data[index])['precision'];
                    const rec = (data.data[index])['recall'];
                    const cal = (data.data[index])['cal'];

                    if(expMeasures[exp_id]['expName'] === 'None') {
                        expMeasures[exp_id]['expName'] = exp_name;
                    }

                    expMeasures[exp_id]['sumPrec'] += prec;
                    expMeasures[exp_id]['sumRec'] += rec;
                    expMeasures[exp_id]['sumCal'] += cal;
                    expMeasures[exp_id]['sumUsers'] += 1;

                    if((data.data[index])['listOfConfs'] !== null){
                        const listOfConfs = (data.data[index])['listOfConfs'].split(",");
                        const listOfIsCorrect = (data.data[index])['listOfIsCorrect'].split(",");

                        let num = 0;
                        let den = 0;
                        for(let i = 0; i<listOfConfs.length; i++){
                            for(let j = 0; i<listOfConfs.length; i++){
                                if(i != j){
                                    const m_dir = listOfConfs[i] - listOfConfs[j];
                                    const n_dir = listOfIsCorrect[i] - listOfIsCorrect[j];
                                    const sign = m_dir * n_dir;
                                    if(sign > 0){
                                        num += 1;
                                        den += 1;
                                    } else if (sign < 0){
                                        num -= 1;
                                        den += 1;
                                    }
                                }
                            }
                        }

                        let gamma = 0;
                        if(den !== 0){
                            gamma = num / den;
                        }

                        expMeasures[exp_id]['sumGamma'] += gamma;
                    } else {
                    }

                }

                for(let index in exps){
                    const exp_id = exps[index]['id'];

                    if(expMeasures[exp_id]['expName'] !== 'None'){
                        expMeasures[exp_id]['avgPrec'] = (expMeasures[exp_id]['sumPrec'] * 100 ) / expMeasures[exp_id]['sumUsers'];
                        expMeasures[exp_id]['avgRec'] = (expMeasures[exp_id]['sumRec'] * 100 ) / expMeasures[exp_id]['sumUsers'];
                        expMeasures[exp_id]['avgCal'] = (expMeasures[exp_id]['sumCal']) / expMeasures[exp_id]['sumUsers'];
                        expMeasures[exp_id]['avgRes'] = (expMeasures[exp_id]['sumGamma'] * 100 ) / expMeasures[exp_id]['sumUsers'];

                        expNames.push(expMeasures[exp_id]['expName']);
                        precision.push(Math.round(expMeasures[exp_id]['avgPrec'] * 100) / 100);
                        recall.push(Math.round(expMeasures[exp_id]['avgRec'] * 100) / 100);
                        cal.push(Math.round(expMeasures[exp_id]['avgCal'] * 100) / 100);
                        res.push(Math.round(expMeasures[exp_id]['avgRes'] * 100) / 100);
                    }
                }
                callback(expNames, precision, recall, cal, res);

            } else {
                console.log('Get precision and recall data - failed');
                callback([]);
            }
        });
    };

    $scope.computeMeasures = function (callback) {
        document.getElementById("evaluationMeasuresGraphAggregate").innerHTML = "";

        $scope.computeMeasuresByOption(function(expNames, precision, recall, cal, res){

            let column_names = expNames;
            //console.log(expNames);
            let precision_by_name = precision;
            let recall_by_name = recall;
            let cal_by_name = cal;
            let res_by_name = res;

            if(expNames.length === 1){
                let all_users = [];
                let exps_to_compare = [];
                let single_exp_name = expNames[0];

                //console.log("$scope.rel_exp_ids_checked[0]", $scope.rel_exp_ids_checked[0]);
                $http({
                    method: 'POST',
                    url: 'php/check_comparison_for_evaluation_measures.php',
                    data: $.param({
                        usersToShowStats : $scope.usersToShowStats,
                        exp_id : $scope.rel_exp_ids_checked[0]
                    }),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).then(function (data) {
                    if (data.data !== '1') {
                        let count_other_u_same_exp = data.data;
                        // console.log("count_other_u_same_exp", count_other_u_same_exp);
                        if($scope.groupsToShowStats.length === 1){
                            if($scope.usersToShowStats.length === 1){
                                let user_name = '';
                                for (let index in $scope.allUserNames){
                                    if($scope.allUserNames[index].id === $scope.usersToShowStats[0]){
                                        user_name = $scope.allUserNames[index].fullName;
                                    }
                                }
                                column_names[0] = 'User Name:\n' + user_name + '\nTask Name:\n' + single_exp_name;
                            } else {
                                column_names[0] = 'Selected Users,\nTask Name:\n' + single_exp_name;
                            }
                        } else {
                            if($scope.usersToShowStats.length === 1){
                                let user_name = '';
                                for (let index in $scope.allUserNames){
                                    if($scope.allUserNames[index].id === $scope.usersToShowStats[0]){
                                        user_name = $scope.allUserNames[index].fullName;
                                    }
                                }
                                column_names[0] = 'User Name:\n' + user_name + '\nTask Name:\n' + single_exp_name;
                            } else {
                                column_names[0] = 'Selected Users,\nTask Name:\n' + single_exp_name;
                            }
                        }

                        for (let index in $scope.allUserNames){
                            if(index >= 2){
                                all_users.push($scope.allUserNames[index].id);
                            }
                        }

                        if(count_other_u_same_exp == 0) {
                            for (let index in $scope.allTestExpNames){
                                if(index >= 2){
                                    exps_to_compare.push({"id" : $scope.allTestExpNames[index].id,
                                        "max_num_pairs" : $scope.allTestExpNames[index].max_num_pairs});
                                }
                            }
                        } else {
                            for (let index in $scope.relExpForUsersToShowStats){
                                if($scope.rel_exp_ids_checked[0] == $scope.relExpForUsersToShowStats[index].id){
                                    exps_to_compare.push({"id" : $scope.relExpForUsersToShowStats[index].id,
                                        "max_num_pairs" : $scope.relExpForUsersToShowStats[index].max_num_pairs});
                                }

                            }
                        }

                        $scope.computeMeasuresByOption(function(all_expNames, all_precision, all_recall, all_cal, all_res){

                            let avg_precision = 0;
                            let avg_recall = 0;
                            let avg_cal = 0;
                            let avg_res = 0;
                            let num_of_exp = all_expNames.length;

                            for(let i = 0; i < all_expNames.length; i++){
                                avg_precision += all_precision[i]
                                avg_recall += all_recall[i]
                                avg_cal += all_cal[i]
                                avg_res += all_res[i]
                            }
                            avg_precision = avg_precision / num_of_exp;
                            avg_recall = avg_recall / num_of_exp;
                            avg_cal = avg_cal / num_of_exp;
                            avg_res = avg_res / num_of_exp;

                            if(count_other_u_same_exp == 0){
                                column_names.push('All Users,\nAll Tasks');
                            } else {
                                column_names.push('All Users,\n Task Name:\n' + single_exp_name);
                            }
                            precision_by_name.push(Math.round(avg_precision * 100) / 100);
                            recall_by_name.push(Math.round(avg_recall * 100) / 100);
                            cal_by_name.push(Math.round(avg_cal * 100) / 100);
                            res_by_name.push(Math.round(avg_res * 100) / 100);

                            document.getElementById("evaluationMeasuresGraphAggregate").innerHTML = "";
                            var ctx = document.getElementById("evaluationMeasuresGraphAggregate").getContext("2d");

                            if ($scope.evaluationMeasuresGraphAggregate){
                                $scope.evaluationMeasuresGraphAggregate.destroy();
                            }

                            Chart.defaults.global.defaultFontColor = 'black';
                            Chart.defaults.global.defaultFontFamily = "Calibri";
                            Chart.defaults.global.defaultFontSize = 14;

                            $scope.evaluationMeasuresGraphAggregate = new Chart(ctx, {
                                type: 'bar',
                                data: {
                                    labels: column_names,
                                    datasets: [
                                        {
                                            label: "Precision",
                                            backgroundColor: "blue",
                                            data: precision_by_name //[0.5 ,0.78]
                                        },
                                        {
                                            label: "Recall",
                                            backgroundColor: "green",
                                            data: recall_by_name //[0.5 ,0.6]
                                        },
                                        {
                                            label: "Calibration",
                                            backgroundColor: "orange",
                                            data: cal_by_name //[0.7 ,0.15]
                                        },
                                        {
                                            label: "Resolution",
                                            backgroundColor: "red",
                                            data: res_by_name //[0.6 ,0.55]
                                        }]
                                },
                                options: {
                                    tooltips: {
                                        callbacks: {
                                            label: function (tooltipItem, data) {
                                                var xLabel = data.datasets[tooltipItem.datasetIndex].label;
                                                var yLabel = tooltipItem.yLabel;
                                                return xLabel + ': ' + yLabel + '%';
                                            }
                                        }
                                    },
                                    barValueSpacing: 20,
                                    scales: {
                                        yAxes: [{
                                            ticks: {
                                                beginAtZero: true
                                            },
                                            scaleLabel: {
                                                display: true,
                                                labelString: '%'
                                            }
                                        }],
                                        xAxes: [{
                                            scaleLabel: {
                                                display: true,
                                                labelString: 'Group Names'
                                            }
                                        }],
                                    },
                                    legend: {
                                        display: true,
                                        position: 'bottom'
                                    },
                                    title: {
                                        display: true,
                                        text: 'Evaluation Measures',
                                        fontSize: 18
                                    }
                                },
                                plugins: [{
                                    beforeInit: function (chart) {
                                        chart.data.labels.forEach(function (e, i, a) {
                                            if (/\n/.test(e)) {
                                                a[i] = e.split(/\n/)
                                            }
                                        })
                                    }
                                }]

                            });

                            document.getElementById("evaluationMeasuresGraphAggregate").innerHTML = $scope.evaluationMeasuresGraphAggregate;

                            callback(true);

                        }, all_users, exps_to_compare);

                    } else {
                        callback(false);
                    }
                });
            } else{
                document.getElementById("evaluationMeasuresGraphAggregate").innerHTML = "";
                var ctx = document.getElementById("evaluationMeasuresGraphAggregate").getContext("2d");

                if ($scope.evaluationMeasuresGraphAggregate){
                    $scope.evaluationMeasuresGraphAggregate.destroy();
                }

                Chart.defaults.global.defaultFontColor = 'black';
                Chart.defaults.global.defaultFontFamily = "Calibri";
                Chart.defaults.global.defaultFontSize = 14;

                $scope.evaluationMeasuresGraphAggregate = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: column_names,
                        datasets: [
                            {
                                label: "Precision",
                                backgroundColor: "blue",
                                data: precision_by_name //[0.78, 0.4]
                            },
                            {
                                label: "Recall",
                                backgroundColor: "green",
                                data: recall_by_name //[0.6, 0.7]
                            },
                            {
                                label: "Calibration",
                                backgroundColor: "orange",
                                data: cal_by_name //[0.15, 0.35]
                            },
                            {
                                label: "Resolution",
                                backgroundColor: "red",
                                data: res_by_name //[0.55,0.6]
                            }]
                    },
                    options: {
                        tooltips: {
                            callbacks: {
                                label: function (tooltipItem, data) {
                                    var xLabel = data.datasets[tooltipItem.datasetIndex].label;
                                    var yLabel = tooltipItem.yLabel;
                                    return xLabel + ': ' + yLabel + '%';
                                }
                            }
                        },
                        barValueSpacing: 20,
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true
                                },
                                scaleLabel: {
                                    display: true,
                                    labelString: '%'
                                }
                            }],
                            xAxes: [{
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Group Names'
                                }
                            }],
                        },
                        legend: {
                            display: true,
                            position: 'bottom'
                        },
                        title: {
                            display: true,
                            text: 'Evaluation Measures',
                            fontSize: 18
                        }
                    },
                    plugins: [{
                        beforeInit: function (chart) {
                            chart.data.labels.forEach(function (e, i, a) {
                                if (/\n/.test(e)) {
                                    a[i] = e.split(/\n/)
                                }
                            })
                        }
                    }]

                });

                document.getElementById("evaluationMeasuresGraphAggregate").innerHTML = $scope.evaluationMeasuresGraphAggregate;

                callback(true);
            }
        }, $scope.usersToShowStats, $scope.groupsToShowStats);
    };

    $scope.findClosestMatcher = function (callback) {
        $http({
            method: 'POST',
            url: 'php/compute_sim_to_matchers.php',
            data: $.param({
                curr_user: $scope.curr_user['id'],
                curr_exp_id: $scope.curr_exp_id
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (data) {
            //console.log(data.data);
            if (data.data !== "1" && data.data.length > 0) {
                document.getElementById("closestMatch").innerText = "";
                let dataVal = [];
                for (let item in data.data){
                    const algName = (data.data)[item]['algName'];
                    const algSim = (data.data)[item]['algSim'] * 100;
                    const isMax = (data.data)[item]['isMax'];

                    if(isMax === 1){
                        dataVal.push({ name: '<b>'+algName+'</b>', y: algSim, sliced: true });
                    } else {
                        dataVal.push({ name: algName, y: algSim, sliced: false });
                    }
                }

                Highcharts.chart('closestMatch', {
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false,
                        type: 'pie',
                        style: {
                            fontFamily: 'Calibri',
                            fontSize: 14
                        },
                        margin: [10, 0, 0, 0],
                        spacingTop: 10,
                        spacingBottom: 0,
                        spacingLeft: 0,
                        spacingRight: 0
                    },
                    title: {
                        text: 'Similarity To Algorithms',
                        style: {
                            fontSize: 18,
                            fontWeight: 'bold'
                        }
                    },
                    tooltip: {
                        pointFormat: '{series.name}: <b>{point.y:.1f}%</b>'
                    },
                    legend: {
                        enabled: false,
                        floating: false,
                        margin: 0,
                        padding: 0,
                        borderWidth: 0,
                        align: "center",
                        verticalAlign: 'top'
                    },
                    plotOptions: {
                        pie: {
                            size:'90%',
                            allowPointSelect: false,
                            colors: ["#0A00D9", "#FF005F", "#1BAD00"],
                            dataLabels: {
                                padding: 0,
                                overflow: "allow",
                                crop: false,
                                enabled: true,
                                format: '{point.name}<br>{point.y:.1f} %',
                                align: "center",
                                distance: -55,
                                //x: 0,
                                //y: -20,
                                style: {
                                    fontSize: '13px',
                                    textShadow: false,
                                    color: 'white',
                                    borderWidth: 0,
                                    align: 'center',
                                    textOutline: "0px",
                                    fontWeight: "None",
                                }
                            },
                            showInLegend: true,
                            slicedOffset: 15
                        }
                    },
                    series: [{
                        name: 'Similarity Measure',
                        data: dataVal
                    }]
                });
                callback(true);
            } else {
                //console.log('Data for similarity to matcher - empty');
                document.getElementById("closestMatch").innerHTML = '<h2 style="margin-top: 30%; display: inline-block;">' +
                                     "No data is available to show for Similarity To Algorithms.</h2>";
                callback(false);

            }
        });

    };

    $scope.findPrecisionForUser = function (callback) {
        $http({
            method: 'POST',
            url: 'php/compute_precision_for_user.php',
            data: $.param({
                curr_user: $scope.curr_user['id'],
                curr_exp_id: $scope.curr_exp_id
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (data) {

            if (data.data !== 'err' && data.data > 0) {
                const precision = data.data;
                //console.log(precision);
                //console.log(typeof precision);
                if (parseFloat(precision) > 0.5){
                    document.getElementById("user_finish_msg").innerText = "Thank You! Good job, you have been very precise.";
                } else {
                    document.getElementById("user_finish_msg").innerText = "Thank You!";
                }
                callback(true);
            } else {
                //console.log('Data for precision of user - empty');
                callback(false);
            }
        });
    };

    /*$scope.capture_screen = function()
    {
        const body_id = document.body.id;
        html2canvas($('#all_body'), {
            onrendered: function(canvas) {
                var img = canvas.toDataURL()
                document.getElementById("capture_screen").src = img;
                $scope.userScreenshotImg = img;
            }
        });
    };*/

});	 //app.controller