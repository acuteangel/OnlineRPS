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
    
    var database = firebase.database().ref();
    sessionStorage.playerSelected = "spectator";

    $(window).on('beforeunload unload', function(){
        alert(sessionStorage.playerSelected)
        if (sessionStorage.playerSelected == "pink" || sessionStorage.playerSelected == "brown"){
            database.update({
                pink: {selected: false},
                brown: {selected: false},
                gameInProgress: false,
                playerLeave: true
            })
        }
    })
   
    database.on("value", function(snapshot){        
        $("#loading").hide();
        $("#wrapper").show();
        console.log(snapshot.val())
        if (snapshot.val().playerLeave == true) {
            alert("Your opponent left");
            database.update({playerLeave: false})
        }
        if (snapshot.val().gameInProgress == false) {            
            if (snapshot.val().pink.selected == true) {
                selectPlayer("pink")
            }
            if (snapshot.val().brown.selected == true) {
                selectPlayer("brown")
                if (snapshot.val().pink.selected == true){
                    database.update({
                        gameInProgress: true
                    })
                }
            }
        } else {
            $(".player-select").hide();
            $(".gameplay").show();
        }
    })

    //player select
    function selectPlayer(player){
        $("#"+player+"-select").attr("id", player+"-selected");
        $("#"+player+"-selected").attr("data-selected", "yes");
    }

    $(".player-select").on("click", function(){
    if ($(this).attr("data-selected") == "no"){
        var color = $(this).attr("data-color");
        selectPlayer(color);
        sessionStorage.playerSelected = color;
        if (color == "pink"){
            database.update({
            pink: {selected: true}
            })
        } else {
            database.update({
            brown: {selected: true}
            })
        }
    }
    })

    //chat function
    $("#chat-button").on("click", function(event){
        event.preventDefault();
        database.update({
            color: sessionStorage.playerSelected,
            text: $("#text-message").val()
        })
        database.update({
            color: "",
            text: ""
        })
    })

    database.on("value", function(snapshot){
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