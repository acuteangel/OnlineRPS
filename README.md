# OnlineRPS

https://acuteangel.github.io/OnlineRPS/

psuedocode: 

Scene 1: setup page
    player select buttons, p1 and p2
    if a player presses a button, assign them that role and set a boolean to disable the button
    if both players are active, move to game scene and return booleans

Scene 2: gameplay
    set timer and wait for input
    compare input
    change score

extra:
    stickers or chat function?

things to figure out:
    how to tell if user leaves the page?
    make sure both players see the correct thing
    prevent anyone who joins after the game starts from interfering, but allow spectating