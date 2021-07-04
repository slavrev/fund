
var garants = [
  {
    "name": "SlavRev",
    "link": "https://www.youtube.com/watch?v=eJkCx9wA1dg",
    "address": "bc1qr76p2chj6py22m0hyfgd9e96jmgaw0uffasf5v",
    "publickey": "zpub6ndq4fRUcmX65ctKdEL3iqR2eG57JP3f5ZVaMhTQMWBDfkGD6i8fqwDWV5irKB1BkSLjC2LMFBgLB67cyMkvKHu57MeQo5bMh5VboJxGQVn",
    "balance": 1000
  }
]

var legitimateOutTransactions = [
  /*
  { 
    value: 10000,    
    hash: '123456',
    description: 'Перевели по такому-то назначению',
    time: 1618514348
  },
  { 
    value: 11000,    
    hash: '123456',
    description: 'Перевели по такому-то назначению 2',
    time: 1618514348
  }
  */
]

var usdPrice

var formatterUsd = new Intl.NumberFormat('ru-BY', {
  style: 'currency',
  currency: 'USD',
});  

var dateOptions = {
  month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  hour12: false,
  timeZone: 'Europe/Minsk'
}

var dateFormatter = new Intl.DateTimeFormat('ru-BY', dateOptions)

function readGarants() {

  var request = new XMLHttpRequest()
  request.open('GET', 'garants.json', false)
  request.send(null)

  garants = JSON.parse( request.responseText )
}

function buildMultiQuery() {

  var multiQuery = 'https://blockchain.info/multiaddr?n=50&active='

  for(var i=0; i<garants.length; i++) {

    if( i > 0 )
      multiQuery += '|'

    multiQuery += garants[i].address
  }
  return multiQuery
}

function buildMultiQueryEx( offset ) {

  var multiQuery = 'https://blockchain.info/multiaddr?offset='+offset+'&n=200&active='

  for(var i=0; i<garants.length; i++) {

    if( i > 0 )
      multiQuery += '|'

    multiQuery += garants[i].address
  }  
  return multiQuery  
}

function isLegitimateTransaction( hash ) {

  for( var i=0; i<legitimateOutTransactions.length; i++ )
    if( legitimateOutTransactions[0] == hash )
      return true;

  return false;
}

function satToBtc( sat ) {
  return (sat / 100000000).toFixed(8)
}

function satToUsd( sat ) {
  return sat / 100000000 * usdPrice
}

function isOuterAddress( address ) {

  for( var i=0; i<garants.length; i++ )
    if( garants[i].address == address )
      return false

  return true
}

function toShortTxName( hash ) {
  return hash.slice(0,2)+'..'+hash.slice(-2)
}

function getGarantNameByAddress( address ) {

  for(var i=0; i<garants.length; i++)
    if( garants[i].address == address )
      return garants[i].name

  return '???'
}

function loadBtcToUsd( ondone ) {

  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4) {

      if( this.status == 200 ) {

        console.log( this.responseText );

        var json = JSON.parse( this.responseText );

        ondone( json.USD.last );

      } else {  

        // alert( this.responseText );
      }
    }
  };

  xmlhttp.open('GET', 'https://blockchain.info/ticker', true);
  xmlhttp.send();
}

function loadWallets( ondone ) {

  var balancediv = document.querySelector('#balancediv')
  if( balancediv ) 
    balancediv.style.display = 'block'

  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4) {

      if( this.status == 200 ) {

        console.log( this.responseText )
        mainJson = JSON.parse( this.responseText )

        ondone()

      } else {

        // alert('status: ' + this.status );

        // alert('Баланс не загружен')
      }
    }
  };

  xmlhttp.open('GET', multiQuery, true)
  xmlhttp.send()

  // ondone()
}

function fillWallets() {

  var walletsList = document.querySelector('#walletsList')
  var wallet
  var balanceBtc

  for(var i=0; i<garants.length; i++) {

    balanceBtc = getBalanceBtcByAddress( garants[i].address )    

    wallet = document.createElement('div')
    wallet.innerHTML = 
    (i+1) + '. ' + garants[i].name + ': ' + garants[i].address + 
    ' ( ' + balanceBtc + ' BTC, <a href="https://www.blockchain.com/ru/btc/address/'+garants[i].address+'">Внешний сервер</a>, ' + 
    ' <a href="' + garants[i].link + '">Проверить адрес</a>, ' + 
    ' <button onclick="alert(\''+ garants[i].publickey +'\')">Публичный ключ</button> )'
    walletsList.appendChild( wallet )
  }
}

function getBalanceBtcByAddress( address ) {

  for( var i=0; i<mainJson.addresses.length; i++ ) {

    if( mainJson.addresses[i].address == address )
      return mainJson.addresses[i].final_balance / 100000000
  }
}