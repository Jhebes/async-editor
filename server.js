// Josh Hebert

// App is hosted at https://jh-cs4241-assn4.herokuapp.com/


var express = require( "express" );
var q = require( "q" );
var fs = require( "fs" );
var PubSub = require( "pubsub-js" );
var io = require( "./node/io.js" );

var app = express();


// Handle requests for CSS
app.use( '/css', express.static( 'css' ) );

// Handle requests for my clientside JS
app.use( '/js', express.static( 'js' ) );

// Handle requests for images
app.use( '/img', express.static( 'img' ) );

// Only allow access to js files of Bower components
app.get( '/bower_components/*/*.js', function( req, res ){
    res.sendFile( __dirname + req.url );
                               
});

// This is the text file the clients all edit
// I wanted to allow them to create new ones and select the
// one they are editing, but didn't have the time to draw up how to 
// safely sandbox it.
var dataFileDir = "./data/";
var textFile = dataFileDir + "data.txt";

// Handle requests to edit the doc 
// ( Returns JSON object to the client )
app.post( '/edit', function( req, res ){
    // Wait on the JSON data from this request
    req.on( 'data', function( body ){
        body = JSON.parse( body );
        // Wait for file IO to be done before we send stuff back
        var p_file = q.defer( );
        
        if( body != null ){
            //io.edit( textFile, body.pos, body.keycode ).then( function( ){
            //    p_file.resolve( );
            //});
            io.patch( textFile, body.patch ).then( function( ){
                p_file.resolve( );
            });
            
        
        
            p_file.promise.then( function( ){
                // Emit a signal indicating the file has been modified,
                // which immediately resolves all longpoll requests
                PubSub.publish( textFile );
                io.readFile( textFile ).then( function( text ){
                    var data = new Object( );
                    data.content = text;
                    res.send( JSON.stringify( data ) );
                });
            });
        } 
    });
});

// Just returns the content of the text file
app.post( '/query', function( req, res ){
    io.readFile( textFile ).then( function( text ){
        var data = new Object( );
        data.content = text;
        res.send( JSON.stringify( data ) );
    });
});

// Watches the file and responds to long poll requests
app.post( '/poll', function( req, res ){
    PubSub.subscribe( textFile, function( ){
        io.readFile( textFile ).then( function( text ){
            var data = new Object( );
            data.content = text;
            PubSub.unsubscribe( textFile );
            res.send( JSON.stringify( data ) );
        });
    });
});


// Match to anything else
// i.e. doesn't actually matter what page they go to
app.get( /\/*/, function( req, res ) { 
    if( req.query.file != undefined ){
        // Sanitize the input. 
        // Get rid of any directory traversal
        var f = req.query.file.replace( /\.\.\//g, "" );
        // Get rid of ~ char
        f = f.replace( "~", "" );
        
        textFile = dataFileDir + f;
    }else{
        textFile = dataFileDir + "/data.txt"
    }
    // Promise that we'll check for a search keyword and then
    // act on it if it exists
    var p_search = q.defer( );
    
    var promise = q.all( [
        // Load all our JS
        io.readFile( "./html/loader.html" ),
        io.readFile( "./html/content.html" )
    ] );
    promise.spread( function( loader, content ) {
        
        p_search.resolve( loader + content );
    });

    // Create the complete page and send it to the client
    p_search.promise.then( function( body ){
        res.send( body );
    });
});


// Launch the server
var port = process.env.PORT || 5000;
app.listen( port, function( ) {
    console.log( "Listening on " + port );
});
