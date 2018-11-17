var focusedCoin;
var lista = document.querySelector("#main_menu");
var settings = document.querySelector("#menuSettings");
var localCoin = "ARS";
var url = "https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,BCH,ETH,XRP,EOS,LTC,ICX,TRX,ETC,NEO,XMR,IOT,ZEC,DOGE,DASH&tsyms=BTC,USD,EUR";
var coindesk = "https://api.coindesk.com/v1/bpi/currentprice/"+localCoin+".json";
var monedas = "BTC,BCH,ETH,XRP,EOS,LTC,ICX,TRX,ETC,NEO,XMR,IOT,ZEC,DOGE,DASH";
monedas = monedas.split(",");
var dls = [];
var btcs = [];
var ars = [];
var colores = ["#288db5","#991515","#4f9e4b","#5A376D"];
var us_ars;
/*(function(tau) {
    var page,
        list,
        listHelper;

    /* Check for a circular device */
/*    if (tau.support.shape.circle) {
        document.addEventListener('pagebeforeshow', function(e) {
            page = e.target;
            list = page.querySelector('.ui-listview');
            console.log(list);
            if (list) {
                /* Create SnapListView and binding rotary event using tau.helper */
/*                listHelper = tau.helper.SnapListStyle.create(list);
            }
         });

        document.addEventListener('pagebeforehide', function(e) {
            listHelper.destroy();
        });
    }
}(tau));*/

var successCB = function(preferences) {
    var i;
    if(preferences.length>0){
    for (i = 0; i < preferences.length; i++) {
        console.log('The preference - key: ' + preferences[i].key + ' value: ' + preferences[i].value);
        if(preferences[i].value === true){
        	agregar(preferences[i].key);
        	console.log(preferences[i].key);
        	var checkbox = document.querySelector("#checkbox-"+preferences[i].key);
        	checkbox.setAttribute("checked", "checked");
        }
        }
    settings.parentNode.removeChild(settings);
    lista.appendChild(settings);
    }
};
var errCB = function(){console.log("errorCB");cambiarPagina('BTC');};

function cargarMonedas(){
tizen.preference.getAll(successCB,errCB);
crearLista(tau);
}

function crearLista(tau) {
    var page,
        list,
        listHelper;

    /* Check for a circular device */
    if (tau.support.shape.circle) {
        document.addEventListener('pagebeforeshow', function(e) {
            page = e.target;
            list = page.querySelector('.ui-listview');
            console.log(list);
            if (list) {
                /* Create SnapListView and binding rotary event using tau.helper */
            	listHelper = tau.helper.SnapListStyle.create(list);
            }
         });

        document.addEventListener('pagebeforehide', function() {
            listHelper.destroy();
        });
    }
}

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




function changePreference(key){
	//console.log(document.querySelector("#checkbox-"+key).getAttribute("checked"));
	if(document.querySelector("#checkbox-"+key).getAttribute("checked") == "checked"){
		
		tizen.preference.setValue(key,false);
		//console.log(key+" now set to false");
		document.querySelector("#checkbox-"+key).setAttribute("checked", "unchecked");
		var item = document.querySelector("#"+key);
		item.parentNode.removeChild(item);
	}
	else {
		tizen.preference.setValue(key,true);
		//console.log(key+" now set to true");
		document.querySelector("#checkbox-"+key).setAttribute("checked", "checked");
		agregar(key);
	}
	settings.parentNode.removeChild(settings);
	lista.appendChild(settings);
}

function agregar(preference){
	var texto = preference;
	var list = document.querySelector("#main_menu");
	var link = document.createElement("a"); link.innerText = texto;
	link.setAttribute("onclick","cambiarPagina('"+texto+"')");
	var li = document.createElement("li");
	li.setAttribute("id", preference);
	li.appendChild(link);
	list.appendChild(li);
	}
function cambiarPagina(coin){
	iniciar();
	focusedCoin = coin;
	document.querySelector("#title").innerText = coin;
	tau.changePage("#second");
	setData();
} 

function factor(){
	getJSON(coindesk,
			function(err, data) {
				if (err !== null) {
					document.querySelector("#content-uss").innerText = "Verifique Conexión";
					document.querySelector("#content-local").innerText = "ERROR";
                } else {
                    data = JSON.parse(data);
                    us_ars =  data.bpi.ARS.rate_float / data.bpi.USD.rate_float;
                    //console.log("US-ARS:\t"+us_ars);
                }
            });   	
}
 

 
    var getJSON = function(url, callback) {

        var xhr = new XMLHttpRequest();

        xhr.open('GET', url, true);

        xhr.onload = function() {
            var status = xhr.status;
            //console.log("status:" + status);
            if (status === 200) {
                callback(null, xhr.response);
            } else {
                callback(status, xhr.response);
            }
        };
        xhr.send();
    };
    
    var fetcher = function() {
    	//console.log("fetcher()");
        getJSON(url,
            function(err, data) {
                if (err !== null) {
                    document.querySelector("#content-uss").innerText = "Verifique Conexión";
                    document.querySelector("#content-local").innerText = "ERROR";
                } else {
                    data = JSON.parse(data);
                    // set ars
                    var j=0;
                    for(var i in data){
                    	console.log(coin);
                    	var coin = data[i];
                    	dls[j] = coin.USD;
                    	btcs[j] = coin.BTC;
                    	ars[j] = Math.floor(dls[j]*us_ars*100)/100;
                    	j++;
                    	console.log(btcs[0]);
                    	console.log(dls[0]);
                    }
                    setData();
                }
            });
    };
    function setData(){
    	for(var i = 0; monedas[i] !== focusedCoin ; i++){}
    	document.querySelector("#content-uss").innerText = "USD " + dls[i];
    	document.querySelector("#content-local").innerText = "localCoin " + ars[i];
    	document.querySelector("#content-btc").innerText = "BTC " + btcs[i];
    	document.querySelector("#second").setAttribute("style", "background-color:"+colores[i]);
    	
    }
    function iniciar(){
    	
    	factor();
    	fetcher();
        
    }
    function actualizar(){
    	iniciar();
    	setData();
    }
   
   //Acá arranca la app
    tizen.preference.getAll(successCB,errCB);
    crearLista(tau);