if (window.ActiveXObject && !window.XMLHttpRequest) {
  window.XMLHttpRequest=function() {
	var msxmls=new Array('Msxml2.XMLHTTP.5.0','Msxml2.XMLHTTP.4.0','Msxml2.XMLHTTP.3.0','Msxml2.XMLHTTP','Microsoft.XMLHTTP');
	for (var i=0;i < msxmls.length;i++) {
	  try { return new ActiveXObject(msxmls[i]);} catch (e) { }
	}
	return null;
  };
}

(function() {

    var Dom = YAHOO.util.Dom;
    var Event = YAHOO.util.Event;
    var DDM = YAHOO.util.DragDropMgr;

    YAHOO.portal = {
        init: function() {

            //Convert editor links into calls to inline editor
            var links = document.getElementsByTagName("a");
            for (var x = 0; x < links.length; x++)
                if (('' + links[x].getAttribute("href")).toLowerCase().indexOf('/portal/layout.asp') != -1)
                links[x].setAttribute("href", "javascript:void(YAHOO.portal.initEditMode());");

            //load up the current nugget information into a collection
            YAHOO.portal.part = {};
            var nugs = document.getElementById("pagestate").value.split(",");
            if (nugs.length > 0) {
                var info = nugs[0].split(":");
                for (var x = 0; x < nugs.length; x++) {
                    info = nugs[x].split(":");
                    if (info.length >= 5) {
                        var p = { id: '' + info[4], state: '' + info[3], options: '' + info[2], location: '' + info[1], area: +info[0], removed: false };
                        YAHOO.portal.part[p.id] = p;
                    }
                }
            }

            // Initialize the temporary Panel to display while waiting for external content to load   
            YAHOO.portal.dlgWait =
			   new YAHOO.widget.Panel("dlgWait",
				   {
				       zIndex: 999,
				       width: "240px",
				       close: false,
				       visible: false,
				       fixedcenter: true,
				       modal: true,
				       draggable: true
				   }
				);
            YAHOO.portal.dlgWait.setHeader("Processing, please wait...");
            YAHOO.portal.dlgWait.setBody('<img src="/AngelThemes/icons/portal/loading.gif" width="220" height="19" alt="" />');
            YAHOO.portal.dlgWait.render(document.body);

            YAHOO.util.Dom.setStyle("_yuiResizeMonitor", "display", "none");

            /* equally size columns containing at leats one nugget */
            var d = YAHOO.util.Dom;
            var lyr = "" + document.body.getAttribute("layout");
            if (lyr && lyr.indexOf(',') != -1) {
                var cols = lyr.split(",");
                for (var c = 0; c < cols.length; c++) {
                    YAHOO.util.Dom.setStyle("area_" + c, "width", cols[c]);
                }
            } else {
                var nCol1 = (d.getElementsByClassName("nugget", "div", "area_1").length > 0) ? 1 : 0;
                var nCol2 = (d.getElementsByClassName("nugget", "div", "area_2").length > 0) ? 1 : 0;
                var nCol3 = (d.getElementsByClassName("nugget", "div", "area_3").length > 0) ? 1 : 0;
                if (nCol1 + nCol2 + nCol3 > 0) {
                    var w = parseInt(100 / (nCol1 + nCol2 + nCol3));
                    YAHOO.util.Dom.setStyle("area_1", "width", (nCol1 > 0) ? w + "%" : "1px");
                    YAHOO.util.Dom.setStyle("area_2", "width", (nCol2 > 0) ? w + "%" : "1px");
                    YAHOO.util.Dom.setStyle("area_3", "width", (nCol3 > 0) ? w + "%" : "1px");
                }
            }
            if (location.href.indexOf('p_editmode=1') != -1)
                YAHOO.portal.initEditMode();

        },

        initEditMode: function() {
            YAHOO.util.Dom.addClass(document.body, "editmode");
            this.initDND(document.getElementsByTagName("td"));
            this.initDND(document.getElementsByTagName("div"));
            Event.on(document, "unload", YAHOO.portal.onUnload, YAHOO.portal, true);
            Event.on(document, "click", YAHOO.portal.onClick, YAHOO.portal, false);
            Event.on(document, "dblclick", YAHOO.portal.onDblClick, YAHOO.portal, false);
            Event.on("btnAddComponent", "click", YAHOO.portal.availableComponents_Show, YAHOO.portal, true);
            Event.on("btnPageCancel", "click", YAHOO.portal.btnPageCancel_Click, YAHOO.portal, true);
            Event.on("btnPageSave", "click", YAHOO.portal.btnPageSave_Click, YAHOO.portal, true);
            Event.on("btnPageDefaults", "click", YAHOO.portal.btnPageDefaults_Click, YAHOO.portal, true);
            /* subject overlay blocks save button */
            YAHOO.util.Dom.setStyle("subject_image", "display", "none");
            /* force all three columns to have a width */
            YAHOO.util.Dom.setStyle("area_1", "width", "33%");
            YAHOO.util.Dom.setStyle("area_2", "width", "33%");
            YAHOO.util.Dom.setStyle("area_3", "width", "33%");

            // make the tabs visible (in case some were hidden)
            for (var i = 0; i < 5; i++) {
                var tab = document.getElementById("tab_" + i);

                if (tab) {
                    tab.style.display = "";
                }
            }
        },

        initDND: function(els, bSetId) {
            for (var x = 0; x < els.length; x++) {
                var el = els[x];
                var sTagName = (el && el.tagName) ? el.tagName.toUpperCase() : "";
                var tmp = null;
                if (el.id && el.id.match(/^area_[0-9]*$/i)) {
                    tmp = new YAHOO.util.DDTarget(el, "nuggets");
                } else if (sTagName == "DIV" && el.className.match(/(^|\s)nugget($|\s)/)) {
                    tmp = new YAHOO.dnd.DDList(el, "nuggets");
                    if (!el.id && !el.id.match(/^area_[0-9]*$/i)) {
                        Dom.generateId(el.parentNode);
                        if (!YAHOO.portal.dndTargets[el.parentNode.id]) {
                            tmp = new YAHOO.util.DDTarget(el.parentNode, "nuggets");
                            YAHOO.portal.dndTargets['' + el.parentNode.id] = true;
                        }
                    }
                    if (el.id) {
                        // if the nugget is locked, do not allow it to be deleted
                        var lockedNuggets = getLockedNuggets();
                        if (lockedNuggets.indexOf(el.id.substring(3)) != -1) {
                            var imgs = el.getElementsByTagName("img");
                            for (var i = 0; i < imgs.length; i++) {
                                if (imgs[i].className == "nuggetRemoveIcon") {
                                    imgs[i].className = "nuggetHiddenRemoveIcon";
                                }
                            }
                        }
                    }
                }
                if (tmp) { tmp.removeInvalidHandleType("A"); }
            }
        },

        newId: function() {
            if (!this._ids || !this._ids.length || this._ids.length == 0) {
                var oXMLHTTP = new XMLHttpRequest;
                oXMLHTTP.open("POST", this.apiURL, false);
                oXMLHTTP.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                oXMLHTTP.send("cmd=GETIDS&count=100");
                this._ids = oXMLHTTP.responseText.split(",");
            }
            var sId = this._ids.pop();
            return sId;
        },

        maximize: function(el) {
            return YAHOO.portal.setNuggetState(YAHOO.portal.findNuggetContainer(el), "O", ["C"]);
            var d = YAHOO.util.Dom;
            var n = YAHOO.portal.findNuggetContainer(el);
            if (n && d.hasClass(n, "nugstate_C")) {
                d.replaceClass(n, "nugstate_C", "nugstate_O");
                var sState = YAHOO.portal.getPageState();
                YAHOO.util.Dom.get("pagestate").value = sState;
                YAHOO.portal.asynchSave(sState);
                return false;
            }
            return true;
        },

        minimize: function(el) {
            return YAHOO.portal.setNuggetState(YAHOO.portal.findNuggetContainer(el), "C", ["O"]);
            var d = YAHOO.util.Dom;
            var n = YAHOO.portal.findNuggetContainer(el);
            if (n && d.hasClass(n, "nugstate_O")) {
                d.replaceClass(n, "nugstate_O", "nugstate_C");
                var sState = YAHOO.portal.getPageState();
                YAHOO.util.Dom.get("pagestate").value = sState;
                YAHOO.portal.asynchSave(sState);
                return false;
            }
            return true;
        },

        findNuggetContainer: function(el) {
            var n = el;
            while (n) {
                if (YAHOO.util.Dom.hasClass(n, "nugget")) { return n; }
                else { n = (n.parentNode) ? n.parentNode : null; }
            }
        },

        setNuggetState: function(theNugget, sNewState, arrReplaceStates) {
            var elNug = (theNugget && theNugget.id) ? YAHOO.portal.findNuggetContainer(theNugget) : document.getElementById("nug" + theNugget);
            var sNugState = "nugstate_" + sNewState;
            var sNugId = (elNug && elNug.id) ? elNug.id.replace(/^nug/, "") : "";
            var sClass = "" + (elNug && elNug.className) ? elNug.className : "";
            var arrState = (arrReplaceStates) ? arrReplaceStates : ["O", "C", "I", "F", "X"];
            for (var x = 0; x < arrState.length; x++) {
                if (YAHOO.util.Dom.hasClass(elNug, "nugstate_" + arrState[x])) {
                    YAHOO.util.Dom.replaceClass(elNug, "nugstate_" + arrState[x], sNugState);
                    var sUrl = document.getElementById("frmPageEdit").getAttribute("action");
                    sUrl += "&p_DO=NUGSTATE&p_ID=" + escape(sNugId) + "&p_NugState=" + sNewState;
                    var postData = "cmd=nugstate&onexit=NONE";
                    YAHOO.util.Connect.asyncRequest('POST', sUrl, { failure: function() { if (navigator && navigator.appName == "Microsoft Internet Explorer") { alert('error saving page changes.') } } }, postData);
                    return true;
                }
            }
            return false;
        },

        asynchSave: function(sPageState, bResetDirty) {
            var sUrl = document.getElementById("frmPageEdit").getAttribute("action");
            var sState = (sPageState) ? sPageState : YAHOO.portal.getPageState();
            var postData = "btnSave=Save&onexit=NONE&pagestate=" + escape(sState);
            YAHOO.util.Connect.asyncRequest('POST', sUrl, { failure: function() { alert('error saving page changes.') } }, postData);
            if (bResetDirty) { YAHOO.portal.isDirty = false; }
        },

        save: function(bConfirm, bForce, sPageState, bAsync) {
            var sPrompt = document.getElementById("btnPageSave").getAttribute("value") + "?";
            if (bForce || YAHOO.portal.isDirty) {
                if (!bConfirm || confirm(sPrompt)) {
                    var el;
                    var sUrl = document.getElementById("frmPageEdit").getAttribute("action");
                    var sState = (sPageState) ? sPageState : YAHOO.portal.getPageState();
                    var postData = "btnSave=Save&onexit=NONE&pagestate=" + escape(sState);
                    el = document.getElementById("SystemDefault");
                    if (el && el.checked) { postData += "&SystemDefault=1"; }
                    el = document.getElementById("ResetAll");
                    if (el && el.checked) { postData += "&ResetAll=1"; }
                    var oXMLHTTP = new XMLHttpRequest;
                    oXMLHTTP.open("POST", sUrl, false);
                    oXMLHTTP.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                    oXMLHTTP.send(postData);
                    oXMLHTTP = null;
                    YAHOO.portal.isDirty = false;
                }
            }
        },

        cancel: function(bConfirm) {
            var sPrompt = document.getElementById("btnPageCancel").getAttribute("value") + "?";
            if (!bConfirm || !YAHOO.portal.isDirty || confirm(sPrompt)) {
                YAHOO.portal.isDirty = false;
                location.replace(location.href);
            }
        },

        onUnload: function() {
            if (YAHOO.portal.confirmUnload)
                YAHOO.portal.save(true, false);
        },

        onDblClick: function() {
            //alert('double click');
        },

        onClick: function(e) {
            var ev = (window.event) ? window.event : e;
            var el = (ev.srcElement) ? ev.srcElement : (ev.target) ? ev.target : null;
            if (el && el.tagName && el.tagName.toLowerCase() == "img" && el.className.match(/nuggetRemoveIcon/))
                YAHOO.portal.removeNugget(el);
        },

        removeNugget: function(el) {
            while (el.parentNode) {
                if (el.tagName && el.tagName.toLowerCase() == "div" && el.className && el.className.match(/(^|\s)nugget($|\s)/)) {
                    var sNugId = el.id.replace(/^nug(.*)$/, "$1");
                    YAHOO.portal.part[sNugId] = null;
                    el.parentNode.removeChild(el);
                    YAHOO.portal.isDirty = true;
                    return;
                } else {
                    el = el.parentNode;
                }
            }
        },

        removeNuggetByCheckbox: function(chk) {
            chk.setAttribute('onPage', 0);
            var sNugId = chk.id.replace(/^new(.*)$/, "$1");
            var el = document.getElementById('nug' + sNugId);
            if (el) {
                el.parentNode.removeChild(el);
            }
            if (YAHOO.portal.part[sNugId] != null) {
                YAHOO.portal.part[sNugId] = null;
                YAHOO.portal.isDirty = true;
            }
        },

        getAttrib: function(el, sAttribName) {
            while (el) {
                if (el.getAttribute && el.getAttribute(sAttribName))
                    return "" + el.getAttribute(sAttribName);
                else
                    el = (el.parentNode) ? el.parentNode : null;
            }
            return "";
        },

        makeDirty: function(el) {
            p = el;
            while (p) {
                if (p.getAttribute && p.getAttribute('dirty')) {
                    p.setAttribute('dirty', 'true');
                    YAHOO.portal.isDirty = true;
                }
                p = p.parentNode;
            }
        },

        getPageState: function() {
            var sMsg = "";
            var sState = "";
            var tds = document.getElementsByTagName("td");
            for (var i = 0; i < tds.length; i++) {
                if (tds[i].id.match(/area_[0-9]/)) {
                    var sArea = tds[i].id.replace(/area_([0-9]).*/, "$1");
                    sMsg += "td " + tds[i].id + " MATCH\n";
                    var sId = tds[i].id.replace(/[^0-9]*/gi, "");
                    var divs = tds[i].getElementsByTagName("div");
                    //go thru the DOM looking for nuggets and capturing their state and position information
                    for (var x = 0; x < divs.length; x++) {
                        if (divs[x].className.match(/(^|\s)nugget($|\s)/)) {
                            sMsg += "div " + divs[x].id + " MATCH\n";
                            var sNugId = divs[x].id.replace(/^nug(.*)$/, "$1");
                            var sNugState = divs[x].className.replace(/^.*nugstate_([A-Z]).*$/, "$1");
                            var sNugOpt = (YAHOO.portal.part[sNugId]) ? YAHOO.portal.part[sNugId].options : "00";
                            //var sNugLoc=(YAHOO.portal.part[sNugId])?YAHOO.portal.part[sNugId].location:"M";
                            var sNugLoc = "M";
                            sMsg += "ID=" + sNugId + "\nSTATE=" + sNugState + "\n";
                            sState += "," + sArea + ":" + sNugLoc + ":" + sNugOpt + ":" + sNugState + ":" + sNugId;
                            if (YAHOO.portal.part[sNugId]) { YAHOO.portal.part[sNugId].onpage = true; }
                        }
                    }
                } else {
                    sMsg += "td " + tds[i].id + " no match\n";
                }
            }
            sState = sState.substr(1, sState.length);
            return sState
        },

        apiURL: "callback.asp",

        isDirty: false,

        confirmUnload: true,

        dndTargets: {},

        macFFModeNumItems: 0,

        macFFModeNumCols: 0,

        isMacFFMode: function() {
            if (navigator.platform.indexOf("Mac") > -1) {
                var searchString = "Firefox";
                var firefoxIndex = navigator.userAgent.indexOf(searchString);
                if (firefoxIndex > -1) {
                    var adjustAmount = searchString.length + 1;
                    if (firefoxIndex + adjustAmount + 1 < navigator.userAgent.length) { //Extract the major version number of the Firefox release
                        var firefoxVersion = navigator.userAgent.substring(firefoxIndex + adjustAmount, firefoxIndex + adjustAmount + 1);
                        if (firefoxVersion.valueOf() < 3) {
                            return true;
                        }
                    }
                }
            }
            return false;
        },

        availableComponents_Init: function(o) {
            var b = document.getElementsByTagName("body")[0];
            var el = document.createElement("div");
            var dlgAvailWidth = "26em";
            var dlgAvailHeight = null;
            var dlgAvailFixedCenter = true;
            var myDlgAvail = null;
            el.id = "dlgAvailable";
            el.innerHTML = o.responseText;
            b.insertBefore(el, b.firstChild);
            var nListItems = b.getElementsByTagName('LI');
            Event.on("btnAvailOK", "click", YAHOO.portal.btnAvailOK_Click, YAHOO.portal, true);
            Event.on("btnAvailCancel", "click", YAHOO.portal.btnAvailCancel_Click, YAHOO.portal, true);
            //If browsing on Firefox on a Mac, make the dialog huge.
            if (YAHOO.portal.isMacFFMode()) {
                dlgAvailWidth = "54em";
                dlgAvailHeight = "44em";
                dlgAvailFixedCenter = false;
                YAHOO.util.Dom.addClass(document.body, "macffmode");
                YAHOO.portal.macFFModeNumItems = 60;
                YAHOO.portal.macFFModeNumCols = 3;
                if (nListItems != null) {
                    YAHOO.portal.macFFModeNumItems = nListItems.length;
                    if (nListItems.length < 15) {
                        dlgAvailWidth = "19em";
                        YAHOO.portal.macFFModeNumCols = 1;
                    }
                    else if (nListItems.length < 35) {
                        dlgAvailWidth = "38em";
                        YAHOO.portal.macFFModeNumCols = 2;
                    }
                    else {
                        dlgAvailWidth = "57em";
                    }
                    dlgAvailHeight = (1.95 * Math.round(YAHOO.portal.macFFModeNumItems / YAHOO.portal.macFFModeNumCols) + 7) + "em";
                    for (i = 0; i < nListItems.length; i++) {
                        nListItems[i].style.width = 99 / YAHOO.portal.macFFModeNumCols + "%";
                    }
                }
            }
            myDlgAvail = new YAHOO.widget.Panel("dlgAvailable", {
                zIndex: 999,
                width: dlgAvailWidth,
                height: dlgAvailHeight,
                close: false,
                visible: false,
                fixedcenter: dlgAvailFixedCenter,
                modal: true,
                draggable: true
            });

            YAHOO.portal.dlgAvailableComponents = myDlgAvail;
            YAHOO.portal.dlgAvailableComponents.render();
            YAHOO.portal.dlgWait.hide();
            YAHOO.portal.availableComponents_Show();
        },

        availableComponents_Show: function() {
            if (!YAHOO.portal.dlgAvailableComponents) {
                var sUrl = document.getElementById("frmPageEdit").getAttribute("action");
                var postData = "cmd=availablenuggets&onexit=NONE";
                YAHOO.portal.dlgWait.show();
                YAHOO.util.Connect.asyncRequest('POST', sUrl, { success: YAHOO.portal.availableComponents_Init, failure: function() { alert('error loading component list.') } }, postData);
            } else {
                var el = document.getElementById("dlgAvailable");
                var chk = el.getElementsByTagName("input");
                for (var x = 0; x < chk.length; x++) {
                    var info = chk[x].value.split(":");
                    if (YAHOO.portal.part['' + info[4]]) {
                        chk[x].checked = true;
                        chk[x].setAttribute('onPage', 1);
                    } else {
                        chk[x].checked = false;
                        chk[x].setAttribute('onPage', 0);
                    }
                }
                // availNug Settings Changed per issue # 24742 - scroll bars on Mac not showing up / burning into background
                //YAHOO.util.Dom.setStyle("dlgAvailable","display","block");
                YAHOO.portal.dlgAvailableComponents.show();
                if (YAHOO.portal.isMacFFMode()) {
                    YAHOO.util.Dom.setStyle("availNug", "overflow", "hidden");
                    YAHOO.util.Dom.setStyle("availNug", "border", "1px solid black");
                    YAHOO.util.Dom.setStyle("availNug", "height", (1.95 * Math.round(YAHOO.portal.macFFModeNumItems / YAHOO.portal.macFFModeNumCols)) + "em");
                }
                else {
                    YAHOO.util.Dom.setStyle("availNug", "overflow", "scroll");
                }
                YAHOO.util.Dom.setStyle("availNug", "display", "block");
            }
        },

        btnAvailOK_Click: function() {
            YAHOO.portal.dlgWait.show();
            YAHOO.portal.btnAvailCancel_Click();
            setTimeout(
			function() {
			    var nAdded = 0;
			    var sNugState = document.getElementById("nugState").value;
			    var sNugArea = document.getElementById("nugArea").value;
			    var sState = YAHOO.portal.getPageState();
			    var el = document.getElementById("availNug");
			    var chk = el.getElementsByTagName("input");
			    for (var x = 0; x < chk.length; x++) {
			        if (chk[x].checked && chk[x].attributes['onPage'].value != 1) {
			            //sample:1:M:00:O:name
			            var sItem = chk[x].value;
			            //always add as M(iddle) order,depercating Top/Bottom
			            sItem = sItem.replace(/([0-4])\:([TMB])\:([0-9A-F][0-9A-F])\:([A-Z])\:(.*)/, "$1:M:$3:$4:$5");
			            //if nugget state specified then override default
			            if (sNugState.length == 1)
			                sItem = sItem.replace(/([0-4])\:([TMB])\:([0-9A-F][0-9A-F])\:([A-Z])\:(.*)/, "$1:$2:$3:" + sNugState + ":$5");
			            //if nugget area specified then override default
			            if (sNugArea.length == 1)
			                sItem = sItem.replace(/([0-4])\:([TMB])\:([0-9A-F][0-9A-F])\:([A-Z])\:(.*)/, sNugArea + ":$2:$3:$4:$5");
			            sState += "," + sItem;
			            nAdded += 1;
			        }
			    }
			    if (nAdded != 0) {
			        if (sState.indexOf(",") == 0) { sState = sState.substr(1, sState.length); }
			        YAHOO.portal.save(false, true, sState);
			        var sHref = location.href;
			        sHref += (sHref.indexOf("?") == -1) ? '?p_editmode=1' : '&p_editmode=1';
			        if (location.href == sHref)
			            location.reload();
			        else
			            location.replace(sHref);
			    } else {
			        YAHOO.portal.dlgWait.hide();
			    }
			    // availNug Settings Changed per issue # 24742 - scroll bars on Mac not showing up / burning into background
			    YAHOO.util.Dom.setStyle("availNug", "display", "none");
			}, 100);
        },

        btnAvailCancel_Click: function() {
            YAHOO.portal.dlgAvailableComponents.hide();
            // availNug Settings Changed per issue # 24742 - scroll bars on Mac not showing up / burning into background
            YAHOO.util.Dom.setStyle("availNug", "display", "none");
        },

        btnPageDefaults_Click: function() {
            YAHOO.portal.dlgWait.show();
            YAHOO.portal.confirmUnload = false;
        },

        btnPageSave_Click: function() {
            YAHOO.portal.dlgWait.show();
            Dom.get("pagestate").value = YAHOO.portal.getPageState();
            YAHOO.portal.confirmUnload = false;
        },

        btnPageCancel_Click: function() {
            YAHOO.portal.dlgWait.show();
            YAHOO.portal.cancel(false);
        }

    };

    //////////////////////////////////////////////////////////////////////////////
    // custom drag and drop implementation
    //////////////////////////////////////////////////////////////////////////////

    YAHOO.dnd = {}

    YAHOO.dnd.DDList = function(id, sGroup, config) {
        YAHOO.dnd.DDList.superclass.constructor.call(this, id, sGroup, config);
        this.logger = this.logger || YAHOO;
        var el = this.getDragEl();
        Dom.setStyle(el, "opacity", 0.67); // The proxy is slightly transparent
        this.goingUp = false;
        this.lastY = 0;
    };

    YAHOO.extend(YAHOO.dnd.DDList, YAHOO.util.DDProxy, {

        startDrag: function(x, y) {
            this.logger.log(this.id + " startDrag");
            // make the proxy look like the source element
            var dragEl = this.getDragEl();
            var clickEl = this.getEl();
            Dom.setStyle(clickEl, "visibility", "hidden");
            YAHOO.portal.oldParent = clickEl.parentNode;
            YAHOO.portal.oldSibling = clickEl.nextSibling;
            dragEl.innerHTML = clickEl.innerHTML;
            Dom.setStyle(dragEl, "color", Dom.getStyle(clickEl, "color"));
            Dom.setStyle(dragEl, "backgroundColor", Dom.getStyle(clickEl, "backgroundColor"));
            Dom.setStyle(dragEl, "border", "0px solid gray");
        },

        endDrag: function(e) {
            var srcEl = this.getEl();
            var proxy = this.getDragEl();
            var bRevert = false;
            var bAnimate = true;
            //if we are reverting then do not animate
            bAnimate = bAnimate && !bRevert;
            if (bRevert) {
                //if revert is true then send element back to its original position
                YAHOO.portal.oldParent.insertBefore(srcEl, YAHOO.portal.oldSibling);
                Dom.setStyle(srcEl, "visibility", "");
            } else {
                var p = null;

                //Set dirty attribute of any parent elements to true for source
                YAHOO.portal.makeDirty(YAHOO.portal.oldParent);

                //Set dirty attribute of any parent elements to true for destination
                YAHOO.portal.makeDirty(srcEl);

                if (bAnimate) {
                    // Show the proxy element and animate it to the src element's location
                    Dom.setStyle(proxy, "visibility", "");
                    var a = new YAHOO.util.Motion(
					proxy, {
					    points: {
					        to: Dom.getXY(srcEl)
					    }
					},
					0.2,
					YAHOO.util.Easing.easeOut
				)
                    var proxyid = proxy.id;
                    var thisid = this.id;

                    // Hide the proxy and show the source element when finished with the animation
                    a.onComplete.subscribe(function() {
                        Dom.setStyle(proxyid, "visibility", "hidden");
                        Dom.setStyle(thisid, "visibility", "");
                    });
                    a.animate();

                } else {
                    Dom.setStyle(proxy.id, "visibility", "hidden");
                    Dom.setStyle(this.id, "visibility", "");
                }
            }
            if (YAHOO.portal.oldParent) { YAHOO.portal.oldParent = null; }
            if (YAHOO.portal.oldSibling) { YAHOO.portal.oldSibling = null; }
        },

        onDragDrop: function(e, id) {
            // If there is one drop interaction,the li was dropped either on the list,
            // or it was dropped on the current location of the source element.
            if (DDM.interactionInfo.drop.length === 1) {
                // The position of the cursor at the time of the drop (YAHOO.util.Point)
                var pt = DDM.interactionInfo.point;
                // The region occupied by the source element at the time of the drop
                var region = DDM.interactionInfo.sourceRegion;
                // Check to see if we are over the source element's location.  We will
                // append to the bottom of the list once we are sure it was a drop in
                // the negative space (the area of the list without any list items)
                if (!region.intersect(pt)) {
                    var destEl = Dom.get(id);
                    var destDD = DDM.getDDById(id);
                    destEl.appendChild(this.getEl());
                    destDD.isEmpty = false;
                    DDM.refreshCache();
                }

            }

        },

        onDrag: function(e) {
            // Keep track of the direction of the drag for use during onDragOver
            var y = Event.getPageY(e);
            if (y < this.lastY) {
                this.goingUp = true;
            } else if (y > this.lastY) {
                this.goingUp = false;
            }
            this.lastY = y;
        },

        onDragOver: function(e, id) {
            var srcEl = this.getEl();
            var destEl = Dom.get(id);
            // We are only concerned with list items,we ignore the dragover
            // notifications for the list.
            if (destEl.nodeName.toLowerCase() == "div" && destEl.className && destEl.className.match(/(^|\s)nugget($|\s)/)) {
                var orig_p = srcEl.parentNode;
                var p = destEl.parentNode;
                if (this.goingUp) {
                    p.insertBefore(srcEl, destEl); // insert above
                } else {
                    p.insertBefore(srcEl, destEl.nextSibling); // insert below
                }
                DDM.refreshCache();
            }
        }
    });

})();
