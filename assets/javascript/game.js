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
    sessionStorage.playerSelected = "spectator";
    sessionStorage.wins = 0;
    sessionStorage.ties = 0;
    sessionStorage.losses = 0;
    var roundEnder = 0;

    $(window).on('beforeunload unload', function(){                
        if (sessionStorage.playerSelected == "pink" || sessionStorage.playerSelected == "brown"){
            database.ref().set({
                pinkSelected: false,
                brownSelected: false,
                gameInProgress: false,
                playerLeave: sessionStorage.playerSelected,
                rpsPink: "none",
                rpsBrown: "none",
                roundEnd: false
            })
        }
    })
   
    database.ref().on("value", function(snapshot){
        $("#loading").hide();
        $("#wrapper").show();
        console.log(snapshot.val())
        if (snapshot.val().playerLeave !== "no") {
            alert(snapshot.val().playerLeave+" has left");
            database.ref().update({playerLeave: "no", gameInProgress: false})
            deselectPlayer(snapshot.val().playerLeave);
            sessionStorage.playerSelected = "spectator";
        }
        if (snapshot.val().gameInProgress == false) {            
            $(".player-select").show();
            $(".gameplay").hide();
            if (snapshot.val().brownSelected == false){
                deselectPlayer("brown")
            }
            if (snapshot.val().pinkSelected == false){
                deselectPlayer("pink")
            }
            if (snapshot.val().pinkSelected == true) {
                selectPlayer("pink")                
            }
            if (snapshot.val().brownSelected == true) {
                selectPlayer("brown")
                if (snapshot.val().pinkSelected == true){
                    database.ref().update({
                        gameInProgress: true
                    })
                    roundStart();
                }
            }
        } else if (snapshot.val().gameInProgress == true){
            $(".player-select").hide();
            $(".gameplay").show();
        }
        if (snapshot.val().roundEnd == true && roundEnder == 0) {
            roundEnder++;
            rpsPink = snapshot.val().rpsPink
            rpsBrown = snapshot.val().rpsBrown
            console.log("meow")
            roundEnd(rpsPink, rpsBrown);
        } else if (snapshot.val().roundEnd == false && roundEnder == 1) {
            roundEnder++;
            $("#score").text("Pink: "+snapshot.val().pinkScore+" Brown: "+snapshot.val().brownScore)
            $("#score").fadeIn();
        }
    })    

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
    if ($(this).attr("data-selected") == "no"){        
        var color = $(this).attr("data-color");
        selectPlayer(color);
        if (sessionStorage.playerSelected != "spectator"){
            deselectPlayer(sessionStorage.playerSelected)
            if (sessionStorage.playerSelected == "pink"){
                database.ref().update({
                pinkSelected: false
                })
            } else {
                database.ref().update({
                    brownSelected: false
                })
            }
        }        
        sessionStorage.playerSelected = color;
        if (color == "pink"){
            database.ref().update({
            pinkSelected: true
            })
        } else {
            database.ref().update({
                brownSelected: true
            })
        }
    }
    console.log(sessionStorage.playerSelected)
    })

    //game functionality
    $(".kawaii-img").on("click", function() {
        var selection = $(this).attr("data-type")
        if (sessionStorage.playerSelected != "spectator" && timer > 0) {
            if (sessionStorage.playerSelected == "pink"){
                rpsPink = $(this).attr("data-type");
                database.ref().update({
                    rpsPink: rpsPink
                })
            } else {
                rpsBrown = $(this).attr("data-type");
                database.ref().update({
                    rpsBrown: rpsBrown
                })
            }
            $("#same-choice").attr("src", "assets/images/"+selection+"-selected.jpg");
        }
    });

    function roundStart() {
        roundEnder = 0
        timer = 5
        rpsPink = rpsArray[Math.floor(Math.random()*3)];
        rpsBrown = rpsArray[Math.floor(Math.random()*3)];
        if (sessionStorage.playerSelected != "spectator") {
            $("#info-display").text("Make your selection!")
        } else {
            $("#info-display").text("Players are selecting!")
        }
        $("#timer-display").text("Time: "+timer)
        var timeInterval = setInterval(function(){
            timer--;
            $("#timer-display").text("Time: "+timer);
            if (timer<1){
                clearInterval(timeInterval);                
                switch (sessionStorage.playerSelected) {
                    case "pink": 
                        database.ref().update({
                            rpsPink: rpsPink
                        })
                        break;
                    case "brown":
                        database.ref().update({
                            rpsBrown: rpsBrown
                        })
                        break;
                }
                database.ref().update({
                    roundEnd: true
                })
            }            
        }, 1000)
    }

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
                        winner= "pink"
                        break;
                }
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
                        winner= "brown"
                        break;
                }
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
                        winner= "tie"
                        break;
                }
            break;
        }
        return winner;
    }

    function roundEnd(pinkinput, browninput) {
        var winner = resolveWinner(pinkinput, browninput);
        updateScore(winner);
        switch (sessionStorage.playerSelected) {            
            case "pink":
                $("#different-choice").attr("src", "assets/images/"+browninput+"-selected.jpg");                
                break;
            case "brown":
                $("#different-choice").attr("src", "assets/images/"+pinkinput+"-selected.jpg");                    
                break;
            case "spectator":
            $("#same-choice").attr("src", "assets/images/"+pinkinput+"-selected.jpg");
            $("#different-choice").attr("src", "assets/images/"+browninput+"-selected.jpg");
        }
        $("#vs").fadeIn().css({display: "inline"})
        $("#different-choice").fadeIn().css({display: "inline"})
        setTimeout(function(){    
            if (winner=="tie"){
                $("#info-display").text("tie!")
            } else {
                $("#info-display").text(winner + " wins!")
            }
            $("#timer-display").fadeOut()
        }, 1500)
        setTimeout(function(){
            if (winner != "brown"){
                $("#pink-result").attr("src", $("#pink-result").attr("data-win"))
                if (winner = "pink") {
                    $("#brown-result").attr("src", $("#brown-result").attr("data-defeated"))    
                } else {
                    $("#brown-result").attr("src", $("#brown-result").attr("data-win"))
                }
            } else {
                $("#brown-result").attr("src", $("#brown-result").attr("data-win"))
                $("#pink-result").attr("src", $("#pink-result").attr("data-defeated"))
            }
            $(".versus").hide();
            $(".results").show();
            $("#timer-display").text("Click to play again!")
            database.ref().update({
                roundEnd: false
            })
        }, 3000)                
    }

    function updateScore(winner){
        if (sessionStorage.playerSelected == winner){
            sessionStorage.wins++;
        } else if (sessionStorage.playerSelected != "spectator"){
            if (winner == "tie"){
                sessionStorage.ties++
            } else {
                sessionStorage.losses++;
            }
        }
        var newScore = sessionStorage.wins + "-" + sessionStorage.ties + "-" + sessionStorage.losses;
        if (sessionStorage.playerSelected == "pink") {
            database.ref().update({
                pinkScore: newScore
            })
        } else if (sessionStorage.playerSelected == "brown") {
            database.ref().update({
                brownScore: newScore
            })
        }
    }

    //chat function
    $("#chat-button").on("click", function(event){
        event.preventDefault();
        database.ref().push({
            color: sessionStorage.playerSelected,
            text: $("#text-message").val()
        })
        $("#text-message").val("");
    })

    database.ref().on("child_added", function(snapshot){
        if (snapshot.val().text != "") {
            displayChatMessage(snapshot.val().color, snapshot.val().text);        
        }
    });

    function displayChatMessage(color, text){
        var p = $("<p>")
        p.addClass(color+"-message");
        if (color==sessionStorage.playerSelected){
            p.addClass("same")
        } else {
            p.addClass("different")
        }
        p.text(text)
        $("#chat-history").append(p);
    };
});