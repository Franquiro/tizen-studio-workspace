( function () {
	window.addEventListener( 'tizenhwkey', function( ev ) {
		if( ev.keyName === "back" ) {
			var page = document.getElementsByClassName( 'ui-page-active' )[0],
				pageid = page ? page.id : "";
			if( pageid === "main" ) {
				try {
					tizen.application.getCurrentApplication().exit();
				} catch (ignore) {
				}
			} else {
				window.history.back();
			}
		}
	} );
} () );

(function(){
	for(var i = 0;i<document.querySelectorAll("li").length;i++){
		document.querySelectorAll("li")[i].addEventListener("click",cargar);
	}
}());
function cargar(e){
	tizen.preference.setValue(e.target.getAttribute("id"), true);
	tizen.preference.getAll(leer, function(){console.log("error");});
}
function leer(e){
	for(var i = 0 ; i<e.length;i++){
		console.log(e[i].key);
	}
}
function toastAlert(){
	//leer();
	var message = "Esto es un toast";	// Input Message for toast from 									User Interface
	var messageOut = document.getElementById("messageOut"); 
	var timeOut = 2; 	// Input timeOut for toast from 										User Interface
	messageOut.innerHTML = message;
	
	tau.openPopup("#Popup");   									
	setTimeout(function(){ 
		tau.closePopup(); },	 // Alert Popup Toast
		timeOut*1000);			// Close alert after timeOut (unit: ms)
}

tizen.preference.getAll(leer, function(){console.log("error");});