var isHidden = true;

var toggleSidebar = function( ){
    var sb = document.getElementById( "sidebar" );
    if( isHidden){
        sb.className = "show";
    }else{
        sb.className = "hide";
    }
    isHidden = !isHidden;
}
