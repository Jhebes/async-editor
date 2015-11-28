// Resize an element to be the exact height of the window, minus
// the titlebar
var autoresize = function( item ){
    var docheight = window.innerHeight;
    var elem = document.getElementById( item );
    // Subtract the height of our menubar;
    // It would be better if I could do this dynamically
    docheight -= 50;

    // This is the height our doc should be
    elem.style.height = docheight;
};

// Run everything once the page is loaded
document.addEventListener('DOMContentLoaded', function() {
    autoresize( "doc" );
    autoresize( "sidebar" );


    // Set the file we're editing
    var arg = location.href.split( "?" )[ 1 ].split( "=" );
    if( arg[ 0 ] == "file" ){
        document.getElementById( "title" ).innerHTML = arg[ 1 ];
    } 


}, false);

// Do the same thing when the page is resized
window.addEventListener('resize', function(event){
    autoresize( "doc" );
    autoresize( "sidebar" );

});

