﻿//
// JSDraw.Pro
// Version 5.2.0.2018-10-25
//
// JSDraw™ 5.2.0 is built on Dojo 1.12.1 (http://www.dojotoolkit.org/)
//
// Copyright (c) 2018 Scilligence
// - Please contact [support@scilligence.com] for licenses
//   http://wwww.jsdraw.com/
//
//////////////////////////////////////////////////////////////////////////////////




//////////////////////////////////////////////////////////////////////////////////
// Place password encypting key

JSDraw2.password = { encrypt: true, key: null, iv: null };



//////////////////////////////////////////////////////////////////////////////////
// Place the license code below
// Licensed to: FDA
// Product: JSDraw
// Expiration Date: 2022-Jul-30
JSDraw2.licensecode='405562533916781761723242424242424131213141512181';



//////////////////////////////////////////////////////////////////////////////////
// JSDraw default settings

JSDraw2.defaultoptions = {
//Set the base URL for images and additional script loading
"imagebase" : document.baseURI + "assets/jsdraw/"
};


//Added to try to pre-empt loading
scil.Utils._scripturl=null; //this helps ensure temporary cached settings aren't honored
scil.Utils._loadedAdditions=true; //flag that this extra file is loaded

scil.Utils.imgSrc = function (button, wrapasinurl) {
var s = null;
if (button != null)
    button = button.toLowerCase();

var imgbase64 = (JSDraw2.Resources)?JSDraw2.Resources[button]:null;
if (imgbase64 != null) {
    var p = button.lastIndexOf('.');
    var type = button.substr(p + 1);
    s = 'data:image/' + type + ';base64,' + imgbase64;
}
else {
    s = scil.Utils._imgBase() + button;
}
if (wrapasinurl)
    s = 'url(' + s + ')';
return s;
};

scil.App.imgSmall = function (button, wrapasurl) {
if (button != null)
    button = button.toLowerCase();
var imgbase64 = (JSDraw2.Resources)?JSDraw2.Resources['small/' + button]:null;
if (imgbase64 != null) {
    var p = button.lastIndexOf('.');
    var type = button.substr(p + 1);
    s = 'data:image/' + type + ';base64,' + imgbase64;
}
else {
    s = 'small/' + button;
    if (wrapasurl)
        s = 'url(' + s + ')';
}
return s;
};