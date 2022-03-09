require({cache:{
'dojox/mobile/_base':function(){
define([
	"./common",
	"./View",
	"./Heading",
	"./RoundRect",
	"./RoundRectCategory",
	"./EdgeToEdgeCategory",
	"./RoundRectList",
	"./EdgeToEdgeList",
	"./ListItem",
	"./Container",
	"./Pane",
	"./Switch",
	"./ToolBarButton",
	"./ProgressIndicator"
], function(common, View, Heading, RoundRect, RoundRectCategory, EdgeToEdgeCategory, RoundRectList, EdgeToEdgeList, ListItem, Switch, ToolBarButton, ProgressIndicator){
	// module:
	//		dojox/mobile/_base

	/*=====
	return {
		// summary:
		//		Includes the basic dojox/mobile modules: common, View, Heading, 
		//		RoundRect, RoundRectCategory, EdgeToEdgeCategory, RoundRectList,
		//		EdgeToEdgeList, ListItem, Container, Pane, Switch, ToolBarButton, 
		//		and ProgressIndicator.
	};
	=====*/
	return common;
});

},
'dojox/mobile/common':function(){
define([
	"dojo/_base/array",
	"dojo/_base/config",
	"dojo/_base/connect",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/_base/kernel",
	"dojo/dom",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/domReady",
	"dojo/ready",
	"dojo/touch",
	"dijit/registry",
	"./sniff",
	"./uacss" // (no direct references)
], function(array, config, connect, lang, win, kernel, dom, domClass, domConstruct, domReady, ready, touch, registry, has){

	// module:
	//		dojox/mobile/common

	var dm = lang.getObject("dojox.mobile", true);

	// tell dojo/touch to generate synthetic clicks immediately
	// and regardless of preventDefault() calls on touch events
	win.doc.dojoClick = true;
	/// ... but let user disable this by removing dojoClick from the document
	if(has("touch")){
		// Do we need to send synthetic clicks when preventDefault() is called on touch events?
		// This is normally true on anything except Android 4.1+ and IE10+, but users reported
		// exceptions like Galaxy Note 2. So let's use a has("clicks-prevented") flag, and let
		// applications override it through data-dojo-config="has:{'clicks-prevented':true}" if needed.
		has.add("clicks-prevented", !(has("android") >= 4.1 || (has("ie") === 10) || (!has("ie") && has("trident") > 6)));
		if(has("clicks-prevented")){
			dm._sendClick = function(target, e){
				// dojo/touch will send a click if dojoClick is set, so don't do it again.
				for(var node = target; node; node = node.parentNode){
					if(node.dojoClick){
						return;
					}
				}
				var ev = win.doc.createEvent("MouseEvents"); 
				ev.initMouseEvent("click", true, true, win.global, 1, e.screenX, e.screenY, e.clientX, e.clientY); 
				target.dispatchEvent(ev);
			};
		}
	}

	dm.getScreenSize = function(){
		// summary:
		//		Returns the dimensions of the browser window.
		return {
			h: win.global.innerHeight || win.doc.documentElement.clientHeight,
			w: win.global.innerWidth || win.doc.documentElement.clientWidth
		};
	};

	dm.updateOrient = function(){
		// summary:
		//		Updates the orientation specific CSS classes, 'dj_portrait' and
		//		'dj_landscape'.
		var dim = dm.getScreenSize();
		domClass.replace(win.doc.documentElement,
				  dim.h > dim.w ? "dj_portrait" : "dj_landscape",
				  dim.h > dim.w ? "dj_landscape" : "dj_portrait");
	};
	dm.updateOrient();

	dm.tabletSize = 500;
	dm.detectScreenSize = function(/*Boolean?*/force){
		// summary:
		//		Detects the screen size and determines if the screen is like
		//		phone or like tablet. If the result is changed,
		//		it sets either of the following css class to `<html>`:
		//
		//		- 'dj_phone'
		//		- 'dj_tablet'
		//
		//		and it publishes either of the following events:
		//
		//		- '/dojox/mobile/screenSize/phone'
		//		- '/dojox/mobile/screenSize/tablet'

		var dim = dm.getScreenSize();
		var sz = Math.min(dim.w, dim.h);
		var from, to;
		if(sz >= dm.tabletSize && (force || (!this._sz || this._sz < dm.tabletSize))){
			from = "phone";
			to = "tablet";
		}else if(sz < dm.tabletSize && (force || (!this._sz || this._sz >= dm.tabletSize))){
			from = "tablet";
			to = "phone";
		}
		if(to){
			domClass.replace(win.doc.documentElement, "dj_"+to, "dj_"+from);
			connect.publish("/dojox/mobile/screenSize/"+to, [dim]);
		}
		this._sz = sz;
	};
	dm.detectScreenSize();

	// dojox/mobile.hideAddressBarWait: Number
	//		The time in milliseconds to wait before the fail-safe hiding address
	//		bar runs. The value must be larger than 800.
	dm.hideAddressBarWait = typeof(config.mblHideAddressBarWait) === "number" ?
		config.mblHideAddressBarWait : 1500;

	dm.hide_1 = function(){
		// summary:
		//		Internal function to hide the address bar.
		// tags:
		//		private
		scrollTo(0, 1);
		dm._hidingTimer = (dm._hidingTimer == 0) ? 200 : dm._hidingTimer * 2;
		setTimeout(function(){ // wait for a while for "scrollTo" to finish
			if(dm.isAddressBarHidden() || dm._hidingTimer > dm.hideAddressBarWait){
				// Succeeded to hide address bar, or failed but timed out 
				dm.resizeAll();
				dm._hiding = false;
			}else{
				// Failed to hide address bar, so retry after a while
				setTimeout(dm.hide_1, dm._hidingTimer);
			}
		}, 50); //50ms is an experiential value
	};

	dm.hideAddressBar = function(/*Event?*/evt){
		// summary:
		//		Hides the address bar.
		// description:
		//		Tries to hide the address bar a couple of times. The purpose is to do 
		//		it as quick as possible while ensuring the resize is done after the hiding
		//		finishes.
		if(dm.disableHideAddressBar || dm._hiding){ return; }
		dm._hiding = true;
		dm._hidingTimer = has("ios") ? 200 : 0; // Need to wait longer in case of iPhone
		var minH = screen.availHeight;
		if(has('android')){
			minH = outerHeight / devicePixelRatio;
			// On some Android devices such as Galaxy SII, minH might be 0 at this time.
			// In that case, retry again after a while. (200ms is an experiential value)
			if(minH == 0){
				dm._hiding = false;
				setTimeout(function(){ dm.hideAddressBar(); }, 200);
			}
			// On some Android devices such as HTC EVO, "outerHeight/devicePixelRatio"
			// is too short to hide address bar, so make it high enough
			if(minH <= innerHeight){ minH = outerHeight; }
			// On Android 2.2/2.3, hiding address bar fails when "overflow:hidden" style is
			// applied to html/body element, so force "overflow:visible" style
			if(has('android') < 3){
				win.doc.documentElement.style.overflow = win.body().style.overflow = "visible";
			}
		}
		if(win.body().offsetHeight < minH){ // to ensure enough height for scrollTo to work
			win.body().style.minHeight = minH + "px";
			dm._resetMinHeight = true;
		}
		setTimeout(dm.hide_1, dm._hidingTimer);
	};

	dm.isAddressBarHidden = function(){
		return pageYOffset === 1;
	};

	dm.resizeAll = function(/*Event?*/evt, /*Widget?*/root){
		// summary:
		//		Calls the resize() method of all the top level resizable widgets.
		// description:
		//		Finds all widgets that do not have a parent or the parent does not
		//		have the resize() method, and calls resize() for them.
		//		If a widget has a parent that has resize(), calling widget's
		//		resize() is its parent's responsibility.
		// evt:
		//		Native event object
		// root:
		//		If specified, searches the specified widget recursively for top-level
		//		resizable widgets.
		//		root.resize() is always called regardless of whether root is a
		//		top level widget or not.
		//		If omitted, searches the entire page.
		if(dm.disableResizeAll){ return; }
		connect.publish("/dojox/mobile/resizeAll", [evt, root]); // back compat
		connect.publish("/dojox/mobile/beforeResizeAll", [evt, root]);
		if(dm._resetMinHeight){
			win.body().style.minHeight = dm.getScreenSize().h + "px";
		} 
		dm.updateOrient();
		dm.detectScreenSize();
		var isTopLevel = function(w){
			var parent = w.getParent && w.getParent();
			return !!((!parent || !parent.resize) && w.resize);
		};
		var resizeRecursively = function(w){
			array.forEach(w.getChildren(), function(child){
				if(isTopLevel(child)){ child.resize(); }
				resizeRecursively(child);
			});
		};
		if(root){
			if(root.resize){ root.resize(); }
			resizeRecursively(root);
		}else{
			array.forEach(array.filter(registry.toArray(), isTopLevel),
					function(w){ w.resize(); });
		}
		connect.publish("/dojox/mobile/afterResizeAll", [evt, root]);
	};

	dm.openWindow = function(url, target){
		// summary:
		//		Opens a new browser window with the given URL.
		win.global.open(url, target || "_blank");
	};

	dm._detectWindowsTheme = function(){
		// summary:
		//		Detects if the "windows" theme is used,
		//		if it is used, set has("windows-theme") and
		//		add the .windows_theme class on the document.
		
		// Avoid unwanted (un)zoom on some WP8 devices (at least Nokia Lumia 920) 
		if(navigator.userAgent.match(/IEMobile\/10\.0/)){
			domConstruct.create("style", 
				{innerHTML: "@-ms-viewport {width: auto !important}"}, win.doc.head);
		}

		var setWindowsTheme = function(){
			domClass.add(win.doc.documentElement, "windows_theme");
			kernel.experimental("Dojo Mobile Windows theme", "Behavior and appearance of the Windows theme are experimental.");
		};

		// First see if the "windows-theme" feature has already been set explicitly
		// in that case skip aut-detect
		var windows = has("windows-theme");
		if(windows !== undefined){
			if(windows){
				setWindowsTheme();
			}
			return;
		}

		// check css
		var i, j;

		var check = function(href){
			// TODO: find a better regexp to match?
			if(href && href.indexOf("/windows/") !== -1){
				has.add("windows-theme", true);
				setWindowsTheme();
				return true;
			}
			return false;
		};

		// collect @import
		var s = win.doc.styleSheets;
		for(i = 0; i < s.length; i++){
			if(s[i].href){ continue; }
			var r = s[i].cssRules || s[i].imports;
			if(!r){ continue; }
			for(j = 0; j < r.length; j++){
				if(check(r[j].href)){
					return;
				}
			}
		}

		// collect <link>
		var elems = win.doc.getElementsByTagName("link");
		for(i = 0; i < elems.length; i++){
			if(check(elems[i].href)){
				return;
			}
		}
	};

	if(config.mblApplyPageStyles !== false){
		domClass.add(win.doc.documentElement, "mobile");
	}
	if(has('chrome')){
		// dojox/mobile does not load uacss (only _compat does), but we need dj_chrome.
		domClass.add(win.doc.documentElement, "dj_chrome");
	}

	if(win.global._no_dojo_dm){
		// deviceTheme seems to be loaded from a script tag (= non-dojo usage)
		var _dm = win.global._no_dojo_dm;
		for(var i in _dm){
			dm[i] = _dm[i];
		}
		dm.deviceTheme.setDm(dm);
	}

	// flag for Android transition animation flicker workaround
	has.add('mblAndroidWorkaround', 
			config.mblAndroidWorkaround !== false && has('android') < 3, undefined, true);
	has.add('mblAndroid3Workaround', 
			config.mblAndroid3Workaround !== false && has('android') >= 3, undefined, true);

	dm._detectWindowsTheme();

	dm.setSelectable = function(/*Node*/node, /*Boolean*/selectable){
		var nodes, i;
		node = dom.byId(node);
		if (has("ie") <= 9){
			// (IE < 10) Fall back to setting/removing the
			// unselectable attribute on the element and all its children
			// except the input element (see https://bugs.dojotoolkit.org/ticket/13846)
			nodes = node.getElementsByTagName("*");
			i = nodes.length;
			if(selectable){
				node.removeAttribute("unselectable");
				while(i--){
					nodes[i].removeAttribute("unselectable");
				}
			}else{
				node.setAttribute("unselectable", "on");
				while(i--){
					if (nodes[i].tagName !== "INPUT"){
						nodes[i].setAttribute("unselectable", "on");
					}
				}
			}
		}else{
			domClass.toggle(node, "unselectable", !selectable);
		}
	};

	var touchActionProp = has("pointer-events") ? "touchAction" : has("MSPointer") ? "msTouchAction" : null;
	dm._setTouchAction = touchActionProp ? function(/*Node*/node, /*Boolean*/value){
		node.style[touchActionProp] = value;
	} : function(){};

	// Set the background style using dojo/domReady, not dojo/ready, to ensure it is already
	// set at widget initialization time. (#17418) 
	domReady(function(){
		if(config.mblApplyPageStyles !== false){
			domClass.add(win.body(), "mblBackground");
		}
	});

	ready(function(){
		dm.detectScreenSize(true);
		if(config.mblAndroidWorkaroundButtonStyle !== false && has('android')){
			// workaround for the form button disappearing issue on Android 2.2-4.0
			domConstruct.create("style", {innerHTML:"BUTTON,INPUT[type='button'],INPUT[type='submit'],INPUT[type='reset'],INPUT[type='file']::-webkit-file-upload-button{-webkit-appearance:none;} audio::-webkit-media-controls-play-button,video::-webkit-media-controls-play-button{-webkit-appearance:media-play-button;} video::-webkit-media-controls-fullscreen-button{-webkit-appearance:media-fullscreen-button;}"}, win.doc.head, "first");
		}
		if(has('mblAndroidWorkaround')){
			// add a css class to show view offscreen for android flicker workaround
			domConstruct.create("style", {innerHTML:".mblView.mblAndroidWorkaround{position:absolute;top:-9999px !important;left:-9999px !important;}"}, win.doc.head, "last");
		}

		var f = dm.resizeAll;
		// Address bar hiding
		var isHidingPossible =
			navigator.appVersion.indexOf("Mobile") != -1 && // only mobile browsers
			// #17455: hiding Safari's address bar works in iOS < 7 but this is 
			// no longer possible since iOS 7. Hence, exclude iOS 7 and later: 
			!(has("ios") >= 7);
		// You can disable the hiding of the address bar with the following dojoConfig:
		// var dojoConfig = { mblHideAddressBar: false };
		// If unspecified, the flag defaults to true.
		if((config.mblHideAddressBar !== false && isHidingPossible) ||
			config.mblForceHideAddressBar === true){
			dm.hideAddressBar();
			if(config.mblAlwaysHideAddressBar === true){
				f = dm.hideAddressBar;
			}
		}

		var ios6 = has("ios") >= 6; // Full-screen support for iOS6 or later
		if((has('android') || ios6) && win.global.onorientationchange !== undefined){
			var _f = f;
			var curSize, curClientWidth, curClientHeight;
			if(ios6){
				curClientWidth = win.doc.documentElement.clientWidth;
				curClientHeight = win.doc.documentElement.clientHeight;
			}else{ // Android
				// Call resize for the first resize event after orientationchange
				// because the size information may not yet be up to date when the 
				// event orientationchange occurs.
				f = function(evt){
					var _conn = connect.connect(null, "onresize", null, function(e){
						connect.disconnect(_conn);
						_f(e);
					});
				};
				curSize = dm.getScreenSize();
			};
			// Android: Watch for resize events when the virtual keyboard is shown/hidden.
			// The heuristic to detect this is that the screen width does not change
			// and the height changes by more than 100 pixels.
			//
			// iOS >= 6: Watch for resize events when entering or existing the new iOS6 
			// full-screen mode. The heuristic to detect this is that clientWidth does not
			// change while the clientHeight does change.
			connect.connect(null, "onresize", null, function(e){
				if(ios6){
					var newClientWidth = win.doc.documentElement.clientWidth,
						newClientHeight = win.doc.documentElement.clientHeight;
					if(newClientWidth == curClientWidth && newClientHeight != curClientHeight){
						// full-screen mode has been entered/exited (iOS6)
						_f(e);
					}
					curClientWidth = newClientWidth;
					curClientHeight = newClientHeight;
				}else{ // Android
					var newSize = dm.getScreenSize();
					if(newSize.w == curSize.w && Math.abs(newSize.h - curSize.h) >= 100){
						// keyboard has been shown/hidden (Android)
						_f(e);
					}
					curSize = newSize;
				}
			});
		}
		
		connect.connect(null, win.global.onorientationchange !== undefined
			? "onorientationchange" : "onresize", null, f);
		win.body().style.visibility = "visible";
	});

	// TODO: return functions declared above in this hash, rather than
	// dojox.mobile.

	/*=====
	return {
		// summary:
		//		A common module for dojox/mobile.
		// description:
		//		This module includes common utility functions that are used by
		//		dojox/mobile widgets. Also, it provides functions that are commonly
		//		necessary for mobile web applications, such as the hide address bar
		//		function.
	};
	=====*/
	return dm;
});

},
'dojox/mobile/sniff':function(){
define([
	"dojo/_base/kernel",
	"dojo/sniff"
], function(kernel, has){

	kernel.deprecated("dojox/mobile/sniff", "Use dojo/sniff instead", "2.0");
	
	// TODO: remove this in 2.0
	has.add("iphone", has("ios"));

	/*=====
	return {
		// summary:
		//		Deprecated: use dojo/sniff instead.
		//		On iOS, dojox/mobile/sniff sets "iphone" to the same value as "ios"
		//		for compatibility with earlier versions, but this should be considered deprecated.
		//		In future versions, "iphone" will be set only when running on an iPhone (not iPad on iPod).
	};
	=====*/
	return has;
});

},
'dojox/mobile/uacss':function(){
define([
	"dojo/_base/kernel",
	"dojo/_base/lang",
	"dojo/_base/window",
	"./sniff"
], function(dojo, lang, win, has){
	var html = win.doc.documentElement;
	html.className = lang.trim(html.className + " " + [
		has('bb') ? "dj_bb" : "",
		has('android') ? "dj_android" : "",
		has("ios") ? "dj_ios" : "",
		has("ios") >= 6 ? "dj_ios6" : "",
		has("ios") ? "dj_iphone" : "",	// TODO: remove for 2.0
		has('ipod') ? "dj_ipod" : "",
		has('ipad') ? "dj_ipad" : "",
		has('ie') ? "dj_ie": ""
	].join(" ").replace(/ +/g," "));
	
	/*=====
	return {
		// summary:
		//		Requiring this module adds CSS classes to your document's `<html`> tag:
		//
		//		- "dj_android" when running on Android;
		//		- "dj_bb" when running on BlackBerry;
		//		- "dj_ios" when running on iOS (iPhone, iPad or iPod);
		//		- "dj_ios6" when running on iOS6+; this class is intended for the iphone theme to detect if it must use the iOS 6 variant of the theme. Currently applies on iOS 6 or later.
		//		- "dj_iphone" when running on iPhone, iPad or iPod (Note: will be changed in future versions to be set only on iPhone);
		//		- "dj_ipod" when running on iPod;
		//		- "dj_ipad" when running on iPad.
	};
	=====*/
	return dojo;
});

},
'dojox/mobile/View':function(){
define([
	"dojo/_base/array",
	"dojo/_base/config",
	"dojo/_base/connect",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/sniff",
	"dojo/_base/window",
	"dojo/_base/Deferred",
	"dojo/dom",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-geometry",
	"dojo/dom-style",
	"dijit/registry",
	"dijit/_Contained",
	"dijit/_Container",
	"dijit/_WidgetBase",
	"./ViewController", // to load ViewController for you (no direct references)
	"./common",
	"./transition",
	"./viewRegistry",
	"./_css3"
], function(array, config, connect, declare, lang, has, win, Deferred, dom, domClass, domConstruct, domGeometry, domStyle, registry, Contained, Container, WidgetBase, ViewController, common, transitDeferred, viewRegistry, css3){

	// module:
	//		dojox/mobile/View

	var dm = lang.getObject("dojox.mobile", true);

	return declare("dojox.mobile.View", [WidgetBase, Container, Contained], {
		// summary:
		//		A container widget for any HTML element and/or Dojo widgets
		// description:
		//		View is a container widget for any HTML element and/or Dojo widgets.
		//		As a Dojo widget container it can itself contain View widgets
		//		forming a set of nested views. A Dojo Mobile application is usually
		//		made of multiple View widgets and the user can navigate through
		//		the views back and forth with animated transition effects.
		//		
		//		When using several sibling views (direct children of the same
		//		element), you can use the 'selected' attribute to define whether
		//		the view should be displayed when the application is launched.
		//		If no view has selected=true, the first sibling view is displayed
		//		at startup time.

		// selected: Boolean
		//		If true, the view is displayed at startup time.
		selected: false,

		// keepScrollPos: Boolean
		//		If true, the scroll position is kept when transition occurs between views.
		keepScrollPos: true,

		// tag: String
		//		The name of the HTML tag to create as domNode. The default value is "div".
		tag: "div",

		/* internal properties */
		baseClass: "mblView",

		constructor: function(/*Object*/params, /*DomNode?*/node){
			// summary:
			//		Creates a new instance of the class.
			// params:
			//		Contains the parameters.
			// node:
			//		The DOM node. If none is specified, it is automatically created. 
			if(node){
				dom.byId(node).style.visibility = "hidden";
			}
		},

		destroy: function(){
			viewRegistry.remove(this.id);
			this.inherited(arguments);
		},

		buildRendering: function(){
			if(!this.templateString){
				// Create root node if it wasn't created by _TemplatedMixin
				this.domNode = this.containerNode = this.srcNodeRef || domConstruct.create(this.tag);
			}

			this._animEndHandle = this.connect(this.domNode, css3.name("animationEnd"), "onAnimationEnd");
			this._animStartHandle = this.connect(this.domNode, css3.name("animationStart"), "onAnimationStart");
			if(!config.mblCSS3Transition){
				this._transEndHandle = this.connect(this.domNode, css3.name("transitionEnd"), "onAnimationEnd");
			}
			if(has('mblAndroid3Workaround')){
				// workaround for the screen flicker issue on Android 3.x/4.0
				// applying "-webkit-transform-style:preserve-3d" to domNode can avoid
				// transition animation flicker
				domStyle.set(this.domNode, css3.name("transformStyle"), "preserve-3d");
			}

			viewRegistry.add(this);
			this.inherited(arguments);
		},

		startup: function(){
			if(this._started){ return; }

			// Determine which view among the siblings should be visible.
			// Priority:
			//	 1. fragment id in the url (ex. #view1,view2)
			//	 2. this.selected
			//	 3. the first view
			if(this._visible === undefined){
				var views = this.getSiblingViews();
				var ids = location.hash && location.hash.substring(1).split(/,/);
				var fragView, selectedView, firstView;
				array.forEach(views, function(v, i){
					if(array.indexOf(ids, v.id) !== -1){ fragView = v; }
					if(i == 0){ firstView = v; }
					if(v.selected){ selectedView = v; }
					v._visible = false;
				}, this);
				(fragView || selectedView || firstView)._visible = true;
			}
			if(this._visible){
				// The 2nd arg is not to hide its sibling views so that they can be
				// correctly initialized.
				this.show(true, true);

				// Defer firing events to let user connect to events just after creation
				// TODO: revisit this for 2.0
				this.defer(function(){
					this.onStartView();
					connect.publish("/dojox/mobile/startView", [this]);
				});
			}

			if(this.domNode.style.visibility === "hidden"){ // this check is to avoid screen flickers
				this.domNode.style.visibility = "inherit";
			}

			// Need to call inherited first - so that child widgets get started
			// up correctly
			this.inherited(arguments);

			var parent = this.getParent();
			if(!parent || !parent.resize){ // top level widget
				this.resize();
			}

			if(!this._visible){
				// hide() should be called last so that child widgets can be
				// initialized while they are visible.
				this.hide();
			}
		},

		resize: function(){
			// summary:
			//		Calls resize() of each child widget.
			array.forEach(this.getChildren(), function(child){
				if(child.resize){ child.resize(); }
			});
		},

		onStartView: function(){
			// summary:
			//		Stub function to connect to from your application.
			// description:
			//		Called only when this view is shown at startup time.
		},

		onBeforeTransitionIn: function(moveTo, dir, transition, context, method){
			// summary:
			//		Stub function to connect to from your application.
			// description:
			//		Called before the arriving transition occurs.
		},

		onAfterTransitionIn: function(moveTo, dir, transition, context, method){
			// summary:
			//		Stub function to connect to from your application.
			// description:
			//		Called after the arriving transition occurs.
		},

		onBeforeTransitionOut: function(moveTo, dir, transition, context, method){
			// summary:
			//		Stub function to connect to from your application.
			// description:
			//		Called before the leaving transition occurs.
		},

		onAfterTransitionOut: function(moveTo, dir, transition, context, method){
			// summary:
			//		Stub function to connect to from your application.
			// description:
			//		Called after the leaving transition occurs.
		},

		_clearClasses: function(/*DomNode*/node){
			// summary:
			//		Clean up the domNode classes that were added while making a transition.
			// description:
			//		Remove all the "mbl" prefixed classes except mbl*View.
			if(!node){ return; }
			var classes = [];
			array.forEach(lang.trim(node.className||"").split(/\s+/), function(c){
				if(c.match(/^mbl\w*View$/) || c.indexOf("mbl") === -1){
					classes.push(c);
				}
			}, this);
			node.className = classes.join(' ');
		},

		_fixViewState: function(/*DomNode*/toNode){
			// summary:
			//		Sanity check for view transition states.
			// description:
			//		Sometimes uninitialization of Views fails after making view transition,
			//		and that results in failure of subsequent view transitions.
			//		This function does the uninitialization for all the sibling views.
			var nodes = this.domNode.parentNode.childNodes;
			for(var i = 0; i < nodes.length; i++){
				var n = nodes[i];
				if(n.nodeType === 1 && domClass.contains(n, "mblView")){
					this._clearClasses(n);
				}
			}
			this._clearClasses(toNode); // just in case toNode is a sibling of an ancestor.
			
			// #16337
			// Uninitialization may fail to clear _inProgress when multiple
			// performTransition calls occur in a short duration of time.
			var toWidget = registry.byNode(toNode);
			if(toWidget){
				toWidget._inProgress = false;
			}
		},

		convertToId: function(moveTo){
			if(typeof(moveTo) == "string"){
				// removes a leading hash mark (#) and params if exists
				// ex. "#bar&myParam=0003" -> "bar"
				return moveTo.replace(/^#?([^&?]+).*/, "$1");
			}
			return moveTo;
		},

		_isBookmarkable: function(detail){
			return detail.moveTo && (config.mblForceBookmarkable || detail.moveTo.charAt(0) === '#') && !detail.hashchange;
		},

		performTransition: function(/*String*/moveTo, /*Number*/transitionDir, /*String*/transition,
									/*Object|null*/context, /*String|Function*/method /*...*/){
			// summary:
			//		Function to perform the various types of view transitions, such as fade, slide, and flip.
			// moveTo: String
			//		The id of the transition destination view which resides in
			//		the current page.
			//		If the value has a hash sign ('#') before the id
			//		(e.g. #view1) and the dojo/hash module is loaded by the user
			//		application, the view transition updates the hash in the
			//		browser URL so that the user can bookmark the destination
			//		view. In this case, the user can also use the browser's
			//		back/forward button to navigate through the views in the
			//		browser history.
			//		If null, transitions to a blank view.
			//		If '#', returns immediately without transition.
			// transitionDir: Number
			//		The transition direction. If 1, transition forward. If -1, transition backward.
			//		For example, the slide transition slides the view from right to left when transitionDir == 1,
			//		and from left to right when transitionDir == -1.
			// transition: String
			//		A type of animated transition effect. You can choose from
			//		the standard transition types, "slide", "fade", "flip", or
			//		from the extended transition types, "cover", "coverv",
			//		"dissolve", "reveal", "revealv", "scaleIn", "scaleOut",
			//		"slidev", "swirl", "zoomIn", "zoomOut", "cube", and
			//		"swap". If "none" is specified, transition occurs
			//		immediately without animation.
			// context: Object
			//		The object that the callback function will receive as "this".
			// method: String|Function
			//		A callback function that is called when the transition has finished.
			//		A function reference, or name of a function in context.
			// tags:
			//		public
			//
			// example:
			//		Transition backward to a view whose id is "foo" with the slide animation.
			//	|	performTransition("foo", -1, "slide");
			//
			// example:
			//		Transition forward to a blank view, and then open another page.
			//	|	performTransition(null, 1, "slide", null, function(){location.href = href;});

			if(this._inProgress){ return; } // transition is in progress
			this._inProgress = true;
			
			// normalize the arg
			var detail, optArgs;
			if(moveTo && typeof(moveTo) === "object"){
				detail = moveTo;
				optArgs = transitionDir; // array
			}else{
				detail = {
					moveTo: moveTo,
					transitionDir: transitionDir,
					transition: transition,
					context: context,
					method: method
				};
				optArgs = [];
				for(var i = 5; i < arguments.length; i++){
					optArgs.push(arguments[i]);
				}
			}

			// save the parameters
			this._detail = detail;
			this._optArgs = optArgs;
			this._arguments = [
				detail.moveTo,
				detail.transitionDir,
				detail.transition,
				detail.context,
				detail.method
			];

			if(detail.moveTo === "#"){ return; }
			var toNode;
			if(detail.moveTo){
				toNode = this.convertToId(detail.moveTo);
			}else{
				if(!this._dummyNode){
					this._dummyNode = win.doc.createElement("div");
					win.body().appendChild(this._dummyNode);
				}
				toNode = this._dummyNode;
			}

			if(this.addTransitionInfo && typeof(detail.moveTo) == "string" && this._isBookmarkable(detail)){
				this.addTransitionInfo(this.id, detail.moveTo, {transitionDir:detail.transitionDir, transition:detail.transition});
			}

			var fromNode = this.domNode;
			var fromTop = fromNode.offsetTop;
			toNode = this.toNode = dom.byId(toNode);
			if(!toNode){ console.log("dojox/mobile/View.performTransition: destination view not found: "+detail.moveTo); return; }
			toNode.style.visibility = "hidden";
			toNode.style.display = "";
			this._fixViewState(toNode);
			var toWidget = registry.byNode(toNode);
			if(toWidget){
				// Now that the target view became visible, it's time to run resize()
				if(config.mblAlwaysResizeOnTransition || !toWidget._resized){
					common.resizeAll(null, toWidget);
					toWidget._resized = true;
				}

				if(detail.transition && detail.transition != "none"){
					// Temporarily add padding to align with the fromNode while transition
					toWidget._addTransitionPaddingTop(fromTop);
				}

				toWidget.load && toWidget.load(); // for ContentView

				toWidget.movedFrom = fromNode.id;
			}
			if(has('mblAndroidWorkaround') && !config.mblCSS3Transition
					&& detail.transition && detail.transition != "none"){
				// workaround for the screen flicker issue on Android 2.2/2.3
				// apply "-webkit-transform-style:preserve-3d" to both toNode and fromNode
				// to make them 3d-transition-ready state just before transition animation
				domStyle.set(toNode, css3.name("transformStyle"), "preserve-3d");
				domStyle.set(fromNode, css3.name("transformStyle"), "preserve-3d");
				// show toNode offscreen to avoid flicker when switching "display" and "visibility" styles
				domClass.add(toNode, "mblAndroidWorkaround");
			}

			this.onBeforeTransitionOut.apply(this, this._arguments);
			connect.publish("/dojox/mobile/beforeTransitionOut", [this].concat(lang._toArray(this._arguments)));
			if(toWidget){
				// perform view transition keeping the scroll position
				if(this.keepScrollPos && !this.getParent()){
					var scrollTop = win.body().scrollTop || win.doc.documentElement.scrollTop || win.global.pageYOffset || 0;
					fromNode._scrollTop = scrollTop;
					var toTop = (detail.transitionDir == 1) ? 0 : (toNode._scrollTop || 0);
					toNode.style.top = "0px";
					if(scrollTop > 1 || toTop !== 0){
						fromNode.style.top = toTop - scrollTop + "px";
						// address bar hiding does not work on iOS 7+.
						if(!(has("ios") >= 7) && config.mblHideAddressBar !== false){
							this.defer(function(){ // iPhone needs setTimeout (via defer)
								win.global.scrollTo(0, (toTop || 1));
							});
						}
					}
				}else{
					toNode.style.top = "0px";
				}
				toWidget.onBeforeTransitionIn.apply(toWidget, this._arguments);
				connect.publish("/dojox/mobile/beforeTransitionIn", [toWidget].concat(lang._toArray(this._arguments)));
			}
			toNode.style.display = "none";
			toNode.style.visibility = "inherit";

			common.fromView = this;
			common.toView = toWidget;

			this._doTransition(fromNode, toNode, detail.transition, detail.transitionDir);
		},

		_addTransitionPaddingTop: function(/*String|Integer*/ value){
			// add padding top to the view in order to get alignment during the transition
			this.containerNode.style.paddingTop = value + "px";
		},

		_removeTransitionPaddingTop: function(){
			// remove padding top from the view after the transition
			this.containerNode.style.paddingTop = "";
		},

		_toCls: function(s){
			// convert from transition name to corresponding class name
			// ex. "slide" -> "mblSlide"
			return "mbl"+s.charAt(0).toUpperCase() + s.substring(1);
		},

		_doTransition: function(fromNode, toNode, transition, transitionDir){
			var rev = (transitionDir == -1) ? " mblReverse" : "";
			toNode.style.display = "";
			if(!transition || transition == "none"){
				this.domNode.style.display = "none";
				this.invokeCallback();
			}else if(config.mblCSS3Transition){
				//get dojox/css3/transit first
				Deferred.when(transitDeferred, lang.hitch(this, function(transit){
					//follow the style of .mblView.mblIn in View.css
					//need to set the toNode to absolute position
					var toPosition = domStyle.get(toNode, "position");
					domStyle.set(toNode, "position", "absolute");
					Deferred.when(transit(fromNode, toNode, {transition: transition, reverse: (transitionDir===-1)?true:false}),lang.hitch(this,function(){
						domStyle.set(toNode, "position", toPosition);
						// Reset the temporary padding on toNode
						toNode.style.paddingTop = "";
						this.invokeCallback();
					}));
				}));
			}else{
				if(transition.indexOf("cube") != -1){
					if(has('ipad')){
						domStyle.set(toNode.parentNode, {webkitPerspective:1600});
					}else if(has("ios")){
						domStyle.set(toNode.parentNode, {webkitPerspective:800});
					}
				}
				var s = this._toCls(transition);
				if(has('mblAndroidWorkaround')){
					// workaround for the screen flicker issue on Android 2.2
					// applying transition css classes just after setting toNode.style.display = ""
					// causes flicker, so wait for a while using setTimeout (via defer)
					var _this = this;
					_this.defer(function(){
						domClass.add(fromNode, s + " mblOut" + rev);
						domClass.add(toNode, s + " mblIn" + rev);
						domClass.remove(toNode, "mblAndroidWorkaround"); // remove offscreen style
						_this.defer(function(){
							domClass.add(fromNode, "mblTransition");
							domClass.add(toNode, "mblTransition");
						}, 30); // 30 = 100 - 70, to make total delay equal to 100ms
					}, 70); // 70ms is experiential value
				}else{
					domClass.add(fromNode, s + " mblOut" + rev);
					domClass.add(toNode, s + " mblIn" + rev);
					this.defer(function(){
						domClass.add(fromNode, "mblTransition");
						domClass.add(toNode, "mblTransition");
					}, 100);
				}
				// set transform origin
				var fromOrigin = "50% 50%";
				var toOrigin = "50% 50%";
				var scrollTop, posX, posY;
				if(transition.indexOf("swirl") != -1 || transition.indexOf("zoom") != -1){
					if(this.keepScrollPos && !this.getParent()){
						scrollTop = win.body().scrollTop || win.doc.documentElement.scrollTop || win.global.pageYOffset || 0;
					}else{
						scrollTop = -domGeometry.position(fromNode, true).y;
					}
					posY = win.global.innerHeight / 2 + scrollTop;
					fromOrigin = "50% " + posY + "px";
					toOrigin = "50% " + posY + "px";
				}else if(transition.indexOf("scale") != -1){
					var viewPos = domGeometry.position(fromNode, true);
					posX = ((this.clickedPosX !== undefined) ? this.clickedPosX : win.global.innerWidth / 2) - viewPos.x;
					if(this.keepScrollPos && !this.getParent()){
						scrollTop = win.body().scrollTop || win.doc.documentElement.scrollTop || win.global.pageYOffset || 0;
					}else{
						scrollTop = -viewPos.y;
					}
					posY = ((this.clickedPosY !== undefined) ? this.clickedPosY : win.global.innerHeight / 2) + scrollTop;
					fromOrigin = posX + "px " + posY + "px";
					toOrigin = posX + "px " + posY + "px";
				}
				domStyle.set(fromNode, css3.add({}, {transformOrigin:fromOrigin}));
				domStyle.set(toNode, css3.add({}, {transformOrigin:toOrigin}));
			}
		},

		onAnimationStart: function(e){
			// summary:
			//		A handler that is called when transition animation starts.
		},

		onAnimationEnd: function(e){
			// summary:
			//		A handler that is called after transition animation ends.
			var name = e.animationName || e.target.className;
			if(name.indexOf("Out") === -1 &&
				name.indexOf("In") === -1 &&
				name.indexOf("Shrink") === -1){ return; }
			var isOut = false;
			if(domClass.contains(this.domNode, "mblOut")){
				isOut = true;
				this.domNode.style.display = "none";
				domClass.remove(this.domNode, [this._toCls(this._detail.transition), "mblIn", "mblOut", "mblReverse"]);
			}else{
				// Reset the temporary padding
				this._removeTransitionPaddingTop();
			}
			domStyle.set(this.domNode, css3.add({}, {transformOrigin:""}));
			if(name.indexOf("Shrink") !== -1){
				var li = e.target;
				li.style.display = "none";
				domClass.remove(li, "mblCloseContent");

				// If target is placed inside scrollable, need to call onTouchEnd
				// to adjust scroll position
				var p = viewRegistry.getEnclosingScrollable(this.domNode);
				p && p.onTouchEnd();
			}
			if(isOut){
				this.invokeCallback();
			}
			this._clearClasses(this.domNode);

			// clear the clicked position
			this.clickedPosX = this.clickedPosY = undefined;

			if(name.indexOf("Cube") !== -1 &&
				name.indexOf("In") !== -1 && has("ios")){
				this.domNode.parentNode.style[css3.name("perspective")] = "";
			}
		},

		invokeCallback: function(){
			// summary:
			//		A function to be called after performing a transition to
			//		call a specified callback.
			this.onAfterTransitionOut.apply(this, this._arguments);
			connect.publish("/dojox/mobile/afterTransitionOut", [this].concat(this._arguments));
			var toWidget = registry.byNode(this.toNode);
			if(toWidget){
				toWidget.onAfterTransitionIn.apply(toWidget, this._arguments);
				connect.publish("/dojox/mobile/afterTransitionIn", [toWidget].concat(this._arguments));
				toWidget.movedFrom = undefined;
				if(this.setFragIds && this._isBookmarkable(this._detail)){
					this.setFragIds(toWidget); // setFragIds is defined in bookmarkable.js
				}
			}
			if(has('mblAndroidWorkaround')){
				// workaround for the screen flicker issue on Android 2.2/2.3
				// remove "-webkit-transform-style" style after transition finished
				// to avoid side effects such as input field auto-scrolling issue
				// use setTimeout (via defer) to avoid flicker in case of ScrollableView
				this.defer(function(){
					if(toWidget){ domStyle.set(this.toNode, css3.name("transformStyle"), ""); }
					domStyle.set(this.domNode, css3.name("transformStyle"), "");
				});
			}

			var c = this._detail.context, m = this._detail.method;
			if(c || m){
				if(!m){
					m = c;
					c = null;
				}
				c = c || win.global;
				if(typeof(m) == "string"){
					c[m].apply(c, this._optArgs);
				}else if(typeof(m) == "function"){
					m.apply(c, this._optArgs);
				}
			}
			this._detail = this._optArgs = this._arguments = undefined;
			this._inProgress = false;
		},

		isVisible: function(/*Boolean?*/checkAncestors){
			// summary:
			//		Return true if this view is visible
			// checkAncestors:
			//		If true, in addition to its own visibility, also checks the
			//		ancestors visibility to see if the view is actually being
			//		shown or not.
			var visible = function(node){
				return domStyle.get(node, "display") !== "none";
			};
			if(checkAncestors){
				for(var n = this.domNode; n.tagName !== "BODY"; n = n.parentNode){
					if(!visible(n)){ return false; }
				}
				return true;
			}else{
				return visible(this.domNode);
			}
		},

		getShowingView: function(){
			// summary:
			//		Find the currently showing view from my sibling views.
			// description:
			//		Note that depending on the ancestor views' visibility,
			//		the found view may not be actually shown.
			var nodes = this.domNode.parentNode.childNodes;
			for(var i = 0; i < nodes.length; i++){
				var n = nodes[i];
				if(n.nodeType === 1 && domClass.contains(n, "mblView") && n.style.display !== "none"){
					return registry.byNode(n);
				}
			}
			return null;
		},

		getSiblingViews: function(){
			// summary:
			//		Returns an array of the sibling views.
			if(!this.domNode.parentNode){ return [this]; }
			return array.map(array.filter(this.domNode.parentNode.childNodes,
				function(n){ return n.nodeType === 1 && domClass.contains(n, "mblView"); }),
				function(n){ return registry.byNode(n); });
		},

		show: function(/*Boolean?*/noEvent, /*Boolean?*/doNotHideOthers){
			// summary:
			//		Shows this view without a transition animation.
			var out = this.getShowingView();
			if(!noEvent){
				if(out){
					out.onBeforeTransitionOut(out.id);
					connect.publish("/dojox/mobile/beforeTransitionOut", [out, out.id]);
				}
				this.onBeforeTransitionIn(this.id);
				connect.publish("/dojox/mobile/beforeTransitionIn", [this, this.id]);
			}

			if(doNotHideOthers){
				this.domNode.style.display = "";
			}else{
				array.forEach(this.getSiblingViews(), function(v){
					v.domNode.style.display = (v === this) ? "" : "none";
				}, this);
			}
			this.load && this.load(); // for ContentView

			if(!noEvent){
				if(out){
					out.onAfterTransitionOut(out.id);
					connect.publish("/dojox/mobile/afterTransitionOut", [out, out.id]);
				}
				this.onAfterTransitionIn(this.id);
				connect.publish("/dojox/mobile/afterTransitionIn", [this, this.id]);
			}
		},

		hide: function(){
			// summary:
			//		Hides this view without a transition animation.
			this.domNode.style.display = "none";
		}
	});
});

},
'dojox/mobile/ViewController':function(){
define([
	"dojo/_base/kernel",
	"dojo/_base/array",
	"dojo/_base/connect",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/_base/Deferred",
	"dojo/dom",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/on",
	"dojo/ready",
	"dijit/registry",
	"./ProgressIndicator",
	"./TransitionEvent",
	"./viewRegistry"
], function(dojo, array, connect, declare, lang, win, Deferred, dom, domClass, domConstruct, on, ready, registry, ProgressIndicator, TransitionEvent, viewRegistry){

	// module:
	//		dojox/mobile/ViewController

	var Controller = declare("dojox.mobile.ViewController", null, {
		// summary:
		//		A singleton class that controls view transition.
		// description:
		//		This class listens to the "startTransition" events and performs
		//		view transitions. If the transition destination is an external
		//		view specified with the url parameter, the view content is
		//		retrieved and parsed to create a new target view.

		// dataHandlerClass: Object
		//		The data handler class used to load external views,
		//		by default "dojox/mobile/dh/DataHandler"
		//		(see the Data Handlers page in the reference documentation).
		dataHandlerClass: "dojox/mobile/dh/DataHandler",
		// dataSourceClass: Object
		//		The data source class used to load external views,
		//		by default "dojox/mobile/dh/UrlDataSource"
		//		(see the Data Handlers page in the reference documentation).
		dataSourceClass: "dojox/mobile/dh/UrlDataSource",
		// fileTypeMapClass: Object
		//		The file type map class used to load external views,
		//		by default "dojox/mobile/dh/SuffixFileTypeMap"
		//		(see the Data Handlers page in the reference documentation).
		fileTypeMapClass: "dojox/mobile/dh/SuffixFileTypeMap",

		constructor: function(){
			// summary:
			//		Creates a new instance of the class.
			// tags:
			//		private
			this.viewMap = {};
			ready(lang.hitch(this, function(){
				on(win.body(), "startTransition", lang.hitch(this, "onStartTransition"));
			}));
		},

		findTransitionViews: function(/*String*/moveTo){
			// summary:
			//		Parses the moveTo argument and determines a starting view and a destination view.
			// returns: Array
			//		An array containing the currently showing view, the destination view
			//		and the transition parameters, or an empty array if the moveTo argument
			//		could not be parsed. 
			if(!moveTo){ return []; }
			// removes a leading hash mark (#) and params if exists
			// ex. "#bar&myParam=0003" -> "bar"
			moveTo.match(/^#?([^&?]+)(.*)/);
			var params = RegExp.$2;
			var view = registry.byId(RegExp.$1);
			if(!view){ return []; }
			for(var v = view.getParent(); v; v = v.getParent()){ // search for the topmost invisible parent node
				if(v.isVisible && !v.isVisible()){
					var sv = view.getShowingView();
					if(sv && sv.id !== view.id){
						view.show();
					}
					view = v;
				}
			}
			return [view.getShowingView(), view, params]; // fromView, toView, params
		},

		openExternalView: function(/*Object*/ transOpts, /*DomNode*/ target){
			// summary:
			//		Loads an external view and performs a transition to it.
			// returns: dojo/_base/Deferred
			//		Deferred object that resolves when the external view is
			//		ready and a transition starts. Note that it resolves before
			//		the transition is complete.
			// description:
			//		This method loads external view content through the
			//		dojox/mobile data handlers, creates a new View instance with
			//		the loaded content, and performs a view transition to the
			//		new view. The external view content can be specified with
			//		the url property of transOpts. The new view is created under
			//		a DOM node specified by target.
			//
			// example:
			//		This example loads view1.html, creates a new view under
			//		`<body>`, and performs a transition to the new view with the
			//		slide animation.
			//		
			//	|	var vc = ViewController.getInstance();
			//	|	vc.openExternalView({
			//	|	    url: "view1.html", 
			//	|	    transition: "slide"
			//	|	}, win.body());
			//
			//
			// example:
			//		If you want to perform a view transition without animation,
			//		you can give transition:"none" to transOpts.
			//
			//	|	var vc = ViewController.getInstance();
			//	|	vc.openExternalView({
			//	|	    url: "view1.html", 
			//	|	    transition: "none"
			//	|	}, win.body());
			//
			// example:
			//		If you want to dynamically create an external view, but do
			//		not want to perform a view transition to it, you can give noTransition:true to transOpts.
			//		This may be useful when you want to preload external views before the user starts using them.
			//
			//	|	var vc = ViewController.getInstance();
			//	|	vc.openExternalView({
			//	|	    url: "view1.html", 
			//	|	    noTransition: true
			//	|	}, win.body());
			//
			// example:
			//		To do something when the external view is ready:
			//
			//	|	var vc = ViewController.getInstance();
			//	|	Deferred.when(vc.openExternalView({...}, win.body()), function(){
			//	|	    doSomething();
			//	|	});

			var d = new Deferred();
			var id = this.viewMap[transOpts.url];
			if(id){
				transOpts.moveTo = id;
				if(transOpts.noTransition){
					registry.byId(id).hide();
				}else{
					new TransitionEvent(win.body(), transOpts).dispatch();
				}
				d.resolve(true);
				return d;
			}

			// if a fixed bottom bar exists, a new view should be placed before it.
			var refNode = null;
			for(var i = target.childNodes.length - 1; i >= 0; i--){
				var c = target.childNodes[i];
				if(c.nodeType === 1){
					var fixed = c.getAttribute("fixed") // TODO: Remove the non-HTML5-compliant attribute in 2.0
						|| c.getAttribute("data-mobile-fixed")
						|| (registry.byNode(c) && registry.byNode(c).fixed);
					if(fixed === "bottom"){
						refNode = c;
						break;
					}
				}
			}

			var dh = transOpts.dataHandlerClass || this.dataHandlerClass;
			var ds = transOpts.dataSourceClass || this.dataSourceClass;
			var ft = transOpts.fileTypeMapClass || this.fileTypeMapClass;
			require([dh, ds, ft], lang.hitch(this, function(DataHandler, DataSource, FileTypeMap){
				var handler = new DataHandler(new DataSource(transOpts.data || transOpts.url), target, refNode);
				var contentType = transOpts.contentType || FileTypeMap.getContentType(transOpts.url) || "html";
				handler.processData(contentType, lang.hitch(this, function(id){
					if(id){
						this.viewMap[transOpts.url] = transOpts.moveTo = id;
						if(transOpts.noTransition){
							registry.byId(id).hide();
						}else{
							new TransitionEvent(win.body(), transOpts).dispatch();
						}
						d.resolve(true);
					}else{
						d.reject("Failed to load "+transOpts.url);
					}
				}));
			}));
			return d;
		},

		onStartTransition: function(evt){
			// summary:
			//		A handler that performs view transition.
			evt.preventDefault();
			if(!evt.detail){ return; }
			var detail = evt.detail;
			if(!detail.moveTo && !detail.href && !detail.url && !detail.scene){ return; }

			if(detail.url && !detail.moveTo){
				var urlTarget = detail.urlTarget;
				var w = registry.byId(urlTarget);
				var target = w && w.containerNode || dom.byId(urlTarget);
				if(!target){
					w = viewRegistry.getEnclosingView(evt.target);
					target = w && w.domNode.parentNode || win.body();
				}
				var src = registry.getEnclosingWidget(evt.target);
				if(src && src.callback){
					detail.context = src;
					detail.method = src.callback;
				}
				this.openExternalView(detail, target);
				return;
			}else if(detail.href){
				if(detail.hrefTarget && detail.hrefTarget != "_self"){
					win.global.open(detail.href, detail.hrefTarget);
				}else{
					var view; // find top level visible view
					for(var v = viewRegistry.getEnclosingView(evt.target); v; v = viewRegistry.getParentView(v)){
						view = v;
					}
					if(view){
						view.performTransition(null, detail.transitionDir, detail.transition, evt.target, function(){location.href = detail.href;});
					}
				}
				return;
			}else if(detail.scene){
				connect.publish("/dojox/mobile/app/pushScene", [detail.scene]);
				return;
			}

			var arr = this.findTransitionViews(detail.moveTo),
				fromView = arr[0],
				toView = arr[1],
				params = arr[2];
			if(!location.hash && !detail.hashchange){
				viewRegistry.initialView = fromView;
			}
			if(detail.moveTo && toView){
				detail.moveTo = (detail.moveTo.charAt(0) === '#' ? '#' + toView.id : toView.id) + params;
			}
			if(!fromView || (detail.moveTo && fromView === registry.byId(detail.moveTo.replace(/^#?([^&?]+).*/, "$1")))){ return; }
			src = registry.getEnclosingWidget(evt.target);
			if(src && src.callback){
				detail.context = src;
				detail.method = src.callback;
			}
			fromView.performTransition(detail);
		}
	});
	Controller._instance = new Controller(); // singleton
	Controller.getInstance = function(){
		return Controller._instance;
	};
	return Controller;
});


},
'dojox/mobile/ProgressIndicator':function(){
define([
	"dojo/_base/config",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-geometry",
	"dojo/dom-style",
	"dojo/has",
	"dijit/_Contained",
	"dijit/_WidgetBase",
	"./_css3",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/ProgressIndicator"
], function(config, declare, lang, domClass, domConstruct, domGeometry, domStyle, has, Contained, WidgetBase, css3, BidiProgressIndicator){

	// module:
	//		dojox/mobile/ProgressIndicator

	var cls = declare("dojox.mobile.ProgressIndicator", [WidgetBase, Contained], {
		// summary:
		//		A progress indication widget.
		// description:
		//		ProgressIndicator is a round spinning graphical representation
		//		that indicates the current task is ongoing.

		// interval: Number
		//		The time interval in milliseconds for updating the spinning
		//		indicator.
		interval: 100,

		// size: [const] Number
		//		The size of the indicator in pixels.
		//		Note that changing the value of the property after the widget
		//		creation has no effect.
		size: 40,

		// removeOnStop: Boolean
		//		If true, this widget is removed from the parent node
		//		when stop() is called.
		removeOnStop: true,

		// startSpinning: Boolean
		//		If true, calls start() to run the indicator at startup.
		startSpinning: false,

		// center: Boolean
		//		If true, the indicator is displayed as center aligned.
		center: true,

		// colors: String[]
		//		An array of indicator colors. 12 colors have to be given.
		//		If colors are not specified, CSS styles
		//		(mblProg0Color - mblProg11Color) are used.
		colors: null,

		/* internal properties */
		
		// baseClass: String
		//		The name of the CSS class of this widget.	
		baseClass: "mblProgressIndicator",

		constructor: function(){
			// summary:
			//		Creates a new instance of the class.
			this.colors = [];
			this._bars = [];
		},

		buildRendering: function(){
			this.inherited(arguments);
			if(this.center){
				domClass.add(this.domNode, "mblProgressIndicatorCenter");
			}
			this.containerNode = domConstruct.create("div", {className:"mblProgContainer"}, this.domNode);
			this.spinnerNode = domConstruct.create("div", null, this.containerNode);
			for(var i = 0; i < 12; i++){
				var div = domConstruct.create("div", {className:"mblProg mblProg"+i}, this.spinnerNode);
				this._bars.push(div);
			}
			this.scale(this.size);
			if(this.startSpinning){
				this.start();
			}
		},

		scale: function(/*Number*/size){
			// summary:
			//		Changes the size of the indicator.
			// size:
			//		The size of the indicator in pixels.
			var scale = size / 40;
			domStyle.set(this.containerNode, css3.add({}, {
				transform: "scale(" + scale + ")",
				transformOrigin: "0 0"
			}));
			domGeometry.setMarginBox(this.domNode, {w:size, h:size});
			domGeometry.setMarginBox(this.containerNode, {w:size / scale, h:size / scale});
		},

		start: function(){
			// summary:
			//		Starts the spinning of the ProgressIndicator.
			if(this.imageNode){
				var img = this.imageNode;
				var l = Math.round((this.containerNode.offsetWidth - img.offsetWidth) / 2);
				var t = Math.round((this.containerNode.offsetHeight - img.offsetHeight) / 2);
				img.style.margin = t+"px "+l+"px";
				return;
			}
			var cntr = 0;
			var _this = this;
			var n = 12;
			this.timer = setInterval(function(){
				cntr--;
				cntr = cntr < 0 ? n - 1 : cntr;
				var c = _this.colors;
				for(var i = 0; i < n; i++){
					var idx = (cntr + i) % n;
					if(c[idx]){
						_this._bars[i].style.backgroundColor = c[idx];
					}else{
						domClass.replace(_this._bars[i],
										 "mblProg" + idx + "Color",
										 "mblProg" + (idx === n - 1 ? 0 : idx + 1) + "Color");
					}
				}
			}, this.interval);
		},

		stop: function(){
			// summary:
			//		Stops the spinning of the ProgressIndicator.
			if(this.timer){
				clearInterval(this.timer);
			}
			this.timer = null;
			if(this.removeOnStop && this.domNode && this.domNode.parentNode){
				this.domNode.parentNode.removeChild(this.domNode);
			}
		},

		setImage: function(/*String*/file){
			// summary:
			//		Sets an indicator icon image file (typically animated GIF).
			//		If null is specified, restores the default spinner.
			if(file){
				this.imageNode = domConstruct.create("img", {src:file}, this.containerNode);
				this.spinnerNode.style.display = "none";
			}else{
				if(this.imageNode){
					this.containerNode.removeChild(this.imageNode);
					this.imageNode = null;
				}
				this.spinnerNode.style.display = "";
			}
		},

		destroy: function(){
			this.inherited(arguments);
			if(this === cls._instance){
				cls._instance = null;
			}
		}
	});
	cls = has("dojo-bidi") ? declare("dojox.mobile.ProgressIndicator", [cls, BidiProgressIndicator]) : cls;
	cls._instance = null;
	cls.getInstance = function(props){
		if(!cls._instance){
			cls._instance = new cls(props);
		}
		return cls._instance;
	};

	return cls;
});

},
'dojox/mobile/_css3':function(){
define([
	"dojo/_base/window",
	"dojo/_base/array",
	"dojo/has"
], function(win, arr, has){

	// caches for capitalized names and hypen names
	var cnames = [], hnames = [];

	// element style used for feature testing
	var style = win.doc.createElement("div").style;

	// We just test webkit prefix for now since our themes only have standard and webkit
	// (see dojox/mobile/themes/common/css3.less)
	// More prefixes can be added if/when we add them to css3.less.
	var prefixes = ["webkit"];

	// Does the browser support CSS3 animations?
	has.add("css3-animations", function(global, document, element){
		var style = element.style;
		return (style["animation"] !== undefined && style["transition"] !== undefined) ||
			arr.some(prefixes, function(p){
				return style[p+"Animation"] !== undefined && style[p+"Transition"] !== undefined;
			});
	});

	// Indicates whether style 'transition' returns empty string instead of
	// undefined, although TransitionEvent is not supported.
	// Reported on Android 4.1.x on some devices: https://bugs.dojotoolkit.org/ticket/17164
	has.add("t17164", function(global, document, element){
		return (element.style["transition"] !== undefined) && !('TransitionEvent' in window);
	});

	var css3 = {
		// summary:
		//		This module provide some cross-browser support for CSS3 properties.

		name: function(/*String*/p, /*Boolean?*/hyphen){
			// summary:
			//		Returns the name of a CSS3 property with the correct prefix depending on the browser.
			// p:
			//		The (non-prefixed) property name. The property name is assumed to be consistent with
			//		the hyphen argument, for example "transition-property" if hyphen is true, or "transitionProperty"
			//		if hyphen is false. If the browser supports the non-prefixed property, the property name will be
			//		returned unchanged.
			// hyphen:
			//		Optional, true if hyphen notation should be used (for example "transition-property" or "-webkit-transition-property"),
			//		false for camel-case notation (for example "transitionProperty" or "webkitTransitionProperty").

			var n = (hyphen?hnames:cnames)[p];
			if(!n){

				if(/End|Start/.test(p)){
					// event names: no good way to feature-detect, so we
					// assume they have the same prefix as the corresponding style property
					var idx = p.length - (p.match(/End/) ? 3 : 5);
					var s = p.substr(0, idx);
					var pp = this.name(s);
					if(pp == s){
						// no prefix, standard event names are all lowercase
						n = p.toLowerCase();
					}else{
						// prefix, e.g. webkitTransitionEnd (camel case)
						n = pp + p.substr(idx);
					}
				}else if(p == "keyframes"){
					// special case for keyframes, we also rely on consistency between 'animation' and 'keyframes'
					var pk = this.name("animation", hyphen);
					if(pk == "animation"){
						n = p;
					}else if(hyphen){
						n = pk.replace(/animation/, "keyframes");
					}else{
						n = pk.replace(/Animation/, "Keyframes");
					}
				}else{
					// convert name to camel-case for feature test
					var cn = hyphen ? p.replace(/-(.)/g, function(match, p1){
    					return p1.toUpperCase();
					}) : p;
					if(style[cn] !== undefined && !has('t17164')){
						// standard non-prefixed property is supported
						n = p;
					}else{
						// try prefixed versions
						cn = cn.charAt(0).toUpperCase() + cn.slice(1);
						arr.some(prefixes, function(prefix){
							if(style[prefix+cn] !== undefined){
								if(hyphen){
									n = "-" + prefix + "-" + p;
								}else{
									n = prefix + cn;
								}
							}
						});
					}
				}

				if(!n){
					// The property is not supported, just return it unchanged, it will be ignored.
					n = p;
				}

				(hyphen?hnames:cnames)[p] = n;
			}
			return n;
		},

		add: function(/*Object*/styles, /*Object*/css3Styles){
			// summary:
			//		Prefixes all property names in "css3Styles" and adds the prefixed properties in "styles".
			//		Used as a convenience when an object is passed to domStyle.set to set multiple styles.
			// example:
			//		domStyle.set(bar, css3.add({
			//			opacity: 0.6,
			//			position: "absolute",
			//			backgroundColor: "#606060"
			//		}, {
			//			borderRadius: "2px",
			//			transformOrigin: "0 0"
			//		}));
			// returns:
			//		The "styles" argument where the CSS3 styles have been added.

			for(var p in css3Styles){
				if(css3Styles.hasOwnProperty(p)){
					styles[css3.name(p)] = css3Styles[p];
				}
			}
			return styles;
		}
	};

	return css3;
});

},
'dojox/mobile/TransitionEvent':function(){
define(["dojo/_base/declare", "dojo/on"], function(declare, on){

	return declare("dojox.mobile.TransitionEvent", null, {
		// summary:
		//		A class used to trigger view transitions.
		
		constructor: function(/*DomNode*/target, /*Object*/transitionOptions, /*Event?*/triggerEvent){
			// summary:
			//		Creates a transition event.
			// target:
			//		The DOM node that initiates the transition (for example a ListItem).
			// transitionOptions:
			//		Contains the transition options.
			// triggerEvent:
			//		The event that triggered the transition (for example a touch event on a ListItem).
			this.transitionOptions = transitionOptions;
			this.target = target;
			this.triggerEvent = triggerEvent||null;
		},

		dispatch: function(){
			// summary:
			//		Dispatches this transition event. Emits a "startTransition" event on the target.
			var opts = {bubbles:true, cancelable:true, detail: this.transitionOptions, triggerEvent: this.triggerEvent};	
			var evt = on.emit(this.target,"startTransition", opts);
		}
	});
});

},
'dojox/mobile/viewRegistry':function(){
define([
	"dojo/_base/array",
	"dojo/dom-class",
	"dijit/registry"
], function(array, domClass, registry){

	// module:
	//		dojox/mobile/viewRegistry

	var viewRegistry = {
		// summary:
		//		A registry of existing views.

		// length: Number
		//		The number of registered views.
		length: 0,
		
		// hash: [private] Object
		//		The object used to register views.
		hash: {},
		
		// initialView: [private] dojox/mobile/View
		//		The initial view.
		initialView: null,

		add: function(/*dojox/mobile/View*/ view){
			// summary:
			//		Adds a view to the registry.
			this.hash[view.id] = view;
			this.length++;
		},

		remove: function(/*String*/ id){
			// summary:
			//		Removes a view from the registry.
			if(this.hash[id]){
				delete this.hash[id];
				this.length--;
			}
		},

		getViews: function(){
			// summary:
			//		Gets all registered views.
			// returns: Array
			var arr = [];
			for(var i in this.hash){
				arr.push(this.hash[i]);
			}
			return arr;
		},

		getParentView: function(/*dojox/mobile/View*/ view){
			// summary:
			//		Gets the parent view of the specified view.
			// returns: dojox/mobile/View
			for(var v = view.getParent(); v; v = v.getParent()){
				if(domClass.contains(v.domNode, "mblView")){ return v; }
			}
			return null;
		},

		getChildViews: function(/*dojox/mobile/View*/ parent){
			// summary:
			//		Gets the children views of the specified view.
			// returns: Array
			return array.filter(this.getViews(), function(v){ return this.getParentView(v) === parent; }, this);
		},

		getEnclosingView: function(/*DomNode*/ node){
			// summary:
			//		Gets the view containing the specified DOM node.
			// returns: dojox/mobile/View
			for(var n = node; n && n.tagName !== "BODY"; n = n.parentNode){
				if(n.nodeType === 1 && domClass.contains(n, "mblView")){
					return registry.byNode(n);
				}
			}
			return null;
		},

		getEnclosingScrollable: function(/*DomNode*/ node){
			// summary:
			//		Gets the dojox/mobile/scrollable object containing the specified DOM node.
			// returns: dojox/mobile/scrollable
			for(var w = registry.getEnclosingWidget(node); w; w = w.getParent()){
				if(w.scrollableParams && w._v){ return w; }
			}
			return null;
		}
	};

	return viewRegistry;
});

},
'dojox/mobile/transition':function(){
define([
	"dojo/_base/Deferred",
	"dojo/_base/config"
], function(Deferred, config){
	/*=====
	return {
		// summary:
		//		This is the wrapper module which loads
		//		dojox/css3/transit conditionally. If mblCSS3Transition
		//		is set to 'dojox/css3/transit', it will be loaded as
		//		the module to conduct view transitions, otherwise this module returns null.
	};
	=====*/
	if(config.mblCSS3Transition){
		//require dojox/css3/transit and resolve it as the result of transitDeferred.
		var transitDeferred = new Deferred();
		require([config.mblCSS3Transition], function(transit){
			transitDeferred.resolve(transit);
		});
		return transitDeferred;
	}
	return null;
});

},
'dojox/mobile/Heading':function(){
define([
	"dojo/_base/array",
	"dojo/_base/connect",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/dom-attr",
	"dijit/registry",
	"./common",
	"dijit/_Contained",
	"dijit/_Container",
	"dijit/_WidgetBase",
	"./ProgressIndicator",
	"./ToolBarButton",
	"./View",
	"dojo/has",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/Heading"
], function(array, connect, declare, lang, win, domClass, domConstruct, domStyle, domAttr, registry, common, Contained, Container, WidgetBase, ProgressIndicator, ToolBarButton, View, has, BidiHeading){

	// module:
	//		dojox/mobile/Heading

	var dm = lang.getObject("dojox.mobile", true);

	var Heading = declare(has("dojo-bidi") ? "dojox.mobile.NonBidiHeading" : "dojox.mobile.Heading", [WidgetBase, Container, Contained],{
		// summary:
		//		A widget that represents a navigation bar.
		// description:
		//		Heading is a widget that represents a navigation bar, which
		//		usually appears at the top of an application. It usually
		//		displays the title of the current view and can contain a
		//		navigational control. If you use it with
		//		dojox/mobile/ScrollableView, it can also be used as a fixed
		//		header bar or a fixed footer bar. In such cases, specify the
		//		fixed="top" attribute to be a fixed header bar or the
		//		fixed="bottom" attribute to be a fixed footer bar. Heading can
		//		have one or more ToolBarButton widgets as its children.

		// back: String
		//		A label for the navigational control to return to the previous View.
		back: "",

		// href: String
		//		A URL to open when the navigational control is pressed.
		href: "",

		// moveTo: String
		//		The id of the transition destination of the navigation control.
		//		If the value has a hash sign ('#') before the id (e.g. #view1)
		//		and the dojox/mobile/bookmarkable module is loaded by the user application,
		//		the view transition updates the hash in the browser URL so that the
		//		user can bookmark the destination view. In this case, the user
		//		can also use the browser's back/forward button to navigate
		//		through the views in the browser history.
		//
		//		If null, transitions to a blank view.
		//		If '#', returns immediately without transition.
		moveTo: "",

		// transition: String
		//		A type of animated transition effect. You can choose from the
		//		standard transition types, "slide", "fade", "flip", or from the
		//		extended transition types, "cover", "coverv", "dissolve",
		//		"reveal", "revealv", "scaleIn", "scaleOut", "slidev",
		//		"swirl", "zoomIn", "zoomOut", "cube", and "swap". If "none" is
		//		specified, transition occurs immediately without animation.
		transition: "slide",

		// label: String
		//		A title text of the heading. If the label is not specified, the
		//		innerHTML of the node is used as a label.
		label: "",

		// iconBase: String
		//		The default icon path for child items.
		iconBase: "",

		// tag: String
		//		A name of HTML tag to create as domNode.
		tag: "h1",

		// busy: Boolean
		//		If true, a progress indicator spins on this widget.
		busy: false,

		// progStyle: String
		//		A css class name to add to the progress indicator.
		progStyle: "mblProgWhite",

		/* internal properties */
		
		// baseClass: String
		//		The name of the CSS class of this widget.	
		baseClass: "mblHeading",

		buildRendering: function(){
			if(!this.templateString){ // true if this widget is not templated
				// Create root node if it wasn't created by _TemplatedMixin
				this.domNode = this.containerNode = this.srcNodeRef || win.doc.createElement(this.tag);
			}
			this.inherited(arguments);
			
			if(!this.templateString){ // true if this widget is not templated
				if(!this.label){
					array.forEach(this.domNode.childNodes, function(n){
						if(n.nodeType == 3){
							var v = lang.trim(n.nodeValue);
							if(v){
								this.label = v;
								this.labelNode = domConstruct.create("span", {innerHTML:v}, n, "replace");
							}
						}
					}, this);
				}
				if(!this.labelNode){
					this.labelNode = domConstruct.create("span", null, this.domNode);
				}
				this.labelNode.className = "mblHeadingSpanTitle";
				this.labelDivNode = domConstruct.create("div", {
					className: "mblHeadingDivTitle",
					innerHTML: this.labelNode.innerHTML
				}, this.domNode);
			}

			if(this.labelDivNode){
				domAttr.set(this.labelDivNode, "role", "heading"); //a11y
				domAttr.set(this.labelDivNode, "aria-level", "1");
			}

			common.setSelectable(this.domNode, false);
		},

		startup: function(){
			if(this._started){ return; }
			var parent = this.getParent && this.getParent();
			if(!parent || !parent.resize){ // top level widget
				var _this = this;
				_this.defer(function(){ // necessary to render correctly
					_this.resize();
				});
			}
			this.inherited(arguments);
		},

		resize: function(){
			if(this.labelNode){
				// find the rightmost left button (B), and leftmost right button (C)
				// +-----------------------------+
				// | |A| |B|             |C| |D| |
				// +-----------------------------+
				var leftBtn, rightBtn;
				var children = this.containerNode.childNodes;
				for(var i = children.length - 1; i >= 0; i--){
					var c = children[i];
					if(c.nodeType === 1 && domStyle.get(c, "display") !== "none"){
						if(!rightBtn && domStyle.get(c, "float") === "right"){
							rightBtn = c;
						}
						if(!leftBtn && domStyle.get(c, "float") === "left"){
							leftBtn = c;
						}
					}
				}

				if(!this.labelNodeLen && this.label){
					this.labelNode.style.display = "inline";
					this.labelNodeLen = this.labelNode.offsetWidth;
					this.labelNode.style.display = "";
				}

				var bw = this.domNode.offsetWidth; // bar width
				var rw = rightBtn ? bw - rightBtn.offsetLeft + 5 : 0; // rightBtn width
				var lw = leftBtn ? leftBtn.offsetLeft + leftBtn.offsetWidth + 5 : 0; // leftBtn width
				var tw = this.labelNodeLen || 0; // title width
				domClass[bw - Math.max(rw,lw)*2 > tw ? "add" : "remove"](this.domNode, "mblHeadingCenterTitle");
			}
			array.forEach(this.getChildren(), function(child){
				if(child.resize){ child.resize(); }
			});
		},

		_setBackAttr: function(/*String*/back){
			// tags:
			//		private
			this._set("back", back);
			if(!this.backButton){
				this.backButton = new ToolBarButton({
					arrow: "left",
					label: back,
					moveTo: this.moveTo,
					back: !this.moveTo && !this.href, // use browser history unless moveTo or href
					href: this.href,
					transition: this.transition,
					transitionDir: -1,
					dir: this.isLeftToRight() ? "ltr" : "rtl"
				});
				this.backButton.placeAt(this.domNode, "first");
			}else{
				this.backButton.set("label", back);
			}
			this.resize();
		},
		
		_setMoveToAttr: function(/*String*/moveTo){
			// tags:
			//		private
			this._set("moveTo", moveTo);
			if(this.backButton){
				this.backButton.set("moveTo", moveTo);
				this.backButton.set("back", !moveTo && !this.href);
			}
		},
		
		_setHrefAttr: function(/*String*/href){
			// tags:
			//		private
			this._set("href", href);
			if(this.backButton){
				this.backButton.set("href", href);
				this.backButton.set("back", !this.moveTo && !href);
			}
		},
		
		_setTransitionAttr: function(/*String*/transition){
			// tags:
			//		private
			this._set("transition", transition);
			if(this.backButton){
				this.backButton.set("transition", transition);
			}
		},
		
		_setLabelAttr: function(/*String*/label){
			// tags:
			//		private
			this._set("label", label);
			this.labelNode.innerHTML = this.labelDivNode.innerHTML = this._cv ? this._cv(label) : label;
			delete this.labelNodeLen;
		},

		_setBusyAttr: function(/*Boolean*/busy){
			// tags:
			//		private
			var prog = this._prog;
			if(busy){
				if(!prog){
					prog = this._prog = new ProgressIndicator({size:30, center:false});
					domClass.add(prog.domNode, this.progStyle);
				}
				domConstruct.place(prog.domNode, this.domNode, "first");
				prog.start();
			}else if(prog){
				prog.stop();
			}
			this._set("busy", busy);
		}	
	});

	return has("dojo-bidi") ? declare("dojox.mobile.Heading", [Heading, BidiHeading]) : Heading;
});

},
'dojox/mobile/ToolBarButton':function(){
define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/dom-attr",
	"./sniff",
	"./_ItemBase",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/ToolBarButton"
], function(declare, lang, win, domClass, domConstruct, domStyle, domAttr, has, ItemBase, BidiToolBarButton){

	// module:
	//		dojox/mobile/ToolBarButton

	var ToolBarButton = declare(has("dojo-bidi") ? "dojox.mobile.NonBidiToolBarButton" : "dojox.mobile.ToolBarButton", ItemBase, {
		// summary:
		//		A button widget which is placed in the Heading widget.
		// description:
		//		ToolBarButton is a button which is typically placed in the
		//		Heading widget. It is a subclass of dojox/mobile/_ItemBase just
		//		like ListItem or IconItem. So, unlike Button, it has basically
		//		the same capability as ListItem or IconItem, such as icon
		//		support, transition, etc.

		// selected: Boolean
		//		If true, the button is in the selected state.
		selected: false,

		// arrow: [const] String
		//		Specifies "right" or "left" to be an arrow button.
		//		Note that changing the value of the property after the widget 
		//		creation has no effect.
		arrow: "",

		// light: [const] Boolean
		//		If true, this widget produces only a single `<span>` node when it
		//		has only an icon or only a label, and has no arrow. In that
		//		case, you cannot have both icon and label, or arrow even if you
		//		try to set them.
		//		Note that changing the value of the property after the widget 
		//		creation has no effect.
		light: true,

		// defaultColor: String
		//		CSS class for the default color.
		//		Note: If this button has an arrow (typically back buttons on iOS),
		//		the class selector used for it is the value of defaultColor + "45".
		//		For example, by default the arrow selector is "mblColorDefault45".
		defaultColor: "mblColorDefault",

		// selColor: String
		//		CSS class for the selected color.
		//		Note: If this button has an arrow (typically back buttons on iOS),
		//		the class selector used for it is the value of selColor + "45".
		//		For example, by default the selected arrow selector is "mblColorDefaultSel45".
		selColor: "mblColorDefaultSel",

		/* internal properties */
		baseClass: "mblToolBarButton",

		_selStartMethod: "touch",
		_selEndMethod: "touch",

		buildRendering: function(){
			if(!this.label && this.srcNodeRef){
				this.label = this.srcNodeRef.innerHTML;
			}
			this.label = lang.trim(this.label);
			this.domNode = (this.srcNodeRef && this.srcNodeRef.tagName === "SPAN") ?
				this.srcNodeRef : domConstruct.create("span");
			domAttr.set(this.domNode, "role", "button");
			this.inherited(arguments);

			if(this.light && !this.arrow && (!this.icon || !this.label)){
				this.labelNode = this.tableNode = this.bodyNode = this.iconParentNode = this.domNode;
				domClass.add(this.domNode, this.defaultColor + " mblToolBarButtonBody" +
							 (this.icon ? " mblToolBarButtonLightIcon" : " mblToolBarButtonLightText"));
				return;
			}

			this.domNode.innerHTML = "";
			if(this.arrow === "left" || this.arrow === "right"){
				this.arrowNode = domConstruct.create("span", {
					className: "mblToolBarButtonArrow mblToolBarButton" +
					(this.arrow === "left" ? "Left" : "Right") + "Arrow " +
					(has("ie") < 10 ? "" : (this.defaultColor + " " + this.defaultColor + "45"))
				}, this.domNode);
				domClass.add(this.domNode, "mblToolBarButtonHas" +
					(this.arrow === "left" ? "Left" : "Right") + "Arrow");
			}
			this.bodyNode = domConstruct.create("span", {className:"mblToolBarButtonBody"}, this.domNode);
			this.tableNode = domConstruct.create("table", {cellPadding:"0",cellSpacing:"0",border:"0",role:"presentation"}, this.bodyNode);
			if(!this.label && this.arrow){
				// The class mblToolBarButtonText is needed for arrow shape too.
				// If the button has a label, the class is set by _setLabelAttr. If no label, do it here.
				this.tableNode.className = "mblToolBarButtonText";
			}

			var row = this.tableNode.insertRow(-1);
			this.iconParentNode = row.insertCell(-1);
			this.labelNode = row.insertCell(-1);
			this.iconParentNode.className = "mblToolBarButtonIcon";
			this.labelNode.className = "mblToolBarButtonLabel";

			if(this.icon && this.icon !== "none" && this.label){
				domClass.add(this.domNode, "mblToolBarButtonHasIcon");
				domClass.add(this.bodyNode, "mblToolBarButtonLabeledIcon");
			}

			domClass.add(this.bodyNode, this.defaultColor);
		},

		startup: function(){
			if(this._started){ return; }

			this.connect(this.domNode, "onkeydown", "_onClick"); // for desktop browsers

			this.inherited(arguments);
			if(!this._isOnLine){
				this._isOnLine = true;
				// retry applying the attribute for which the custom setter delays the actual 
				// work until _isOnLine is true. 
				this.set("icon", this._pendingIcon !== undefined ? this._pendingIcon : this.icon);
				// Not needed anymore (this code executes only once per life cycle):
				delete this._pendingIcon; 
			}
		},

		_onClick: function(e){
			// summary:
			//		Internal handler for click events.
			// tags:
			//		private
			if(e && e.type === "keydown" && e.keyCode !== 13){ return; }
			if(this.onClick(e) === false){ return; } // user's click action
			this.defaultClickAction(e);
		},

		onClick: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		User defined function to handle clicks
			// tags:
			//		callback
		},

		_setLabelAttr: function(/*String*/text){
			// summary:
			//		Sets the button label text.
			this.inherited(arguments);
			domClass.toggle(this.tableNode, "mblToolBarButtonText", text || this.arrow); // also needed if only arrow
		},

		_setSelectedAttr: function(/*Boolean*/selected){
			// summary:
			//		Makes this widget in the selected or unselected state.
			var replace = function(node, a, b){
				domClass.replace(node, a + " " + a + "45", b + " " + b + "45");
			};
			this.inherited(arguments);
			if(selected){
				domClass.replace(this.bodyNode, this.selColor, this.defaultColor);
				if(!(has("ie") < 10) && this.arrowNode){
					replace(this.arrowNode, this.selColor, this.defaultColor);
				}
			}else{
				domClass.replace(this.bodyNode, this.defaultColor, this.selColor);
				if(!(has("ie") < 10) && this.arrowNode){
					replace(this.arrowNode, this.defaultColor, this.selColor);
				}
			}
			domClass.toggle(this.domNode, "mblToolBarButtonSelected", selected);
			domClass.toggle(this.bodyNode, "mblToolBarButtonBodySelected", selected);
		}
	});
	return has("dojo-bidi") ? declare("dojox.mobile.ToolBarButton", [ToolBarButton, BidiToolBarButton]) : ToolBarButton;
});

},
'dojox/mobile/_ItemBase':function(){
define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/dom-class",
	"dojo/touch",
	"dijit/registry",
	"dijit/_Contained",
	"dijit/_Container",
	"dijit/_WidgetBase",
	"./TransitionEvent",
	"./iconUtils",
	"./sniff",
	"./viewRegistry",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/_ItemBase"
], function(array, declare, lang, win, domClass, touch, registry, Contained, Container, 
	WidgetBase, TransitionEvent, iconUtils, has, viewRegistry, BidiItemBase){

	// module:
	//		dojox/mobile/_ItemBase

	var _ItemBase = declare(has("dojo-bidi") ? "dojox.mobile._NonBidiItemBase" : "dojox.mobile._ItemBase", [WidgetBase, Container, Contained], {
		// summary:
		//		A base class for item classes (e.g. ListItem, IconItem, etc.).
		// description:
		//		_ItemBase is a base class for widgets that have capability to
		//		make a view transition when clicked.

		// icon: String
		//		An icon image to display. The value can be either a path for an
		//		image file or a class name of a DOM button. If icon is not
		//		specified, the iconBase parameter of the parent widget is used.
		icon: "",

		// iconPos: String
		//		The position of an aggregated icon. IconPos is comma separated
		//		values like top,left,width,height (ex. "0,0,29,29"). If iconPos
		//		is not specified, the iconPos parameter of the parent widget is
		//		used.
		iconPos: "", // top,left,width,height (ex. "0,0,29,29")

		// alt: String
		//		An alternate text for the icon image.
		alt: "",

		// href: String
		//		A URL of another web page to go to.
		href: "",

		// hrefTarget: String
		//		A target that specifies where to open a page specified by
		//		href. The value will be passed to the 2nd argument of
		//		window.open().
		hrefTarget: "",

		// moveTo: String
		//		The id of the transition destination view which resides in the
		//		current page.
		//
		//		If the value has a hash sign ('#') before the id (e.g. #view1)
		//		and the dojo/hash module is loaded by the user application, the
		//		view transition updates the hash in the browser URL so that the
		//		user can bookmark the destination view. In this case, the user
		//		can also use the browser's back/forward button to navigate
		//		through the views in the browser history.
		//
		//		If null, transitions to a blank view.
		//		If '#', returns immediately without transition.
		moveTo: "",

		// scene: String
		//		The name of a scene. Used from dojox/mobile/app.
		scene: "",

		// clickable: Boolean
		//		If true, this item becomes clickable even if a transition
		//		destination (moveTo, etc.) is not specified.
		clickable: false,

		// url: String
		//		A URL of an html fragment page or JSON data that represents a
		//		new view content. The view content is loaded with XHR and
		//		inserted in the current page. Then a view transition occurs to
		//		the newly created view. The view is cached so that subsequent
		//		requests would not load the content again.
		url: "",

		// urlTarget: String
		//		Node id under which a new view will be created according to the
		//		url parameter. If not specified, The new view will be created as
		//		a sibling of the current view.
		urlTarget: "",

		// back: Boolean
		//		If true, history.back() is called when clicked.
		back: false,

		// transition: String
		//		A type of animated transition effect. You can choose from the
		//		standard transition types, "slide", "fade", "flip", or from the
		//		extended transition types, "cover", "coverv", "dissolve",
		//		"reveal", "revealv", "scaleIn", "scaleOut", "slidev",
		//		"swirl", "zoomIn", "zoomOut", "cube", and "swap". If "none" is
		//		specified, transition occurs immediately without animation.
		transition: "",

		// transitionDir: Number
		//		The transition direction. If 1, transition forward. If -1,
		//		transition backward. For example, the slide transition slides
		//		the view from right to left when dir == 1, and from left to
		//		right when dir == -1.
		transitionDir: 1,

		// transitionOptions: Object
		//		A hash object that holds transition options.
		transitionOptions: null,

		// callback: Function|String
		//		A callback function that is called when the transition has been
		//		finished. A function reference, or name of a function in
		//		context.
		callback: null,

		// label: String
		//		A label of the item. If the label is not specified, innerHTML is
		//		used as a label.
		label: "",

		// toggle: Boolean
		//		If true, the item acts like a toggle button.
		toggle: false,

		// selected: Boolean
		//		If true, the item is highlighted to indicate it is selected.
		selected: false,

		// tabIndex: String
		//		Tabindex setting for the item so users can hit the tab key to
		//		focus on it.
		tabIndex: "0",
		
		// _setTabIndexAttr: [private] String
		//		Sets tabIndex to domNode.
		_setTabIndexAttr: "",

		/* internal properties */	

		// paramsToInherit: String
		//		Comma separated parameters to inherit from the parent.
		paramsToInherit: "transition,icon",

		// _selStartMethod: String
		//		Specifies how the item enters the selected state.
		//
		//		- "touch": Use touch events to enter the selected state.
		//		- "none": Do not change the selected state.
		_selStartMethod: "none", // touch or none

		// _selEndMethod: String
		//		Specifies how the item leaves the selected state.
		//
		//		- "touch": Use touch events to leave the selected state.
		//		- "timer": Use setTimeout to leave the selected state.
		//		- "none": Do not change the selected state.
		_selEndMethod: "none", // touch, timer, or none

		// _delayedSelection: Boolean
		//		If true, selection is delayed 100ms and canceled if dragged in
		//		order to avoid selection when flick operation is performed.
		_delayedSelection: false,

		// _duration: Number
		//		Duration of selection, milliseconds.
		_duration: 800,

		// _handleClick: Boolean
		//		If true, this widget listens to touch events.
		_handleClick: true,

		buildRendering: function(){
			this.inherited(arguments);
			this._isOnLine = this.inheritParams();
		},

		startup: function(){
			if(this._started){ return; }
			if(!this._isOnLine){
				this.inheritParams();
			}
			this._updateHandles();
			this.inherited(arguments);
		},

		inheritParams: function(){
			// summary:
			//		Copies from the parent the values of parameters specified 
			//		by the property paramsToInherit.
			var parent = this.getParent();
			if(parent){
				array.forEach(this.paramsToInherit.split(/,/), function(p){
					if(p.match(/icon/i)){
						var base = p + "Base", pos = p + "Pos";
						if(this[p] && parent[base] &&
							parent[base].charAt(parent[base].length - 1) === '/'){
							this[p] = parent[base] + this[p];
						}
						if(!this[p]){ this[p] = parent[base]; }
						if(!this[pos]){ this[pos] = parent[pos]; }
					}
					if(!this[p]){ this[p] = parent[p]; }
				}, this);
			}
			return !!parent;
		},

		_updateHandles: function(){
			// tags:
			//		private
			if(this._handleClick && this._selStartMethod === "touch"){
				if(!this._onTouchStartHandle){
					this._onTouchStartHandle = this.connect(this.domNode, touch.press, "_onTouchStart");
				}
			}else{
				if(this._onTouchStartHandle){
					this.disconnect(this._onTouchStartHandle);
					this._onTouchStartHandle = null;
				}
			}
		},
		
		getTransOpts: function(){
			// summary:
			//		Copies from the parent and returns the values of parameters  
			//		specified by the property paramsToInherit.
			var opts = this.transitionOptions || {};
			array.forEach(["moveTo", "href", "hrefTarget", "url", "target",
				"urlTarget", "scene", "transition", "transitionDir"], function(p){
				opts[p] = opts[p] || this[p];
			}, this);
			return opts; // Object
		},

		userClickAction: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		User-defined click action.
		},

		defaultClickAction: function(/*Event*/e){
			// summary:
			//		The default action of this item.
			this.handleSelection(e);
			if(this.userClickAction(e) === false){ return; } // user's click action
			this.makeTransition(e);
		},

		handleSelection: function(/*Event*/e){
			// summary:
			//		Handles this items selection state.

			// Before transitioning, we want the visual effect of selecting the item.
			// To ensure this effect happens even if _delayedSelection is true:
			if(this._delayedSelection){
				this.set("selected", true);
			} // the item will be deselected after transition.

			if(this._onTouchEndHandle){
				this.disconnect(this._onTouchEndHandle);
				this._onTouchEndHandle = null;
			}

			var p = this.getParent();
			if(this.toggle){
				this.set("selected", !this._currentSel);
			}else if(p && p.selectOne){
				this.set("selected", true);
			}else{
				if(this._selEndMethod === "touch"){
					this.set("selected", false);
				}else if(this._selEndMethod === "timer"){
					this.defer(function(){
						this.set("selected", false);
					}, this._duration);
				}
			}
		},

		makeTransition: function(/*Event*/e){
			// summary:
			//		Makes a transition.
			if(this.back && history){
				history.back();	
				return;
			}	
			if (this.href && this.hrefTarget && this.hrefTarget != "_self") {
				win.global.open(this.href, this.hrefTarget || "_blank");
				this._onNewWindowOpened(e);
				return;
			}
			var opts = this.getTransOpts();
			var doTransition = 
				!!(opts.moveTo || opts.href || opts.url || opts.target || opts.scene);
			if(this._prepareForTransition(e, doTransition ? opts : null) === false){ return; }
			if(doTransition){
				this.setTransitionPos(e);
				new TransitionEvent(this.domNode, opts, e).dispatch();
			}
		},

		_onNewWindowOpened: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		Subclasses may want to implement it.
		},

		_prepareForTransition: function(/*Event*/e, /*Object*/transOpts){
			// summary:
			//		Subclasses may want to implement it.
		},

		_onTouchStart: function(e){
			// tags:
			//		private
			if(this.getParent().isEditing || this.onTouchStart(e) === false){ return; } // user's touchStart action
			var enclosingScrollable = viewRegistry.getEnclosingScrollable(this.domNode);
			if(enclosingScrollable &&
				domClass.contains(enclosingScrollable.containerNode, "mblScrollableScrollTo2")){
				// #17165: do not select the item during scroll animation
				return;
			}
			if(!this._onTouchEndHandle && this._selStartMethod === "touch"){
				// Connect to the entire window. Otherwise, fail to receive
				// events if operation is performed outside this widget.
				// Expose both connect handlers in case the user has interest.
				this._onTouchMoveHandle = this.connect(win.body(), touch.move, "_onTouchMove");
				this._onTouchEndHandle = this.connect(win.body(), touch.release, "_onTouchEnd");
			}
			this.touchStartX = e.touches ? e.touches[0].pageX : e.clientX;
			this.touchStartY = e.touches ? e.touches[0].pageY : e.clientY;
			this._currentSel = this.selected;

			if(this._delayedSelection){
				// so as not to make selection when the user flicks on ScrollableView
				this._selTimer = this.defer(function(){
					this.set("selected", true);
				}, 100);
			}else{
				this.set("selected", true);
			}
		},

		onTouchStart: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		User-defined function to handle touchStart events.
			// tags:
			//		callback
		},

		_onTouchMove: function(e){
			// tags:
			//		private
			var x = e.touches ? e.touches[0].pageX : e.clientX;
			var y = e.touches ? e.touches[0].pageY : e.clientY;
			if(Math.abs(x - this.touchStartX) >= 4 ||
			   Math.abs(y - this.touchStartY) >= 4){ // dojox/mobile/scrollable.threshold
				this.cancel();
				var p = this.getParent();
				if(p && p.selectOne){
					this._prevSel && this._prevSel.set("selected", true);
				}else{
					this.set("selected", false);
				}
			}
		},

		_disconnect: function(){
			// tags:
			//		private
			this.disconnect(this._onTouchMoveHandle);
			this.disconnect(this._onTouchEndHandle);
			this._onTouchMoveHandle = this._onTouchEndHandle = null;
		},

		cancel: function(){
			// summary:
			//		Cancels an ongoing selection (if any).
			if(this._selTimer){
				this._selTimer.remove(); 
				this._selTimer = null;
			}
			this._disconnect();
		},

		_onTouchEnd: function(e){
			// tags:
			//		private
			if(!this._selTimer && this._delayedSelection){ return; }
			this.cancel();
			this._onClick(e);
		},

		setTransitionPos: function(e){
			// summary:
			//		Stores the clicked position for later use.
			// description:
			//		Some of the transition animations (e.g. ScaleIn) need the
			//		clicked position.
			var w = this;
			while(true){
				w = w.getParent();
				if(!w || domClass.contains(w.domNode, "mblView")){ break; }
			}
			if(w){
				w.clickedPosX = e.clientX;
				w.clickedPosY = e.clientY;
			}
		},

		transitionTo: function(/*String|Object*/moveTo, /*String*/href, /*String*/url, /*String*/scene){
			// summary:
			//		Performs a view transition.
			// description:
			//		Given a transition destination, this method performs a view
			//		transition. This method is typically called when this item
			//		is clicked.
			var opts = (moveTo && typeof(moveTo) === "object") ? moveTo :
				{moveTo: moveTo, href: href, url: url, scene: scene,
				 transition: this.transition, transitionDir: this.transitionDir};
			new TransitionEvent(this.domNode, opts).dispatch();
		},

		_setIconAttr: function(icon){
			// tags:
			//		private
			if(!this._isOnLine){
				// record the value to be able to reapply it (see the code in the startup method)
				this._pendingIcon = icon;  
				return; 
			} // icon may be invalid because inheritParams is not called yet
			this._set("icon", icon);
			this.iconNode = iconUtils.setIcon(icon, this.iconPos, this.iconNode, this.alt, this.iconParentNode, this.refNode, this.position);
		},

		_setLabelAttr: function(/*String*/text){
			// tags:
			//		private
			this._set("label", text);
			this.labelNode.innerHTML = this._cv ? this._cv(text) : text;
		},

		_setSelectedAttr: function(/*Boolean*/selected){
			// summary:
			//		Makes this widget in the selected or unselected state.
			// description:
			//		Subclass should override.
			// tags:
			//		private
			if(selected){
				var p = this.getParent();
				if(p && p.selectOne){
					// deselect the currently selected item
					var arr = array.filter(p.getChildren(), function(w){
						return w.selected;
					});
					array.forEach(arr, function(c){
						this._prevSel = c;
						c.set("selected", false);
					}, this);
				}
			}
			this._set("selected", selected);
		}
	});
	return has("dojo-bidi") ? declare("dojox.mobile._ItemBase", [_ItemBase, BidiItemBase]) : _ItemBase;
});

},
'dojox/mobile/iconUtils':function(){
define([
	"dojo/_base/array",
	"dojo/_base/config",
	"dojo/_base/connect",
	"dojo/_base/event",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"./sniff"
], function(array, config, connect, event, lang, win, domClass, domConstruct, domStyle, has){

	var dm = lang.getObject("dojox.mobile", true);

	// module:
	//		dojox/mobile/iconUtils

	var IconUtils = function(){
		// summary:
		//		Utilities to create an icon (image, CSS sprite image, or DOM Button).

		this.setupSpriteIcon = function(/*DomNode*/iconNode, /*String*/iconPos){
			// summary:
			//		Sets up CSS sprite for a foreground image.
			if(iconNode && iconPos){
				var arr = array.map(iconPos.split(/[ ,]/),function(item){return item-0});
				var t = arr[0]; // top
				var r = arr[1] + arr[2]; // right
				var b = arr[0] + arr[3]; // bottom
				var l = arr[1]; // left
				domStyle.set(iconNode, {
					position: "absolute",
					clip: "rect("+t+"px "+r+"px "+b+"px "+l+"px)",
					top: (iconNode.parentNode ? domStyle.get(iconNode, "top") : 0) - t + "px",
					left: -l + "px"
				});
				domClass.add(iconNode, "mblSpriteIcon");
			}
		};

		this.createDomButton = function(/*DomNode*/refNode, /*Object?*/style, /*DomNode?*/toNode){
			// summary:
			//		Creates a DOM button.
			// description:
			//		DOM button is a simple graphical object that consists of one or
			//		more nested DIV elements with some CSS styling. It can be used
			//		in place of an icon image on ListItem, IconItem, and so on.
			//		The kind of DOM button to create is given as a class name of
			//		refNode. The number of DIVs to create is searched from the style
			//		sheets in the page. However, if the class name has a suffix that
			//		starts with an underscore, like mblDomButtonGoldStar_5, then the
			//		suffixed number is used instead. A class name for DOM button
			//		must starts with 'mblDomButton'.
			// refNode:
			//		A node that has a DOM button class name.
			// style:
			//		A hash object to set styles to the node.
			// toNode:
			//		A root node to create a DOM button. If omitted, refNode is used.

			if(!this._domButtons){
				if(has("webkit")){
					var findDomButtons = function(sheet, dic){
						// summary:
						//		Searches the style sheets for DOM buttons.
						// description:
						//		Returns a key-value pair object whose keys are DOM
						//		button class names and values are the number of DOM
						//		elements they need.
						var i, j;
						if(!sheet){
							var _dic = {};
							var ss = win.doc.styleSheets;
							for (i = 0; i < ss.length; i++){
								ss[i] && findDomButtons(ss[i], _dic);
							}
							return _dic;
						}
						var rules = sheet.cssRules || [];
						for (i = 0; i < rules.length; i++){
							var rule = rules[i];
							if(rule.href && rule.styleSheet){
								findDomButtons(rule.styleSheet, dic);
							}else if(rule.selectorText){
								var sels = rule.selectorText.split(/,/);
								for (j = 0; j < sels.length; j++){
									var sel = sels[j];
									var n = sel.split(/>/).length - 1;
									if(sel.match(/(mblDomButton\w+)/)){
										var cls = RegExp.$1;
										if(!dic[cls] || n > dic[cls]){
											dic[cls] = n;
										}
									}
								}
							}
						}
						return dic;
					};
					this._domButtons = findDomButtons();
				}else{
					this._domButtons = {};
				}
			}

			var s = refNode.className;
			var node = toNode || refNode;
			if(s.match(/(mblDomButton\w+)/) && s.indexOf("/") === -1){
				var btnClass = RegExp.$1;
				var nDiv = 4;
				if(s.match(/(mblDomButton\w+_(\d+))/)){
					nDiv = RegExp.$2 - 0;
				}else if(this._domButtons[btnClass] !== undefined){
					nDiv = this._domButtons[btnClass];
				}
				var props = null;
				if(has("bb") && config.mblBBBoxShadowWorkaround !== false){
					// Removes box-shadow because BlackBerry incorrectly renders it.
					props = {style:"-webkit-box-shadow:none"};
				}
				for(var i = 0, p = node; i < nDiv; i++){
					p = p.firstChild || domConstruct.create("div", props, p);
				}
				if(toNode){
					setTimeout(function(){
						domClass.remove(refNode, btnClass);
					}, 0);
					domClass.add(toNode, btnClass);
				}
			}else if(s.indexOf(".") !== -1){ // file name
				domConstruct.create("img", {src:s}, node);
			}else{
				return null;
			}
			domClass.add(node, "mblDomButton");
			!!style && domStyle.set(node, style);
			return node;
		};

		this.createIcon = function(/*String*/icon, /*String?*/iconPos, /*DomNode?*/node, /*String?*/title, /*DomNode?*/parent, /*DomNode?*/refNode, /*String?*/pos){
			// summary:
			//		Creates or updates an icon node
			// description:
			//		If node exists, updates the existing node. Otherwise, creates a new one.
			// icon:
			//		Path for an image, or DOM button class name.
			title = title || "";
			if(icon && icon.indexOf("mblDomButton") === 0){
				// DOM button
				if(!node){
					node = domConstruct.create("div", null, refNode || parent, pos);
				}else{
					if(node.className.match(/(mblDomButton\w+)/)){
						domClass.remove(node, RegExp.$1);
					}
				}
				node.title = title;
				domClass.add(node, icon);
				this.createDomButton(node);
			}else if(icon && icon !== "none"){
				// Image
				if(!node || node.nodeName !== "IMG"){
					node = domConstruct.create("img", {
						alt: title
					}, refNode || parent, pos);
				}
				node.src = (icon || "").replace("${theme}", dm.currentTheme);
				this.setupSpriteIcon(node, iconPos);
				if(iconPos && parent){
					var arr = iconPos.split(/[ ,]/);
					domStyle.set(parent, {
						position: "relative",
						width: arr[2] + "px",
						height: arr[3] + "px"
					});
					domClass.add(parent, "mblSpriteIconParent");
				}
				connect.connect(node, "ondragstart", event, "stop");
			}
			return node;
		};

		this.iconWrapper = false;
		this.setIcon = function(/*String*/icon, /*String*/iconPos, /*DomNode*/iconNode, /*String?*/alt, /*DomNode*/parent, /*DomNode?*/refNode, /*String?*/pos){
			// summary:
			//		A setter function to set an icon.
			// description:
			//		This function is intended to be used by icon setters (e.g. _setIconAttr)
			// icon:
			//		An icon path or a DOM button class name.
			// iconPos:
			//		The position of an aggregated icon. IconPos is comma separated
			//		values like top,left,width,height (ex. "0,0,29,29").
			// iconNode:
			//		An icon node.
			// alt:
			//		An alt text for the icon image.
			// parent:
			//		Parent node of the icon.
			// refNode:
			//		A node reference to place the icon.
			// pos:
			//		The position of the icon relative to refNode.
			if(!parent || !icon && !iconNode){ return null; }
			if(icon && icon !== "none"){ // create or update an icon
				if(!this.iconWrapper && icon.indexOf("mblDomButton") !== 0 && !iconPos){ // image
					if(iconNode && iconNode.tagName === "DIV"){
						domConstruct.destroy(iconNode);
						iconNode = null;
					}
					iconNode = this.createIcon(icon, null, iconNode, alt, parent, refNode, pos);
					domClass.add(iconNode, "mblImageIcon");
				}else{ // sprite or DOM button
					if(iconNode && iconNode.tagName === "IMG"){
						domConstruct.destroy(iconNode);
						iconNode = null;
					}
					iconNode && domConstruct.empty(iconNode);
					if(!iconNode){
						iconNode = domConstruct.create("div", null, refNode || parent, pos);
					}
					this.createIcon(icon, iconPos, null, null, iconNode);
					if(alt){
						iconNode.title = alt;
					}
				}
				domClass.remove(parent, "mblNoIcon");
				return iconNode;
			}else{ // clear the icon
				domConstruct.destroy(iconNode);
				domClass.add(parent, "mblNoIcon");
				return null;
			}
		};
	};

	// Return singleton.  (TODO: can we replace IconUtils class and singleton w/a simple hash of functions?)
	return new IconUtils();
});

},
'dojox/mobile/RoundRect':function(){
define([
	"dojo/_base/declare",
	"dojo/dom-class",
	"./Container"
], function(declare, domClass, Container){

	// module:
	//		dojox/mobile/RoundRect

	return declare("dojox.mobile.RoundRect", Container, {
		// summary:
		//		A simple round rectangle container.
		// description:
		//		RoundRect is a simple round rectangle container for any HTML
		//		and/or widgets. You can achieve the same appearance by just
		//		applying the -webkit-border-radius style to a div tag. However,
		//		if you use RoundRect, you can get a round rectangle even on
		//		non-CSS3 browsers such as (older) IE.

		// shadow: [const] Boolean
		//		If true, adds a shadow effect to the container element by adding
		//		the CSS class "mblShadow" to widget's domNode. The default value
		//		is false. Note that changing the value of the property after
		//		the widget creation has no effect.
		shadow: false,

		/* internal properties */	
		
		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblRoundRect",

		buildRendering: function(){
			this.inherited(arguments);
			if(this.shadow){
				domClass.add(this.domNode, "mblShadow");
			}
		}
	});
});

},
'dojox/mobile/Container':function(){
define([
	"dojo/_base/declare",
	"dijit/_Container",
	"./Pane"
], function(declare, Container, Pane){

	// module:
	//		dojox/mobile/Container

	return declare("dojox.mobile.Container", [Pane, Container], {
		// summary:
		//		A simple container-type widget.
		// description:
		//		Container is a simple general-purpose container widget.
		//		It is a widget, but can be regarded as a simple `<div>` element.

		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblContainer"
	});
});

},
'dojox/mobile/Pane':function(){
define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dijit/_Contained",
	"dijit/_WidgetBase"
], function(array, declare, Contained, WidgetBase){

	// module:
	//		dojox/mobile/Pane

	return declare("dojox.mobile.Pane", [WidgetBase, Contained], {
		// summary:
		//		A simple pane widget.
		// description:
		//		Pane is a simple general-purpose pane widget.
		//		It is a widget, but can be regarded as a simple `<div>` element.

		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblPane",

		buildRendering: function(){
			this.inherited(arguments);
			if(!this.containerNode){
				// set containerNode so that getChildren() works
				this.containerNode = this.domNode;
			}
		},

		resize: function(){
			// summary:
			//		Calls resize() of each child widget.
			array.forEach(this.getChildren(), function(child){
				if(child.resize){ child.resize(); }
			});
		}
	});
});

},
'dojox/mobile/RoundRectCategory':function(){
define([
	"dojo/_base/declare",
	"dojo/_base/window",
	"dojo/dom-construct",
	"dijit/_Contained",
	"dijit/_WidgetBase",
	"dojo/has",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/RoundRectCategory"
], function(declare, win, domConstruct, Contained, WidgetBase, has, BidiRoundRectCategory){

	// module:
	//		dojox/mobile/RoundRectCategory

	var RoundRectCategory = declare(has("dojo-bidi") ? "dojox.mobile.NonBidiRoundRectCategory" : "dojox.mobile.RoundRectCategory", [WidgetBase, Contained], {
		// summary:
		//		A category header for a rounded rectangle list.

		// label: String
		//		A label of the category. If the label is not specified,
		//		innerHTML is used as a label.
		label: "",

		// tag: String
		//		A name of html tag to create as domNode.
		tag: "h2",

		/* internal properties */	
		
		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblRoundRectCategory",

		buildRendering: function(){
			var domNode = this.domNode = this.containerNode = this.srcNodeRef || domConstruct.create(this.tag);
			this.inherited(arguments);
			if(!this.label && domNode.childNodes.length === 1 && domNode.firstChild.nodeType === 3){
				// if it has only one text node, regard it as a label
				this.label = domNode.firstChild.nodeValue;
			}
		},

		_setLabelAttr: function(/*String*/label){
			// summary:
			//		Sets the category header text.
			// tags:
			//		private
			this.label = label;
			this.domNode.innerHTML = this._cv ? this._cv(label) : label;
		}
	});

	return has("dojo-bidi") ? declare("dojox.mobile.RoundRectCategory", [RoundRectCategory, BidiRoundRectCategory]) : RoundRectCategory;	
});

},
'dojox/mobile/EdgeToEdgeCategory':function(){
define([
	"dojo/_base/declare",
	"./RoundRectCategory"
], function(declare, RoundRectCategory){

	// module:
	//		dojox/mobile/EdgeToEdgeCategory

	return declare("dojox.mobile.EdgeToEdgeCategory", RoundRectCategory, {
		// summary:
		//		A category header for an edge-to-edge list.
		buildRendering: function(){
			this.inherited(arguments);
			this.domNode.className = "mblEdgeToEdgeCategory";

			if(this.type && this.type == "long"){
				this.domNode.className += " mblEdgeToEdgeCategoryLong";
			}
		}
	});
});

},
'dojox/mobile/RoundRectList':function(){
define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/event",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/dom-construct",
	"dojo/dom-attr",
	"dijit/_Contained",
	"dijit/_Container",
	"dijit/_WidgetBase"
], function(array, declare, event, lang, win, domConstruct, domAttr, Contained, Container, WidgetBase){

	// module:
	//		dojox/mobile/RoundRectList

	return declare("dojox.mobile.RoundRectList", [WidgetBase, Container, Contained], {
		// summary:
		//		A rounded rectangle list.
		// description:
		//		RoundRectList is a rounded rectangle list, which can be used to
		//		display a group of items. Each item must be a dojox/mobile/ListItem.

		// transition: String
		//		The default animated transition effect for child items.
		transition: "slide",

		// iconBase: String
		//		The default icon path for child items.
		iconBase: "",

		// iconPos: String
		//		The default icon position for child items.
		iconPos: "",

		// select: String
		//		Selection mode of the list. The check mark is shown for the
		//		selected list item(s). The value can be "single", "multiple", or "".
		//		If "single", there can be only one selected item at a time.
		//		If "multiple", there can be multiple selected items at a time.
		//		If "", the check mark is not shown.
		select: "",

		// stateful: Boolean
		//		If true, the last selected item remains highlighted.
		stateful: false,

		// syncWithViews: [const] Boolean
		//		If true, this widget listens to view transition events to be
		//		synchronized with view's visibility.
		//		Note that changing the value of the property after the widget
		//		creation has no effect.
		syncWithViews: false,

		// editable: [const] Boolean
		//		If true, the list can be reordered.
		//		Note that changing the value of the property after the widget
		//		creation has no effect.
		editable: false,

		// tag: String
		//		A name of html tag to create as domNode.
		tag: "ul",

		/* internal properties */
		// editableMixinClass: String
		//		The name of the mixin class.
		editableMixinClass: "dojox/mobile/_EditableListMixin",
		
		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblRoundRectList",
		
		// filterBoxClass: String
		//		The name of the CSS class added to the DOM node inside which is placed the 
		//		dojox/mobile/SearchBox created when mixing dojox/mobile/FilteredListMixin.
		//		The default value is "mblFilteredRoundRectListSearchBox".  
		filterBoxClass: "mblFilteredRoundRectListSearchBox",

		buildRendering: function(){
			this.domNode = this.srcNodeRef || domConstruct.create(this.tag);
			if(this.select){
				domAttr.set(this.domNode, "role", "listbox");
				if(this.select === "multiple"){
					domAttr.set(this.domNode, "aria-multiselectable", "true");
				}
			}
			this.inherited(arguments);
		},

		postCreate: function(){
			if(this.editable){
				require([this.editableMixinClass], lang.hitch(this, function(module){
					declare.safeMixin(this, new module());
				}));
			}
			this.connect(this.domNode, "onselectstart", event.stop);

			if(this.syncWithViews){ // see also TabBar#postCreate
				var f = function(view, moveTo, dir, transition, context, method){
					var child = array.filter(this.getChildren(), function(w){
						return w.moveTo === "#" + view.id || w.moveTo === view.id; })[0];
					if(child){ child.set("selected", true); }
				};
				this.subscribe("/dojox/mobile/afterTransitionIn", f);
				this.subscribe("/dojox/mobile/startView", f);
			}
		},

		resize: function(){
			// summary:
			//		Calls resize() of each child widget.
			array.forEach(this.getChildren(), function(child){
				if(child.resize){ child.resize(); }
			});
		},

		onCheckStateChanged: function(/*Widget*//*===== listItem, =====*/ /*String*//*===== newState =====*/){
			// summary:
			//		Stub function to connect to from your application.
			// description:
			//		Called when the check state has been changed.
		},

		_setStatefulAttr: function(stateful){
			// tags:
			//		private
			this._set("stateful", stateful);
			this.selectOne = stateful;
			array.forEach(this.getChildren(), function(child){
				child.setArrow && child.setArrow();
			});
		},

		deselectItem: function(/*dojox/mobile/ListItem*/item){
			// summary:
			//		Deselects the given item.
			item.set("selected", false);
		},

		deselectAll: function(){
			// summary:
			//		Deselects all the items.
			array.forEach(this.getChildren(), function(child){
				child.set("selected", false);
			});
		},

		selectItem: function(/*ListItem*/item){
			// summary:
			//		Selects the given item.
			item.set("selected", true);
		}
	});
});

},
'dojox/mobile/EdgeToEdgeList':function(){
define([
	"dojo/_base/declare",
	"./RoundRectList"
], function(declare, RoundRectList){

	// module:
	//		dojox/mobile/EdgeToEdgeCategory

	return declare("dojox.mobile.EdgeToEdgeList", RoundRectList, {
		// summary:
		//		An edge-to-edge layout list.
		// description:
		//		EdgeToEdgeList is an edge-to-edge layout list, which displays
		//		all items in equally-sized rows. Each item must be a
		//		dojox/mobile/ListItem.
		
		// filterBoxClass: String
		//		The name of the CSS class added to the DOM node inside which is placed the 
		//		dojox/mobile/SearchBox created when mixing dojox/mobile/FilteredListMixin.
		//		The default value is "mblFilteredEdgeToEdgeListSearchBox". 
		filterBoxClass: "mblFilteredEdgeToEdgeListSearchBox",

		buildRendering: function(){
			this.inherited(arguments);
			this.domNode.className = "mblEdgeToEdgeList";
		}
	});
});

},
'dojox/mobile/ListItem':function(){
define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/dom-attr",
	"dijit/registry",
	"dijit/_WidgetBase",
	"./iconUtils",
	"./_ItemBase",
	"./ProgressIndicator",
	"dojo/has",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/ListItem"
], function(array, declare, lang, domClass, domConstruct, domStyle, domAttr, registry, WidgetBase, iconUtils, ItemBase, ProgressIndicator, has,  BidiListItem){

	// module:
	//		dojox/mobile/ListItem

	var ListItem = declare(has("dojo-bidi") ? "dojox.mobile.NonBidiListItem" : "dojox.mobile.ListItem", ItemBase, {
		// summary:
		//		An item of either RoundRectList or EdgeToEdgeList.
		// description:
		//		ListItem represents an item of either RoundRectList or
		//		EdgeToEdgeList. There are three ways to move to a different view:
		//		moveTo, href, and url. You can choose only one of them.
		//
		//		A child DOM node (or widget) can have the layout attribute,
		//		whose value is "left", "right", or "center". Such nodes will be
		//		aligned as specified.
		// example:
		// |	<li data-dojo-type="dojox.mobile.ListItem">
		// |		<div layout="left">Left Node</div>
		// |		<div layout="right">Right Node</div>
		// |		<div layout="center">Center Node</div>
		// |	</li>
		//
		//		Similarly, a child widget can have the preventTouch
		//		attribute, whose value is a boolean (or data-mobile-prevent-touch
		//		for children which are not widgets), such that touching such
		//		child doesn't trigger the item action.
		//
		//		Note that even if you specify variableHeight="true" for the list
		//		and place a tall object inside the layout node as in the example
		//		below, the layout node does not expand as you may expect,
		//		because layout node is aligned using float:left, float:right, or
		//		position:absolute.
		// example:
		// |	<li data-dojo-type="dojox.mobile.ListItem" variableHeight="true">
		// |		<div layout="left"><img src="large-picture.jpg"></div>
		// |	</li>

		// rightText: String
		//		A right-aligned text to display on the item.
		rightText: "",

		// rightIcon: String
		//		An icon to display at the right hand side of the item. The value
		//		can be either a path for an image file or a class name of a DOM
		//		button.
		rightIcon: "",

		// rightIcon2: String
		//		An icon to display at the left of the rightIcon. The value can
		//		be either a path for an image file or a class name of a DOM
		//		button.
		rightIcon2: "",

		// deleteIcon: String
		//		A delete icon to display at the left of the item. The value can
		//		be either a path for an image file or a class name of a DOM
		//		button.
		deleteIcon: "",

		// anchorLabel: Boolean
		//		If true, the label text becomes a clickable anchor text. When
		//		the user clicks on the text, the onAnchorLabelClicked handler is
		//		called. You can override or connect to the handler and implement
		//		any action. The handler has no default action.
		anchorLabel: false,

		// noArrow: Boolean
		//		If true, the right hand side arrow is not displayed.
		noArrow: false,

		// checked: Boolean
		//		If true, a check mark is displayed at the right of the item.
		checked: false,

		// arrowClass: String
		//		An icon to display as an arrow. The value can be either a path
		//		for an image file or a class name of a DOM button.
		arrowClass: "",

		// checkClass: String
		//		An icon to display as a check mark. The value can be either a
		//		path for an image file or a class name of a DOM button.
		checkClass: "",

		// uncheckClass: String
		//		An icon to display as an uncheck mark. The value can be either a
		//		path for an image file or a class name of a DOM button.
		uncheckClass: "",

		// variableHeight: Boolean
		//		If true, the height of the item varies according to its content.
		variableHeight: false,

		// rightIconTitle: String
		//		An alt text for the right icon.
		rightIconTitle: "",

		// rightIcon2Title: String
		//		An alt text for the right icon2.
		rightIcon2Title: "",

		// header: Boolean
		//		If true, this item is rendered as a category header.
		header: false,

		// tag: String
		//		A name of html tag to create as domNode.
		tag: "li",

		// busy: Boolean
		//		If true, a progress indicator spins.
		busy: false,

		// progStyle: String
		//		A css class name to add to the progress indicator.
		progStyle: "",

		// layoutOnResize: Boolean
		//		If true, a call to resize() will force computation of variable height items layout. You should not need this as in most
		//		cases ListItem height doesn't change on container resize. Depending on number and complexity
		//		of items in a view, setting to true may have a high impact on performance.
		layoutOnResize: false,

		/* internal properties */	
		// The following properties are overrides of those in _ItemBase.
		paramsToInherit: "variableHeight,transition,deleteIcon,icon,rightIcon,rightIcon2,uncheckIcon,arrowClass,checkClass,uncheckClass,deleteIconTitle,deleteIconRole",
		baseClass: "mblListItem",

		_selStartMethod: "touch",
		_selEndMethod: "timer",
		_delayedSelection: true,

		_selClass: "mblListItemSelected",

		buildRendering: function(){
			this._templated = !!this.templateString; // true if this widget is templated
			if(!this._templated){
				// Create root node if it wasn't created by _TemplatedMixin
				this.domNode = this.containerNode = this.srcNodeRef || domConstruct.create(this.tag);
			}
			this.inherited(arguments);

			if(this.selected){
				domClass.add(this.domNode, this._selClass);
			}
			if(this.header){
				domClass.replace(this.domNode, "mblEdgeToEdgeCategory", this.baseClass);
			}

			if(!this._templated){
				this.labelNode =
					domConstruct.create("div", {className:"mblListItemLabel"});
				var ref = this.srcNodeRef;
				if(ref && ref.childNodes.length === 1 && ref.firstChild.nodeType === 3){
					// if ref has only one text node, regard it as a label
					this.labelNode.appendChild(ref.firstChild);
				}
				this.domNode.appendChild(this.labelNode);
			}
			this._layoutChildren = [];
		},

		startup: function(){
			if(this._started){ return; }
			var parent = this.getParent();
			var opts = this.getTransOpts();
			// When using a template, labelNode may be created via an attach point.
			// The attach points are not yet set when ListItem.buildRendering() 
			// executes, hence the need to use them in startup().
			if((!this._templated || this.labelNode) && this.anchorLabel){
				this.labelNode.style.display = "inline"; // to narrow the text region
				this.labelNode.style.cursor = "pointer";
				this.connect(this.labelNode, "onclick", "_onClick");
				this.onTouchStart = function(e){
					return (e.target !== this.labelNode);
				};
			}

			this.inherited(arguments);
			
			if(domClass.contains(this.domNode, "mblVariableHeight")){
				this.variableHeight = true;
			}
			if(this.variableHeight){
				domClass.add(this.domNode, "mblVariableHeight");
				this.defer("layoutVariableHeight");
			}

			if(!this._isOnLine){
				this._isOnLine = true;
				this.set({ 
					// retry applying the attributes for which the custom setter delays the actual 
					// work until _isOnLine is true
					icon: this._pending_icon !== undefined ? this._pending_icon : this.icon,
					deleteIcon: this._pending_deleteIcon !== undefined ? this._pending_deleteIcon : this.deleteIcon,
					rightIcon: this._pending_rightIcon !== undefined ? this._pending_rightIcon : this.rightIcon,
					rightIcon2: this._pending_rightIcon2 !== undefined ? this._pending_rightIcon2 : this.rightIcon2,
					uncheckIcon: this._pending_uncheckIcon !== undefined ? this._pending_uncheckIcon : this.uncheckIcon 
				});
				// Not needed anymore (this code executes only once per life cycle):
				delete this._pending_icon;
				delete this._pending_deleteIcon;
				delete this._pending_rightIcon;
				delete this._pending_rightIcon2;
				delete this._pending_uncheckIcon;
			}
			if(parent && parent.select){
				// retry applying the attributes for which the custom setter delays the actual 
				// work until _isOnLine is true. 
				this.set("checked", this._pendingChecked !== undefined ? this._pendingChecked : this.checked);
				domAttr.set(this.domNode, "role", "option");
				if(this._pendingChecked || this.checked){
					domAttr.set(this.domNode, "aria-selected", "true");
				}
				// Not needed anymore (this code executes only once per life cycle):
				delete this._pendingChecked; 
			}
			this.setArrow();
			this.layoutChildren();
		},

		_updateHandles: function(){
			// tags:
			//		private
			var parent = this.getParent();
			var opts = this.getTransOpts();
			if(opts.moveTo || opts.href || opts.url || this.clickable || (parent && parent.select)){
				if(!this._keydownHandle){
					this._keydownHandle = this.connect(this.domNode, "onkeydown", "_onClick"); // for desktop browsers
				}
				this._handleClick = true;
			}else{
				if(this._keydownHandle){
					this.disconnect(this._keydownHandle);
					this._keydownHandle = null;
				}
				this._handleClick = false;
			}
			this.inherited(arguments);
		},

		layoutChildren: function(){
			var centerNode;
			array.forEach(this.domNode.childNodes, function(n){
				if(n.nodeType !== 1){ return; }
				var layout = n.getAttribute("layout") || // TODO: Remove the non-HTML5-compliant attribute in 2.0
					n.getAttribute("data-mobile-layout") || 
					(registry.byNode(n) || {}).layout;
				if(layout){ 
					domClass.add(n, "mblListItemLayout" +
						layout.charAt(0).toUpperCase() + layout.substring(1));
					this._layoutChildren.push(n);
					if(layout === "center"){ centerNode = n; }
				}
			}, this);
			if(centerNode){
				this.domNode.insertBefore(centerNode, this.domNode.firstChild);
			}
		},

		resize: function(){
			if(this.layoutOnResize && this.variableHeight){
				this.layoutVariableHeight();
			}
			// labelNode may not exist only when using a template (if not created by an attach point)
			if(!this._templated || this.labelNode){
				// If labelNode is empty, shrink it so as not to prevent user clicks.
				this.labelNode.style.display = this.labelNode.firstChild ? "block" : "inline";
			}
		},

		_onTouchStart: function(e){
			// tags:
			//		private
			if(e.target.getAttribute("preventTouch") || // TODO: Remove the non-HTML5-compliant attribute in 2.0
				e.target.getAttribute("data-mobile-prevent-touch") ||
				(registry.getEnclosingWidget(e.target) || {}).preventTouch){
				return;
			}
			this.inherited(arguments);
		},

		_onClick: function(e){
			// summary:
			//		Internal handler for click events.
			// tags:
			//		private
			if(this.getParent().isEditing || e && e.type === "keydown" && e.keyCode !== 13){ return; }
			if(this.onClick(e) === false){ return; } // user's click action
			var n = this.labelNode;
			// labelNode may not exist only when using a template 
			if((this._templated || n) && this.anchorLabel && e.currentTarget === n){
				domClass.add(n, "mblListItemLabelSelected");
				this.defer(function(){
					domClass.remove(n, "mblListItemLabelSelected");
				}, this._duration);
				this.onAnchorLabelClicked(e);
				return;
			}
			var parent = this.getParent();
			if(parent.select){
				if(parent.select === "single"){
					if(!this.checked){
						this.set("checked", true);
					}
				}else if(parent.select === "multiple"){
					this.set("checked", !this.checked);
				}
			}
			this.defaultClickAction(e);
		},

		onClick: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		User-defined function to handle clicks.
			// tags:
			//		callback
		},

		onAnchorLabelClicked: function(e){
			// summary:
			//		Stub function to connect to from your application.
		},

		layoutVariableHeight: function(){
			// summary:
			//		Lays out the current item with variable height.
			var h = this.domNode.offsetHeight;
			if(h === this.domNodeHeight){ return; }
			this.domNodeHeight = h;
			array.forEach(this._layoutChildren.concat([
				this.rightTextNode,
				this.rightIcon2Node,
				this.rightIconNode,
				this.uncheckIconNode,
				this.iconNode,
				this.deleteIconNode,
				this.knobIconNode
			]), function(n){
				if(n){
					var domNode = this.domNode;
					var f = function(){
						var t = Math.round((domNode.offsetHeight - n.offsetHeight) / 2) -
							domStyle.get(domNode, "paddingTop");
						n.style.marginTop = t + "px";
					};
					if(n.offsetHeight === 0 && n.tagName === "IMG"){
						n.onload = f;
					}else{
						f();
					}
				}
			}, this);
		},

		setArrow: function(){
			// summary:
			//		Sets the arrow icon if necessary.
			if(this.checked){ return; }
			var c = "";
			var parent = this.getParent();
			var opts = this.getTransOpts();
			if(opts.moveTo || opts.href || opts.url || this.clickable){
				if(!this.noArrow && !(parent && parent.selectOne)){
					c = this.arrowClass || "mblDomButtonArrow";
					domAttr.set(this.domNode, "role", "button");
				}
			}
			if(c){
				this._setRightIconAttr(c);
			}
		},

		_findRef: function(/*String*/type){
			// summary:
			//		Find an appropriate position to insert a new child node.
			// tags:
			//		private
			var i, node, list = ["deleteIcon", "icon", "rightIcon", "uncheckIcon", "rightIcon2", "rightText"];
			for(i = array.indexOf(list, type) + 1; i < list.length; i++){
				node = this[list[i] + "Node"];
				if(node){ return node; }
			}
			for(i = list.length - 1; i >= 0; i--){
				node = this[list[i] + "Node"];
				if(node){ return node.nextSibling; }
			}
			return this.domNode.firstChild;
		},
		
		_setIcon: function(/*String*/icon, /*String*/type){
			// tags:
			//		private
			if(!this._isOnLine){
				// record the value to be able to reapply it (see the code in the startup method)
				this["_pending_" + type] = icon;
				return; 
			} // icon may be invalid because inheritParams is not called yet
			this._set(type, icon);
			this[type + "Node"] = iconUtils.setIcon(icon, this[type + "Pos"],
				this[type + "Node"], this[type + "Title"] || this.alt, this.domNode, this._findRef(type), "before");
			if(this[type + "Node"]){
				var cap = type.charAt(0).toUpperCase() + type.substring(1);
				domClass.add(this[type + "Node"], "mblListItem" + cap);
			}
			var role = this[type + "Role"];
			if(role){
				this[type + "Node"].setAttribute("role", role);
			}
		},

		_setDeleteIconAttr: function(/*String*/icon){
			// tags:
			//		private
			this._setIcon(icon, "deleteIcon");
		},

		_setIconAttr: function(icon){
			// tags:
			//		private
			this._setIcon(icon, "icon");
		},

		_setRightTextAttr: function(/*String*/text){
			// tags:
			//		private
			if(!this._templated && !this.rightTextNode){
				// When using a template, let the template create the element.
				this.rightTextNode = domConstruct.create("div", {className:"mblListItemRightText"}, this.labelNode, "before");
			}
			this.rightText = text;
			this.rightTextNode.innerHTML = this._cv ? this._cv(text) : text;
		},

		_setRightIconAttr: function(/*String*/icon){
			// tags:
			//		private
			this._setIcon(icon, "rightIcon");
		},

		_setUncheckIconAttr: function(/*String*/icon){
			// tags:
			//		private
			this._setIcon(icon, "uncheckIcon");
		},

		_setRightIcon2Attr: function(/*String*/icon){
			// tags:
			//		private
			this._setIcon(icon, "rightIcon2");
		},

		_setCheckedAttr: function(/*Boolean*/checked){
			// tags:
			//		private
			if(!this._isOnLine){
				// record the value to be able to reapply it (see the code in the startup method)
				this._pendingChecked = checked; 
				return; 
			} // icon may be invalid because inheritParams is not called yet
			var parent = this.getParent();
			if(parent && parent.select === "single" && checked){
				array.forEach(parent.getChildren(), function(child){
					child !== this && child.checked && child.set("checked", false) && domAttr.set(child.domNode, "aria-selected", "false");
				}, this);
			}
			this._setRightIconAttr(this.checkClass || "mblDomButtonCheck");
			this._setUncheckIconAttr(this.uncheckClass);

			domClass.toggle(this.domNode, "mblListItemChecked", checked);
			domClass.toggle(this.domNode, "mblListItemUnchecked", !checked);
			domClass.toggle(this.domNode, "mblListItemHasUncheck", !!this.uncheckIconNode);
			this.rightIconNode.style.position = (this.uncheckIconNode && !checked) ? "absolute" : "";

			if(parent && this.checked !== checked){
				parent.onCheckStateChanged(this, checked);
			}
			this._set("checked", checked);
			domAttr.set(this.domNode, "aria-selected", checked ? "true" : "false");
		},

		_setBusyAttr: function(/*Boolean*/busy){
			// tags:
			//		private
			var prog = this._prog;
			if(busy){
				if(!this._progNode){
					this._progNode = domConstruct.create("div", {className:"mblListItemIcon"});
					prog = this._prog = new ProgressIndicator({size:25, center:false, removeOnStop:false});
					domClass.add(prog.domNode, this.progStyle);
					this._progNode.appendChild(prog.domNode);
				}
				if(this.iconNode){
					this.domNode.replaceChild(this._progNode, this.iconNode);
				}else{
					domConstruct.place(this._progNode, this._findRef("icon"), "before");
				}
				prog.start();
			}else if(this._progNode){
				if(this.iconNode){
					this.domNode.replaceChild(this.iconNode, this._progNode);
				}else{
					this.domNode.removeChild(this._progNode);
				}
				prog.stop();
			}
			this._set("busy", busy);
		},

		_setSelectedAttr: function(/*Boolean*/selected){
			// summary:
			//		Makes this widget in the selected or unselected state.
			// tags:
			//		private
			this.inherited(arguments);
			domClass.toggle(this.domNode, this._selClass, selected);
		},
		
		_setClickableAttr: function(/*Boolean*/clickable){
			// tags:
			//		private
			this._set("clickable", clickable);
			this._updateHandles();
		},
		
		_setMoveToAttr: function(/*String*/moveTo){
			// tags:
			//		private
			this._set("moveTo", moveTo);
			this._updateHandles();
		},
		
		_setHrefAttr: function(/*String*/href){
			// tags:
			//		private
			this._set("href", href);
			this._updateHandles();
		},
		
		_setUrlAttr: function(/*String*/url){
			// tags:
			//		private
			this._set("url", url);
			this._updateHandles();
		}
	});
	
	ListItem.ChildWidgetProperties = {
		// summary:
		//		These properties can be specified for the children of a dojox/mobile/ListItem.

		// layout: String
		//		Specifies the position of the ListItem child ("left", "center" or "right").
		layout: "",

		// preventTouch: Boolean
		//		Disables touch events on the ListItem child.
		preventTouch: false
	};
	
	// Since any widget can be specified as a ListItem child, mix ChildWidgetProperties
	// into the base widget class.  (This is a hack, but it's effective.)
	// This is for the benefit of the parser.   Remove for 2.0.  Also, hide from doc viewer.
	lang.extend(WidgetBase, /*===== {} || =====*/ ListItem.ChildWidgetProperties);

	return has("dojo-bidi") ? declare("dojox.mobile.ListItem", [ListItem, BidiListItem]) : ListItem;	
});

},
'dojox/mobile/Switch':function(){
define([
	"dojo/_base/array",
	"dojo/_base/connect",
	"dojo/_base/declare",
	"dojo/_base/event",
	"dojo/_base/window",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/dom-attr",
	"dojo/touch",
	"dijit/_Contained",
	"dijit/_WidgetBase",
	"./sniff",
	"./_maskUtils",
	"./common",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/Switch"
], function(array, connect, declare, event, win, domClass, domConstruct, domStyle, domAttr, touch, Contained, WidgetBase, has, maskUtils, dm, BidiSwitch){

	// module:
	//		dojox/mobile/Switch

	var Switch = declare(has("dojo-bidi") ? "dojox.mobile.NonBidiSwitch" : "dojox.mobile.Switch", [WidgetBase, Contained],{
		// summary:
		//		A toggle switch with a sliding knob.
		// description:
		//		Switch is a toggle switch with a sliding knob. You can either
		//		tap or slide the knob to toggle the switch. The onStateChanged
		//		handler is called when the switch is manipulated.

		// value: String
		//		The initial state of the switch: "on" or "off". The default
		//		value is "on".
		value: "on",

		// name: String
		//		A name for a hidden input field, which holds the current value.
		name: "",

		// leftLabel: String
		//		The left-side label of the switch.
		leftLabel: "ON",

		// rightLabel: String
		//		The right-side label of the switch.
		rightLabel: "OFF",

		// shape: String
		//		The shape of the switch.
		//		"mblSwDefaultShape", "mblSwSquareShape", "mblSwRoundShape1",
		//		"mblSwRoundShape2", "mblSwArcShape1" or "mblSwArcShape2".
		//		The default value is "mblSwDefaultShape".
		shape: "mblSwDefaultShape",

		// tabIndex: String
		//		Tabindex setting for this widget so users can hit the tab key to
		//		focus on it.
		tabIndex: "0",
		_setTabIndexAttr: "", // sets tabIndex to domNode

		/* internal properties */
		baseClass: "mblSwitch",
		// role: [private] String
		//		The accessibility role.
		role: "", // a11y

		buildRendering: function(){
			if(!this.templateString){ // true if this widget is not templated
				this.domNode = (this.srcNodeRef && this.srcNodeRef.tagName === "SPAN") ?
					this.srcNodeRef : domConstruct.create("span");
			}
			// prevent browser scrolling on IE10 (evt.preventDefault() is not enough)
			dm._setTouchAction(this.domNode, "none");
			this.inherited(arguments);
			if(!this.templateString){ // true if this widget is not templated
				var c = (this.srcNodeRef && this.srcNodeRef.className) || this.className || this["class"];
				if((c = c.match(/mblSw.*Shape\d*/))){ this.shape = c; }
				domClass.add(this.domNode, this.shape);
				var nameAttr = this.name ? " name=\"" + this.name + "\"" : "";
				this.domNode.innerHTML =
					  '<div class="mblSwitchInner">'
					+	'<div class="mblSwitchBg mblSwitchBgLeft">'
					+		'<div class="mblSwitchText mblSwitchTextLeft"></div>'
					+	'</div>'
					+	'<div class="mblSwitchBg mblSwitchBgRight">'
					+		'<div class="mblSwitchText mblSwitchTextRight"></div>'
					+	'</div>'
					+	'<div class="mblSwitchKnob"></div>'
					+	'<input type="hidden"'+nameAttr+' value="'+this.value+'"></div>'
					+ '</div>';
				var n = this.inner = this.domNode.firstChild;
				this.left = n.childNodes[0];
				this.right = n.childNodes[1];
				this.knob = n.childNodes[2];
				this.input = n.childNodes[3];
			}
			domAttr.set(this.domNode, "role", "checkbox"); //a11y
			domAttr.set(this.domNode, "aria-checked", (this.value === "on") ? "true" : "false"); //a11y

			this.switchNode = this.domNode;

			if(has("windows-theme")) {
				var rootNode = domConstruct.create("div", {className: "mblSwitchContainer"});
				this.labelNode = domConstruct.create("label", {"class": "mblSwitchLabel", "for": this.id}, rootNode);
				rootNode.appendChild(this.domNode.cloneNode(true));
				this.domNode = rootNode;
				this.focusNode = rootNode.childNodes[1];
				this.labelNode.innerHTML = (this.value=="off") ? this.rightLabel : this.leftLabel;
				this.switchNode = this.domNode.childNodes[1];
				var inner = this.inner = this.domNode.childNodes[1].firstChild;
				this.left = inner.childNodes[0];
				this.right = inner.childNodes[1];
				this.knob = inner.childNodes[2];
				this.input = inner.childNodes[3];
			}
		},

		postCreate: function(){
			this.connect(this.switchNode, "onclick", "_onClick");
			this.connect(this.switchNode, "onkeydown", "_onClick"); // for desktop browsers
			this._startHandle = this.connect(this.switchNode, touch.press, "onTouchStart");
			this._initialValue = this.value; // for reset()
		},

		startup: function(){
			var started = this._started;
			this.inherited(arguments);
			if(!started){
				this.resize();
			}
		},

		resize: function(){
			if(has("windows-theme")){
				// Override the custom CSS width (if any) to avoid misplacement.
				// Per design, the windows theme does not allow resizing the controls.
				// The label of the switch is placed next to the switch, and a custom
				// width would only have the effect to increase the distance between the
				// label and the switch, which is undesired. Hence, on windows theme,
				// ensure the width of root DOM node is 100%.
				domStyle.set(this.domNode, "width", "100%");
			}else{
				var value = domStyle.get(this.domNode,"width");
				var outWidth = value + "px";
				var innWidth = (value - domStyle.get(this.knob,"width")) + "px";
				domStyle.set(this.left, "width", outWidth);
				domStyle.set(this.right,this.isLeftToRight()?{width: outWidth, left: innWidth}:{width: outWidth});
				domStyle.set(this.left.firstChild, "width", innWidth);
				domStyle.set(this.right.firstChild, "width", innWidth);
				domStyle.set(this.knob, "left", innWidth);
				if(this.value == "off"){
					domStyle.set(this.inner, "left", this.isLeftToRight()?("-" + innWidth):0);
				}
				this._hasMaskImage = false;
				this._createMaskImage();
			}
		},

		_changeState: function(/*String*/state, /*Boolean*/anim){
			var on = (state === "on");
			this.left.style.display = "";
			this.right.style.display = "";
			this.inner.style.left = "";
			if(anim){
				domClass.add(this.switchNode, "mblSwitchAnimation");
			}
			domClass.remove(this.switchNode, on ? "mblSwitchOff" : "mblSwitchOn");
			domClass.add(this.switchNode, on ? "mblSwitchOn" : "mblSwitchOff");
			domAttr.set(this.switchNode, "aria-checked", on ? "true" : "false"); //a11y

			if(!on && !has("windows-theme")){
				this.inner.style.left  = (this.isLeftToRight()?(-(domStyle.get(this.domNode,"width") - domStyle.get(this.knob,"width"))):0) + "px";
			}

			var _this = this;
			_this.defer(function(){
				_this.left.style.display = on ? "" : "none";
				_this.right.style.display = !on ? "" : "none";
				domClass.remove(_this.switchNode, "mblSwitchAnimation");
			}, anim ? 300 : 0);
		},

		_createMaskImage: function(){
			if(this._timer){
				 this._timer.remove();
				 delete this._timer;
			}
			if(this._hasMaskImage){ return; }
			var w = domStyle.get(this.domNode,"width"), h = domStyle.get(this.domNode,"height");
			this._width = (w - domStyle.get(this.knob,"width"));
			this._hasMaskImage = true;
			if(!(has("mask-image"))){ return; }
			var rDef = domStyle.get(this.left, "borderTopLeftRadius");
			if(rDef == "0px"){ return; }
			var rDefs = rDef.split(" ");
			var rx = parseFloat(rDefs[0]), ry = (rDefs.length == 1) ? rx : parseFloat(rDefs[1]);
			var id = (this.shape+"Mask"+w+h+rx+ry).replace(/\./,"_");

			maskUtils.createRoundMask(this.switchNode, 0, 0, 0, 0, w, h, rx, ry, 1);
		},

		_onClick: function(e){
			// summary:
			//		Internal handler for click events.
			// tags:
			//		private
			if(e && e.type === "keydown" && e.keyCode !== 13){ return; }
			if(this.onClick(e) === false){ return; } // user's click action
			if(this._moved){ return; }
			this._set("value", this.input.value = (this.value == "on") ? "off" : "on");
			this._changeState(this.value, true);
			this.onStateChanged(this.value);
		},

		onClick: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		User defined function to handle clicks
			// tags:
			//		callback
		},

		onTouchStart: function(/*Event*/e){
			// summary:
			//		Internal function to handle touchStart events.
			this._moved = false;
			this.innerStartX = this.inner.offsetLeft;
			if(!this._conn){
				this._conn = [
					this.connect(this.inner, touch.move, "onTouchMove"),
					this.connect(win.doc, touch.release, "onTouchEnd")
				];

				/* While moving the slider knob sometimes IE fires MSPointerCancel event. That prevents firing
				MSPointerUp event (http://msdn.microsoft.com/ru-ru/library/ie/hh846776%28v=vs.85%29.aspx) so the
				knob can be stuck in the middle of the switch. As a fix we handle MSPointerCancel event with the
				same lintener as for MSPointerUp event.
				*/
				if(has("windows-theme")){
					this._conn.push(this.connect(win.doc, "MSPointerCancel", "onTouchEnd"));
				}
			}
			this.touchStartX = e.touches ? e.touches[0].pageX : e.clientX;
			this.left.style.display = "";
			this.right.style.display = "";
			event.stop(e);
			this._createMaskImage();
		},

		onTouchMove: function(/*Event*/e){
			// summary:
			//		Internal function to handle touchMove events.
			e.preventDefault();
			var dx;
			if(e.targetTouches){
				if(e.targetTouches.length != 1){ return; }
				dx = e.targetTouches[0].clientX - this.touchStartX;
			}else{
				dx = e.clientX - this.touchStartX;
			}
			var pos = this.innerStartX + dx;
			var d = 10;
			if(pos <= -(this._width-d)){ pos = -this._width; }
			if(pos >= -d){ pos = 0; }
			this.inner.style.left = pos + "px";
			if(Math.abs(dx) > d){
				this._moved = true;
			}
		},

		onTouchEnd: function(/*Event*/e){
			// summary:
			//		Internal function to handle touchEnd events.
			array.forEach(this._conn, connect.disconnect);
			this._conn = null;
			if(this.innerStartX == this.inner.offsetLeft){
				// need to send a synthetic click?
				if(has("touch") && has("clicks-prevented")){
					dm._sendClick(this.inner, e);
				}
				return;
			}
			var newState = (this.inner.offsetLeft < -(this._width/2)) ? "off" : "on";
			newState = this._newState(newState);
			this._changeState(newState, true);
			if(newState != this.value){
				this._set("value", this.input.value = newState);
				this.onStateChanged(newState);
			}
		},
		_newState: function(newState){
			return newState;
		},
		onStateChanged: function(/*String*/newState){
			// summary:
			//		Stub function to connect to from your application.
			// description:
			//		Called when the state has been changed.
			if (this.labelNode) {
				this.labelNode.innerHTML = newState=='off' ? this.rightLabel : this.leftLabel;
			}
		},

		_setValueAttr: function(/*String*/value){
			this._changeState(value, false);
			if(this.value != value){
				this._set("value", this.input.value = value);
				this.onStateChanged(value);
			}
		},

		_setLeftLabelAttr: function(/*String*/label){
			this.leftLabel = label;
			this.left.firstChild.innerHTML = this._cv ? this._cv(label) : label;
		},

		_setRightLabelAttr: function(/*String*/label){
			this.rightLabel = label;
			this.right.firstChild.innerHTML = this._cv ? this._cv(label) : label;
		},

		reset: function(){
			// summary:
			//		Reset the widget's value to what it was at initialization time
			this.set("value", this._initialValue);
		}
	});

	return has("dojo-bidi") ? declare("dojox.mobile.Switch", [Switch, BidiSwitch]) : Switch;
});

},
'dojox/mobile/_maskUtils':function(){
define([
	"dojo/_base/window",
	"dojo/dom-style",
	"./sniff"
], function(win, domStyle, has){

	has.add("mask-image-css", function(global, doc, elt){
		return typeof doc.getCSSCanvasContext === "function" && typeof elt.style.webkitMaskImage !== "undefined";
	});

	// Indicates whether image mask is available (either via css mask image or svg)
	has.add("mask-image", function(){
		return has("mask-image-css") || has("svg");
	});

	var cache = {};

	return {
		// summary:
		//		Utility methods to clip rounded corners of various elements (Switch, ScrollablePane, scrollbars in scrollable widgets).
		//		Uses -webkit-mask-image on webkit, or SVG on other browsers.
		
		createRoundMask: function(/*DomNode*/node, x, y, r, b, w, h, rx, ry, e){
			// summary:
			//		Creates and sets a mask for the specified node.
			
			var tw = x + w + r;
			var th = y + h + b;
			
			if(has("mask-image-css")){			// use -webkit-mask-image
				var id = ("DojoMobileMask" + x + y + w + h + rx + ry).replace(/\./g, "_");
				if (!cache[id]) {
					cache[id] = 1;
					var ctx = win.doc.getCSSCanvasContext("2d", id, tw, th);
					ctx.beginPath();
					if (rx == ry) {
						// round arc
						if(rx == 2 && w == 5){
							// optimized case for vertical scrollbar
							ctx.fillStyle = "rgba(0,0,0,0.5)";
							ctx.fillRect(1, 0, 3, 2);
							ctx.fillRect(0, 1, 5, 1);
							ctx.fillRect(0, h - 2, 5, 1);
							ctx.fillRect(1, h - 1, 3, 2);
							ctx.fillStyle = "rgb(0,0,0)";
							ctx.fillRect(0, 2, 5, h - 4);
						}else if(rx == 2 && h == 5){
							// optimized case for horizontal scrollbar
							ctx.fillStyle = "rgba(0,0,0,0.5)";
							ctx.fillRect(0, 1, 2, 3);
							ctx.fillRect(1, 0, 1, 5);
							ctx.fillRect(w - 2, 0, 1, 5);
							ctx.fillRect(w - 1, 1, 2, 3);
							ctx.fillStyle = "rgb(0,0,0)";
							ctx.fillRect(2, 0, w - 4, 5);
						}else{
							// general case
							ctx.fillStyle = "#000000";
							ctx.moveTo(x+rx, y);
							ctx.arcTo(x, y, x, y+rx, rx);
							ctx.lineTo(x, y+h - rx);
							ctx.arcTo(x, y+h, x+rx, y+h, rx);
							ctx.lineTo(x+w - rx, y+h);
							ctx.arcTo(x+w, y+h, x+w, y+rx, rx);
							ctx.lineTo(x+w, y+rx);
							ctx.arcTo(x+w, y, x+w - rx, y, rx);
						}
					} else {
						// elliptical arc
						var pi = Math.PI;
						ctx.scale(1, ry / rx);
						ctx.moveTo(x+rx, y);
						ctx.arc(x+rx, y+rx, rx, 1.5 * pi, 0.5 * pi, true);
						ctx.lineTo(x+w - rx, y+2 * rx);
						ctx.arc(x+w - rx, y+rx, rx, 0.5 * pi, 1.5 * pi, true);
					}
					ctx.closePath();
					ctx.fill();
				}
				node.style.webkitMaskImage = "-webkit-canvas(" + id + ")";
			}else if(has("svg")){		// add an SVG image to clip the corners.
				if(node._svgMask){
					node.removeChild(node._svgMask);
				}
				var bg = null;
				for(var p = node.parentNode; p; p = p.parentNode){
					bg = domStyle.getComputedStyle(p).backgroundColor;
					if(bg && bg != "transparent" && !bg.match(/rgba\(.*,\s*0\s*\)/)){
						break;
					}
				}
				var svgNS = "http://www.w3.org/2000/svg";
				var svg = win.doc.createElementNS(svgNS, "svg");
				svg.setAttribute("width", tw);
				svg.setAttribute("height", th);
				svg.style.position = "absolute";
				svg.style.pointerEvents = "none";
				svg.style.opacity = "1";
				svg.style.zIndex = "2147483647"; // max int
				var path = win.doc.createElementNS(svgNS, "path");
				e = e || 0;
				rx += e;
				ry += e;
				// TODO: optimized cases for scrollbars as in webkit case?
				var d = " M" + (x + rx - e) + "," + (y - e) + " a" + rx + "," + ry + " 0 0,0 " + (-rx) + "," + ry + " v" + (-ry) + " h" + rx + " Z" +
						" M" + (x - e) + "," + (y + h - ry + e) + " a" + rx + "," + ry + " 0 0,0 " + rx + "," + ry + " h" + (-rx) + " v" + (-ry) + " z" +
						" M" + (x + w - rx + e) + "," + (y + h + e) + " a" + rx + "," + ry + " 0 0,0 " + rx + "," + (-ry) + " v" + ry + " h" + (-rx) + " z" +
						" M" + (x + w + e) + "," + (y + ry - e) + " a" + rx + "," + ry + " 0 0,0 " + (-rx) + "," + (-ry) + " h" + rx + " v" + ry + " z";
				if(y > 0){
					d += " M0,0 h" + tw + " v" + y + " h" + (-tw) + " z";
				}
				if(b > 0){
					d += " M0," + (y + h) + " h" + tw + " v" + b + " h" + (-tw) + " z";
				}
				path.setAttribute("d", d);
				path.setAttribute("fill", bg);
				path.setAttribute("stroke", bg);
				path.style.opacity = "1";
				svg.appendChild(path); 
				node._svgMask = svg;
				node.appendChild(svg);
			}
		}
	};
});

}}});
define("dojox/mobile", [
	".",
	"dojo/_base/lang",
	"dojox/mobile/_base"
], function(dojox, lang, base){
	lang.getObject("mobile", true, dojox);
	/*=====
	return {
		// summary:
		//		Deprecated.  Should require dojox/mobile classes directly rather than trying to access them through
		//		this module.
	};
	=====*/
	return dojox.mobile;
});
