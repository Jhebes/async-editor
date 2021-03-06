// Josh Hebert

var q = require( "q" );
var fs = require( "fs" );
var diff = require( "diff" );
/*
 * Provides a interface to the readFile call that is wrapped
 * in a promisable function
 */
module.exports = {
    writeFile : function( file, content ){
        var p_done = q.defer( );
        fs.appendFile( file, content, 'utf8', function( err, data ) {
            if( err ){
                throw err;
            }
            p_done.resolve( );
        });
        return p_done.promise;
    },
    readFile : function( file ){
        var p_data = q.defer( );
        fs.readFile(file, 'utf8', function ( err, data ) {
            if( err ) {
                if( err.errno == -2 ){
                    // if it doesn't exist, create it
                    // This can't *possibly* be abused
                    fs.writeFile( file, "", "utf8" );
                }else{
                    return console.log( err );
                }
            }
            p_data.resolve( data );
        });
        return p_data.promise;
    },
    replaceInFile : function( file, pattern, content ){
        var p_done = q.defer( );
        this.readFile( file ).then( function( data ){
            data = data.replace( pattern, content );
            fs.writeFile( file, data, 'utf8', function( err, data ){
                if( err ){
                    return console.log( err );
                }
                p_done.resolve( );
            });
        });
        return p_done.promise;
    },

    //  Based on the assumptions made in request.js, we will assume:
    //      1. There is only one CER per patch
    patch : function( file, patch ){
        // Naively patch for now (i.e. assume nobody is editing at the same time; basically,
        // no merge conflicts
        var loc = 0;
        var p_done = q.defer( );
        this.readFile( file ).then( function( data ){
            
            // This implementation is bad, and breaks with rapid edits to the doc
            for( var i = 0; i < patch.length; ++i ){
                var change = patch[ i ];

                if( change.added ){
                    data = data.substr( 0, loc ) + change.value + data.substr( loc );
                    loc += change.count;
                }
                if( change.removed ){
                    data = data.substr( 0, loc ) + data.substr( loc + change.count );
                }else{
                    loc += change.count;
                }
            }


            fs.writeFile( file, data, 'utf8', function( err, data ){
                if( err ){
                    return console.log( err );
                }
                p_done.resolve( );
            });
        });
        
        return p_done.promise;
        
    }
};
