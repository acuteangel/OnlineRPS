$(document).ready(function() {
    var config = {
        apiKey: "AIzaSyC1FyjmDuEKBbGmkbxMMzpKj-LpSlZiXFk",
        authDomain: "august2018-cohort.firebaseapp.com",
        databaseURL: "https://august2018-cohort.firebaseio.com",
        projectId: "august2018-cohort",
        storageBucket: "august2018-cohort.appspot.com",
        messagingSenderId: "1033666292141"
    };
  
    firebase.initializeApp(config);
    
    var database = firebase.database();
    var timer;
    var rpsArray = ["rock", "paper", "scissors"];
    var rpsPink;
    var rpsBrown;
    var playerSelected = "spectator";
    var wins = 0;
    var ties = 0;
    var losses = 0;
    var roundEnder = 0;
    var playAgain = "neither";    
    var pCount = 0;

    //resets all others back to the player selection screen if a player leaves
    $(window).on('beforeunload unload', function(){                
        if (playerSelected != "spectator"){
            database.ref().set({
                brown: {selected: false},
                pink: {selected: false},
                gameInProgress: true,
                playerLeave: playerSelected,
                roundEnd: false
            })
        }
    })
   
    database.ref().on("value", function(snapshot){
        $("#loading").hide();
        $("#wrapper").show();
        console.log(snapshot.val())
        if (snapshot.val().playerLeave !== "no") {
            deselectPlayer(snapshot.val().playerLeave);
            playerSelected = "spectator";
            $(".player-select").show();
            $(".gameplay").hide();
            if (snapshot.val().gameInProgress){
                alert(snapshot.val().playerLeave+" has left");
            };
            database.ref().update({playerLeave: "no", gameInProgress: false})
            
        }
        if (!snapshot.val().gameInProgress) {
            if (!snapshot.val().brown.selected){
                deselectPlayer("brown")
            };
            if (!snapshot.val().pink.selected){
                deselectPlayer("pink")
            };
            if (snapshot.val().pink.selected) {
                selectPlayer("pink")                
            };
            if (snapshot.val().brown.selected) {
                selectPlayer("brown");
                if (snapshot.val().pink.selected){
                    database.ref().update({
                        gameInProgress: true
                    });
                    $("#info-display").text("Starting round...");
                    roundStart();
                };
            };
        } else if (snapshot.val().gameInProgress && snapshot.val().playerLeave == "no"){
            $(".player-select").hide();
            $(".gameplay").show();
        };
        if (snapshot.val().roundEnd && roundEnder == 0) {
            rpsPink = snapshot.val().pink.rps;
            rpsBrown = snapshot.val().brown.rps;
            roundEnd(rpsPink, rpsBrown);
        } else if (!snapshot.val().roundEnd && roundEnder == 1) {
            roundEnder++;
            $("#score").text("Pink: "+snapshot.val().pink.score+" Brown: "+snapshot.val().brown.score);
            $("#score").fadeIn();
        };
        if (snapshot.val().playAgain != "neither") {
            if (snapshot.val().playAgain == "pink" || snapshot.val().playAgain == "brown") {                
                playAgain = snapshot.val().playAgain;
                console.log(playAgain)
            } else if (snapshot.val().playAgain == "both"){
                playAgain = "neither";
                database.ref().update({
                    playAgain: playAgain,
                });
                $("#info-display").text("Starting round...");                
                roundStart();
            };
        };
    });

    //player select
    function selectPlayer(player){
        $("#"+player+"-select").attr("id", player+"-selected");
        $("#"+player+"-selected").attr("data-selected", "yes");
    }

    function deselectPlayer(player){        
        $("#"+player+"-selected").attr("data-selected", "no");
        $("#"+player+"-selected").attr("id", player+"-select");        
    }

    $(".player-select").on("click", function(){
        var color = $(this).attr("data-color");
        $("#"+color+"-gao").get(0).volume = 0.2;
        $("#"+color+"-gao").get(0).play();
        if ($("#music").get(0).volume != 0.2){
            $("#music").get(0).volume = 0.2
            $("#music").get(0).play();
            $("#sound").attr("data-state","mute")
        }
        if (color != "no"){            
            selectPlayer(color);
            if (playerSelected != "spectator"){
                deselectPlayer(playerSelected);                
                database.ref(playerSelected).update({
                    selected: false
                });                
            };
            playerSelected = color;
            database.ref(color).update({
                selected: true
            });
        };
    });

    //allow for choice of rock paper or scissors. rpsPink/rpsBrown are randomized initially to prevent no selection
    $(".kawaii-img").on("mousedown", function() {
        $("#squeak-click").get(0).volume = 0.1;
        $("#squeak-click").get(0).play();
    });
    
    $(".kawaii-img").on("mouseup", function() {
        setTimeout(function(){
            $("#squeak-release").get(0).volume = 0.1;
            $("#squeak-release").get(0).play();
        }, 150);
        var selection = $(this).attr("data-type")
        if (playerSelected != "spectator" && timer > 0) {
            if (playerSelected == "pink"){
                rpsPink = $(this).attr("data-type");
            } else {
                rpsBrown = $(this).attr("data-type");                
            };
            database.ref(playerSelected).update({
                rps: $(this).attr("data-type")
            });
            $("#same-choice").attr("src", "assets/images/"+selection+"-selected.jpg");
        };
    });    

    //function that starts a round and the timer
    function roundStart() {
        $("#start").get(0).volume = 0.2
        $("#start").get(0).play();
        $(".results").hide();
        $("#same-choice").attr("src","");
        $("#same-choice").show();
        roundEnder = 0;
        timer = 5;
        rpsPink = rpsArray[Math.floor(Math.random()*3)];
        rpsBrown = rpsPink;
        database.ref(playerSelected).update({
            rps: rpsPink
        });
        if (playerSelected != "spectator") {
            $("#info-display").text("Make your selection!");
        } else {
            $("#info-display").text("Players are selecting!");
        };
        $("#timer-display").text("Time: "+timer);
        var timeInterval = setInterval(function(){
            timer--;
            $("#timer-display").text("Time: "+timer);
            if (timer<1){
                clearInterval(timeInterval);                
                switch (playerSelected) {
                    case "pink": 
                        database.ref("pink").update({
                            rps: rpsPink
                        });
                        $("#same-choice").attr("src", "assets/images/"+rpsPink+"-selected.jpg");
                        break;
                    case "brown":
                        database.ref("brown").update({
                            rps: rpsBrown
                        });
                        $("#same-choice").attr("src", "assets/images/"+rpsBrown+"-selected.jpg");
                        break;
                };
                database.ref().update({
                    roundEnd: true
                });
            };
        }, 1000);
    };

    //function to locally determine the result
    function resolveWinner(pinkinput, browninput) {
        var winner;
        switch (pinkinput) {
            case "rock":
                switch (browninput) {
                    case "rock":
                        winner= "tie";
                        break;
                    case "paper":
                        winner= "brown";
                        break;
                    case "scissors":
                        winner= "pink";
                        break;
                };
            break;
            case "paper":
                switch (browninput) {
                    case "rock":
                        winner= "pink";
                        break;
                    case "paper":
                        winner= "tie";
                        break;
                    case "scissors":
                        winner= "brown";
                        break;
                };
            break;
            case "scissors":
                switch (browninput) {
                    case "rock":
                        winner= "brown";
                        break;
                    case "paper":
                        winner= "pink";
                        break;
                    case "scissors":
                        winner= "tie";
                        break;
                };
            break;
        };
        return winner;
    };

    //function that triggers when time = 0 and a round ends
    function roundEnd(pinkinput, browninput) {
        var winner = resolveWinner(pinkinput, browninput);
        updateScore(winner);
        switch (playerSelected) {            
            case "pink":
                $("#different-choice").attr("src", "assets/images/"+browninput+"-selected.jpg");                
                break;
            case "brown":
                $("#different-choice").attr("src", "assets/images/"+pinkinput+"-selected.jpg");                    
                break;
            case "spectator":
            $("#same-choice").attr("src", "assets/images/"+pinkinput+"-selected.jpg");
            $("#different-choice").attr("src", "assets/images/"+browninput+"-selected.jpg");
        };
        $("#timer-display").fadeOut();
        $("#vs").fadeIn().css({display: "inline"});
        $("#different-choice").fadeIn().css({display: "inline"});
        setTimeout(function(){    
            if (winner=="tie"){
                $("#info-display").text("tie!");
            } else {
                $("#info-display").text(winner + " wins!");
            }    ;        
        }, 1500);
        setTimeout(function(){
            if (winner != "brown"){
                $("#pink-result").attr("src", $("#pink-result").attr("data-win"));
                if (winner == "pink") {
                    $("#brown-result").attr("src", $("#brown-result").attr("data-defeated"));  
                } else {
                    $("#brown-result").attr("src", $("#brown-result").attr("data-win"));
                };
            } else {
                $("#brown-result").attr("src", $("#brown-result").attr("data-win"));
                $("#pink-result").attr("src", $("#pink-result").attr("data-defeated"));
            };
            $(".versus").hide();
            $(".results").show();            
            if (playerSelected != "spectator") {
                $("#timer-display").text("Click here to play again!");
            } else {
                $("#timer-display").text("Waiting for players...");
            };
            $("#timer-display").fadeIn("slow");
            database.ref().update({
                roundEnd: false
            });
        }, 3000);    
    };

    //function to update the local score, then update the global score with matching numbers
    function updateScore(winner){
        if (playerSelected == winner){
            wins++;
        } else if (playerSelected != "spectator"){
            if (winner == "tie"){
                ties++;
            } else {
                losses++;
            };
        };
        var newScore = wins + "-" + ties + "-" + losses;
        roundEnder++;
        database.ref(playerSelected).update({
            score: newScore
        });        
    };

    //enables the new game button
    $("#timer-display").on("click", function(){
        if (roundEnder == 2 && playerSelected != "spectator") {
            if (playAgain == "neither"){
                playAgain = playerSelected;
                database.ref().update({
                    playAgain: playAgain
                });
                database.ref().push({
                    color: playAgain,
                    text: playAgain + " wants to play again!"                    
                });
            } else if (playAgain != playerSelected && playAgain == "pink" || playAgain != playerSelected && playAgain == "brown") {
                database.ref().update({
                    playAgain: "both"
                });
            };
        };
    });

    //enables the chat button
    $("#chat-button").on("click", function(event){
        event.preventDefault();
        database.ref().push({
            color: playerSelected,
            text: $("#text-message").val()
        });
        $("#text-message").val("");
    })

    //event listener to call the display function when it's pushed to the firebase data
    database.ref().on("child_added", function(snapshot){
        if (snapshot.val().text != "") {
            displayChatMessage(snapshot.val().color, snapshot.val().text);        
        };
    });

    //function to append the newest chat message
    function displayChatMessage(color, text){
        console.log(color)
        if (color != undefined){
            pCount++;
            var p = $("<p>");
            p.addClass(color+"-message");
            if (color==playerSelected){
                p.addClass("same");
            } else {
                p.addClass("different");
            };
            p.text(text);
            $("#chat-history").append(p);
            $("#chat-history").scrollTop(500*pCount);            
            $("#notification").get(0).play();
        }
    };

    //play/pause music
    $("#sound").on("click", function(){
        if ($("#sound").attr("data-state")=="mute"){
            $("#music").get(0).pause();
            $("#sound").attr("data-state","volume")
        } else {            
            $("#music").get(0).volume = 0.2;
            $("#music").get(0).play();
            $("#sound").attr("data-state","mute")
        }
    })

    
});