# Async Javascript Editor
Simple asynchronous editor implemented in NodeJS

## What is this?

This is a textarea that is linked to a file on the remote server. Editing it here will result in mirrored changes on the server's copy of the file. This is all done through AJAX requests. Furthermore, all clients viewing this page will see the content of their text field automatically update when any of them change it. Try it! Open a couple of browser windows and change the text in one of them.

## How does it work?

Each time some modification is made to this field, the browser logs what key was pressed and where the cursor was when that took place. This information is then sent to the server, where the appropriate modifications are then made to the file. 
In order to keep all clients viewing the text file in sync, each puts in a long poll request to the server, asking for updates. The server watches the file, and whenever modifications are made to it, it resolves all of these requests with the updated contents of the text file. In this way, the clients aren't hammering the server over and over asking for updates. Data is only sent when there are changes. This helps reduce load on the server and saves on bandwidth.
