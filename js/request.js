// Josh Hebert

// The last snapshot received from the server
// Used for creating patches
var snapshot = "";

var sendPOST = function( data, url, cb ){
    var req = new XMLHttpRequest( );
    req.open( 'POST', url, true );
    req.setRequestHeader('Content-Type', 'application/json');
    
    req.onreadystatechange = function( ) {
        if ( req.readyState == 4 ) {
            if( req.status == 503 ){
                cb( null, 503 );
            }else{    
                cb( JSON.parse( req.responseText ), null ); 
            }
        }
    }
    req.send( JSON.stringify( data ) );
};

// Naturally, it's absurd to run the diff algo on the entire doc every time.
// Therefore, we only run it on the general area of editing and include this info
// in the AJAX message.
// We also don't want to run it only when a single char is changed. Therefore, we want
// to only run it when the text edited is not clustered in a single area.
// So, the general guidelines for this will be;
//  Clientside will:
//      1. Maintain counter of characters edited.
//      2. As long as the edits are contiguous, hold off on diffing
//      3. Once an edit is made outside of the contiguous edit region (CER), diff
//         the changed region and submit. The edit outside of the previous CER becomes
//         the start of a new CER
//      4. If no edit is made for some N seconds, diff the CER and treat future edits
//         as a new CER
//      5. If more than some M chars are changed, diff the CER and treat new edits as
//         a new CER
var n = 1000;
var m = 3;
//var CER_start = 0;
//var CER_last = 0;

// Still need to implement 2 and 3
var buffered_edits = 0;
var modify = function( e ){
    var elem = document.getElementById( "free_edit" );
    var commit = function( ){
            q.action = "MODIFY";
            q.patch = JsDiff.diffChars( snapshot, elem.value );
            sendPOST( q, "/edit", function( resp ){ } );
            buffered_edits = 0;
    };
    ++buffered_edits;
    // What to do on the creation of a CER
    if( buffered_edits == 1 ){
        //CER_start = elem.selectionStart;
        //CER_last = elem.selectionEnd;
        setTimeout( function( ){
            commit( );
        }, n );
    }

    if( buffered_edits == m ){
        commit( );
        clearTimeout( );
    }
}


// When page loads, get the current state of the text file
var q = new Object( );
q.action = "NONE";
sendPOST( q, "/query", function( resp ){
    edit_field = document.getElementById( "free_edit" );
    edit_field.value = resp.content;
    snapshot = resp.content;
});

// Long poll for changes to the file
var longPoll = function( ){
    sendPOST( q, "/poll", function( resp, err ){
        if( err ){
            // Try again I guess?
            longPoll( );    
        }else{
            edit_field = document.getElementById( "free_edit" );
            var cursor_pos_start = edit_field.selectionStart;
            var cursor_pos_end = edit_field.selectionEnd;
            edit_field.value = resp.content;
        
        
            snapshot = resp.content;
            edit_field.selectionStart = cursor_pos_start;
            edit_field.selectionEnd = cursor_pos_end;
            longPoll( );
        }
    });
}

longPoll( );

