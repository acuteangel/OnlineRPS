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
   
    database.on("value", function(snapshot){        
        $("#loading").hide();
        $("#wrapper").show();
        console.log(snapshot.val())
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

console.log(sessionStorage.playerSelected)

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
        database.push({
            color: sessionStorage.playerSelected,
            text: $("#text-message").val()
        })
    })

    database.on("child_added", function(snapshot){
        displayChatMessage(snapshot.val().color, snapshot.val().text);
        snapshot.val().color.remove();
        snapshot.val().text.remove();
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