if (window.ActiveXObject && !window.XMLHttpRequest) {
	window.XMLHttpRequest = function() {
		var msxmls = new Array('Msxml2.XMLHTTP.5.0','Msxml2.XMLHTTP.4.0','Msxml2.XMLHTTP.3.0','Msxml2.XMLHTTP','Microsoft.XMLHTTP');
		for (var i = 0; i < msxmls.length; i++) { 
			try { return new ActiveXObject(msxmls[i]); } catch (e) { }
		}
		return null;
	};
}

var angelevent = new Object();
angelevent.register = function(id, context, func) {
  if (!angelevent[context]) { angelevent[context] = new Object(); }
  if (angelevent[context][id]) { angelevent[context][id]=null; }
  angelevent[context][id]=func;
}
angelevent.unregister = function(id, context) {
  if (angelevent[context] && angelevent[context][id]) { angelevent[context][id]=null; }
}
angelevent.raise = function(context, src) {
  if (!angelevent[context]) { return; }
  for (var x in angelevent[context]) {
    angelevent[context][x](src);
  }
}

function replacePageTokens(win) { 
  //Attempt Token Replacement
  if (garrTokens && garrTokenValues && validTokenPage(win)) { 
	try { replaceTokens(win, -1) } catch (e) { }
  }
}

function checkForm() {

    // If the page isn't hosted on the same server or if it isn't an HTML page (such as an RSS feed), then
    // we will not be able to access document.body and will get an "Access Denied" message
    try {
        var nElements = 0;
	    var f = null;
	    var iframe = frames["AngelContent"];
	    
	    // MWD 07/30/12 ANGEL-34112
	    if (iframe == undefined) {
	        // Webkit (Chrome/Safari) erase the name of the AngelContent frame from the Date Manager, but it's still there, so lets go find this bloke.
	        for (var i = 0; i < frames.length; i++) {
	            if (frames[i].frameElement.id == "contentWin") {
	                iframe = frames[i];
	                frames[i].name = "AngelContent";
	            }
	        }
	    }
	    
	    //You can now also skip this confirm box by putting confirmAbandon="false" in the body tag as an attribute
	    if (typeof (envVarConfirmAbandon) != "undefined" && envVarConfirmAbandon == "True" && ((iframe.document.body.getAttribute('confirmAbandon') == null) || (iframe.document.body.getAttribute('confirmAbandon') === "true"))) {
	        try {
	            if (iframe.blnConfirmAbandon == null || (iframe.blnConfirmAbandon == true)) {
	                for (x = 0; x < iframe.document.forms.length; x++) {
	                    nElements = 0;
	                    for (y = 0; y < iframe.document.forms[x].elements.length; y++) {
	                        switch (iframe.document.forms[x].elements[y].type) {
	                            case 'text':
	                                nElements += 8;
	                                break;
	                            case 'textarea':
	                                nElements += 16;
	                                break;
	                            case 'radio':
	                                nElements += 1;
	                                break;
	                            case 'checkbox':
	                                nElements += 2;
	                                break;
	                            case 'select':
	                                nElements += 3;
	                                break;
	                        }
	                        if (nElements >= 15) {
	                            if (iframe.blnIsDropBoxMsg && !iframe.blnAttachments && typeof (unsavedChangesAttachment) != "undefined" && unsavedChangesAttachment) {
	                                return confirm(unsavedChangesAttachment);
	                            } else if (typeof (unsavedChanges) != "undefined" && unsavedChanges) {
	                                return confirm(unsavedChanges);
	                            }
	                        }
	                    }
	                }
	            }
	            var frame;

	            if (iframe.document.frames) {
	                frame = iframe.document.frames
	            } else {
	                frame = iframe.frames
	            }

	            for (z = 0; z < frame.length; z++) {
	                try {
	                    var f = frame[z];
	                    if ((f.blnConfirmAbandon == null || f.blnConfirmAbandon == true) && ((f.document.body.getAttribute('confirmAbandon') == null) || (f.document.body.getAttribute('confirmAbandon') === "true"))) {

	                        for (x = 0; x < f.document.forms.length; x++) {
	                            if (f.document.getElementById("threads") != null) {
	                                var threadsdivs = f.document.getElementById("threads").getElementsByTagName("div");
	                                if (threadsdivs[0].className != "newTopic" && threadsdivs[0].className != "reply") {
	                                    return true;
	                                }
	                            }
	                            nElements = 0;
	                            for (y = 0; y < f.document.forms[x].elements.length; y++) {
	                                switch (f.document.forms[x].elements[y].type) {
	                                    case 'text':
	                                        nElements += 8;
	                                        break;
	                                    case 'textarea':
	                                        nElements += 16;
	                                        break;
	                                    case 'radio':
	                                        nElements += 1;
	                                        break;
	                                    case 'checkbox':
	                                        nElements += 2;
	                                        break;
	                                    case 'select':
	                                        nElements += 3;
	                                        break;
	                                }

	                                if (nElements >= 15) {
	                                    if (f.blnIsDropBoxMsg && !f.blnAttachments && typeof (unsavedChangesAttachment) != "undefined" && unsavedChangesAttachment) {
	                                        return confirm(unsavedChangesAttachment);
	                                    } else if (typeof (unsavedChanges) != "undefined" && unsavedChanges) {
	                                        return confirm(unsavedChanges);
	                                    }
	                                }
	                            }
	                        }
	                    }
	                } catch (e) { }
	            }

	        } catch (e) { }
	    }
	}
	catch (e) { }
	return true;
}

/***********************************************************************
* ANGEL Object
***********************************************************************/

if (!window.ANGEL) { window.ANGEL = {}; } 

if (!ANGEL.lang) { ANGEL.lang = {}; }

if (!ANGEL.config) { ANGEL.config = {}; }

if (!ANGEL._modal) { ANGEL._modal = new DialogManager(); }

if (!ANGEL.ui) { ANGEL.ui = {}; }

/***********************************************************************
* UI Layout Manager
***********************************************************************/
ANGEL.ui.onResize = function(bCond) 
{
    var d = YAHOO.util.Dom;
    var h = d.getViewportHeight();
    var w = d.getViewportWidth();
	var f = (d.get("fontsizer"))?d.get("fontsizer").offsetHeight:0;

    //we need to do special handling for IE 6 and below, otherwise it crops the bottom or adds unwanted scrollbar
	var temp=(navigator && navigator.appVersion)?navigator.appVersion.split("MSIE"):null;
	var nAddedPadding = (temp && temp[1] && parseFloat(temp[1])<7)?6:2;
	var nIdentityAdjust = (navigator.userAgent.toLowerCase().indexOf("safari")==-1)?0:11;

    if (!bCond || !window._lastH || !window._lastW || h!=window._lastH || w!=window._lastW || f!=window._lastFont) {
		try {
			var ph = d.get("pageHeader");
			var sb = d.get("pageSidebar");
			var pb = d.get("pageBody");
			var pf = d.get("pageFooter");
			var gm = d.get("guideMenu");
			var gn = d.get("globalNav");
			var gmH = (gm)?gm.offsetHeight:0;
			//grow page body div to fill space not used by header
            /////////////////////////////////////////
            // PSU anf107 10/8/13
            //use viewport height on iphone
            /////////////////////////////////////////
			var isIphone = navigator.userAgent.toLowerCase().indexOf('iphone') >= 0;
			//The iPhone screen can't be resized. The resize function adds substantial delay to the user's browsing experience and causes the content frame to bounce.
			if (!isIphone) {
				d.setStyle(pb, "height", (h - nAddedPadding - ph.offsetHeight) + 'px');
			}
			else
			{
				d.setStyle(pb, "height", (d.getViewportHeight()) + 'px');
			}
            /////////////////////////////////////////
            // PSU 10/8/13
            /////////////////////////////////////////
			//adjust left margin on main area to make room for sidebar
			if (d.hasClass("page", "sidebarOn"))
				d.setStyle("pageMain", "marginLeft", (sb.offsetWidth) + 'px');
			else
				d.setStyle("pageMain", "marginLeft", (gn.offsetLeft + gn.offsetWidth) + 'px');
			//resize contentWin to make room for footer beneath it
			d.setStyle("contentWin", "height", (pb.offsetHeight - nAddedPadding - pf.offsetHeight) + 'px');
			//resize tocWin to make room for link menu beneath it
			d.setStyle("guideWin", "height", (pb.offsetHeight - gmH - 4) + 'px');
			//always put identity at bottom left of page header
			d.setStyle("identityWidget", "top", Math.max(ph.offsetHeight-nIdentityAdjust, 12) + 'px');
			//save the new width and height for use in later conditional resize logic
			if (bCond) {
				window._lastH=h;
				window._lastW=w;
				window._lastFont=f;
			}
		} catch(e) { }
	}
}

/***********************************************************************
* UI Initialization function
***********************************************************************/
ANGEL.ui.init = function() 
{

	if (!window.ANGEL) { window.ANGEL={}; } 
	//get a ref to the sidebar window
	var sb = (document.frames&&document.frames['AngelMenu'])?document.frames['AngelMenu']:document.getElementById('guideWin');
	if (sb && sb.contentWindow) { sb=sb.contentWindow; }
	ANGEL.ui.sidebar.window = sb;
    var gm = document.getElementById("guideMenu");
	var links = (gm)?gm.getElementsByTagName("a"):null; 
    if (!links) {
		//hide toggle if no sidebar menu
		if (document.getElementById("guideToggle") != null)
		{
		    document.getElementById("guideToggle").style.display = "none";
		}
	} else {
		ANGEL.ui.sidebar.init();
	}
	ANGEL.sessionTimer.reset();
}

/***********************************************************************
* Main Area
***********************************************************************/
ANGEL.ui.main = {
    win: null,
    frames: null,
    frameset: null,
    banner: null,
    onLoad: function(src) {
        ANGEL.ui.main.win = src;
        try {
            ANGEL.eu.loadApprovalStateAndCheck(false,"ANGEL.ui.main");
            //set lastAccess date for session keep-alive on any type of access
            ANGEL.sessionTimer.updateLastAccess();
            //if this page is part of ANGEL then replace tokens and update breadcrumbs
            if (src && src.document && src.document.location && src.document.location.href) {
                //try to replace tokens 
                replacePageTokens(src);
                //check for contentFrame IFRAME
                var iframe = src.document.getElementById("contentFrame");
                if (iframe && iframe.contentWindow) {
                    replacePageTokens(iframe.contentWindow);
                }
                else {
                    //if this is a framed page then try to replace tokens in sub frames
                    var frames = (src.document.frames) ? src.document.frames : src.document.documentElement.getElementsByTagName("frame");
                    for (var x = 0; x < frames.length; x++)
                        try { replacePageTokens(frames[x]); } catch (e) { }
                }
                //try to update breadcrumbs
                ANGEL.ui.bc.update(src);
            }
        } catch (e) { }
    }
};

/***********************************************************************
* Breadcrumbs Manager
***********************************************************************/

// Show or hide the breadcrumbs div based upon the ANGELBREADCRUMBS cookie value.
var angelBreadCrumbsEnabled = 1;
if (document.cookie.indexOf("ANGELBREADCRUMBS=0") >= 0) 
{
    // breadcrumbs are disabled
    angelBreadCrumbsEnabled = 0;
}

var breadCrumbSectionDiv = document.getElementById("breadcrumbs");
if (!breadCrumbSectionDiv)
{
    if (document.parent)
    {
        var breadCrumbSectionDiv = document.getElementById("breadcrumbs");
    }
}
if (breadCrumbSectionDiv)
{
    if (angelBreadCrumbsEnabled == "1")
    {
        // show breadcrumbs
        breadCrumbSectionDiv.style.visibility = '';
    }
    else
    {
        // hide breadcrumbs
        breadCrumbSectionDiv.style.visibility = 'hidden';
    }
}

ANGEL.ui.bc = {
    links: [],

    staticItems: null,

    write: function(menu, breadcrumbArray) {
        var lis = menu.getElementsByTagName("li");
        if (ANGEL.ui.bc.staticItems === null) { ANGEL.ui.bc.staticItems = lis.length; }
        var nNumItems = lis.length;
		for (var x=nNumItems-1; x>=ANGEL.ui.bc.staticItems; x--)
		{
            menu.removeChild(lis[x]);
        }

        // make sure all anchors use the onclick attribute
        var anchors = menu.getElementsByTagName("a");

		for (var i = 0; i < anchors.length; i++)
		{
		    if (anchors[i].onclick == null)
		    {
                anchors[i].parentNode.innerHTML = anchors[i].parentNode.innerHTML.replace("<a", "<a onclick=\"return checkForm();\"");
                anchors[i].parentNode.innerHTML = anchors[i].parentNode.innerHTML.replace("<A", "<A onclick=\"return checkForm();\"");
            }
        }

        //now add in the breadcrumbs in the array
        for (var x = 0; x < breadcrumbArray.length; x++) {
            var bc = breadcrumbArray[x];
            var lnk = document.createElement("a");
            lnk.id = "bc" + bc.id;
            lnk.setAttribute("target", bc.target);
            lnk.setAttribute("href", bc.url);
            lnk.setAttribute("match", bc.match);
            //lnk.onclick = "return checkForm();";
            //lnk.setAttribute("onclick", "return checkForm();");
            lnk.appendChild(document.createTextNode(bc.title + "\xa0"));
            var li = document.createElement("li");
            li.appendChild(lnk);
            li.innerHTML = li.innerHTML.replace("<a", "<a onclick=\"return checkForm();\"");
            li.innerHTML = li.innerHTML.replace("<A", "<A onclick=\"return checkForm();\"");
            menu.appendChild(li);
        }
    },

    normalize: function(sUrl) {
        var s = sUrl;
        if (s.indexOf("?") == -1) {
            return s;
        } else {
            var sBase = ""
        }
    },

    base: function(sUrl, bSkipRemovePageName) {
        s = "" + sUrl;
        s = s.replace(/\?.*$/, "");
        s = s.replace(/\#.*$/, "");
		if(!bSkipRemovePageName)
		{
            s = s.replace(/default\.aspx?/i, "");
        }
        //s=s.toLowerCase();
        return s;
    },

    servername: function(sUrl) {
        s = ANGEL.ui.bc.base("" + sUrl, false);
        s = (s.match(/^.*\/\/([^\/]*).*$/)) ? s.replace(/^.*\/\/([^\/]*).*$/gi, "$1") : "";
        return s;
    },

    path: function(sUrl, bSkipRemovePageName) {
        s = ANGEL.ui.bc.base("" + sUrl, bSkipRemovePageName);
        s = s.replace(/^.*\/\/[^\/]*/gi, "");
        return s;
    },

    query: function(sUrl) {
        s = "" + sUrl;
        if (s.indexOf("?") == -1)
            return "";
        s = s.replace(/^.*\?/, "");
        var arr = s.split("&");
        arr = arr.sort();
        for (var x = 0; x < arr.length; x++) {
            var p = arr[x].split("=");
            p[0] = p[0].toLowerCase();
            arr[x] = p.join("=");
        }
        return "?" + arr.join("&");
    },

    hash: function(sUrl) {
        s = "" + sUrl;
        if (s.indexOf("#") == -1)
            return "";
        s = s.replace(/^.*#/, "#");
        s = s.replace(/\?.*$/, "");
        return s;
    },

    normalize: function(sUrl, bExact, bSkipRemovePageName) {
        var s = "" + sUrl;
        s = (s.toLowerCase().indexOf("/" + location.hostname.toLowerCase() + "/") != -1) ? ANGEL.ui.bc.path("" + sUrl, bSkipRemovePageName) : ANGEL.ui.bc.base("" + sUrl, bSkipRemovePageName);
        if (bExact)
            s += ANGEL.ui.bc.hash("" + sUrl) + ANGEL.ui.bc.query("" + sUrl);
        //alert("normalize\nin="+sUrl+"\nout="+s);
        return s;
    },

    formatTitle: function(sTitle) {
        return (sTitle.indexOf(":") != -1) ? sTitle.substr(0, sTitle.indexOf(":")) : sTitle;
    },

    removeGroup: function(groupName) {
        for (var i = 0; i < ANGEL.ui.bc.links.length; i++) {
            if (ANGEL.ui.bc.links[i].groupName == groupName) {
                ANGEL.ui.bc.links.splice(i, 1);
                i--;
            }
        }
        ANGEL.ui.bc.write(document.getElementById("breadcrumbMenu"), ANGEL.ui.bc.links);
    },

    update: function(src) {
        var bc = ANGEL.ui.bc;
        var bodyBreadcrumbFalse = false;
        var idx = 0;
        var de = (src.document.documentElement) ? src.document.documentElement : src.document;
        //SPECIAL CASE VARIABLES:
        //The gstrBreadcrumbRootTruncateOverload can be added to a page to prevent truncating 
        //on all root nodes.  One example is Add Content->Copy Item since Copy Item page is
        //still ROOT entry_id.
        var skipRootTruncate = (src.gstrBreadcrumbRootTruncateOverload) ? src.gstrBreadcrumbRootTruncateOverload : false;
        //The gstrBreadcrumbRemovePageNameOverload can be added to a page so the breadcrumb 
        //generated will not remove the page name (ex:default.aspx). This was needed for At A Glance
        //nugget since the crumb generated when clicked no longer autoran even though autorun was set in querystring.
        var skipRemovePageName = (src.gstrBreadcrumbRemovePageNameOverload) ? src.gstrBreadcrumbRemovePageNameOverload : false;
        //The gstrBreadcrumbPathOverload can be added to a page to override where the breadcrumb takes you 
        //when clicked. Just set its value to the path. Office hours and Calendar Events share recurrence 
        //editor so we use it there.
        var overloadPath = (src.gstrBreadcrumbPathOverload) ? src.gstrBreadcrumbPathOverload : "";
        // gbNoBreadCrumbs - allows the page to turn off breadcrumbs without changing the document attributes
        // has the same effect as attributes('breadcrumb') == 'false'
        var noBreadCrumbs = (src.gbNoBreadCrumbs) ? src.gbNoBreadCrumbs : false;

        if (src.lsn_page != undefined) {
            de = src.lsn_page.document.documentElement;
        }
        var bHasBody = (de && de.getElementsByTagName("body").length) ? true : false;
        var b = (de && de.getElementsByTagName("body").length) ? de.getElementsByTagName("body")[0] : null;
        if ((!b || b.getAttribute('breadcrumb') == 'false') || noBreadCrumbs)
            bodyBreadcrumbFalse = true;
        if (src.gstrFinalWCI) {
            if (src.gstrWCI == 'PGADD')
                bodyBreadcrumbFalse = true;
            if (!b || ((b.getAttribute('breadcrumb') == 'notAtRoot') && src.gstrEntryID == 'ROOT'))
                bodyBreadcrumbFalse = true;
            var sTitle = (src.gstrEntryTitle != "") ? src.gstrEntryTitle : bc.formatTitle(src.document.title);
            if (sTitle == "")
                sTitle = "Untitled"
            var sBase = sHref;
            var sTab = 'tabContent';
            var sParent = "" + src.gstrParentID;
            var bLinkedItem = (src.gstrEntrySection != src.gstrSectionID) ? true : false;
            if(bLinkedItem && src.gstrShortcutID != '')
            {
                var sHref = "" + src.gstrScriptURL + "&entry_id=" + escape("" + src.gstrShortcutID);
            }
            else
            {
                var sHref = "" + src.gstrScriptURL + "&entry_id=" + escape("" + src.gstrEntryID);
            }
            //if root then truncate breadcrumbs
            if (src.gstrEntryID == src.gstrRootID) {
				if(!skipRootTruncate)
				{
                    bc.links.length = 0;
                    sHref = "" + src.gstrScriptURL;
                    sParent = "";
                }
            } else {
                //search for shortcuts and truncate
                if (!bLinkedItem) {
                    for (idx = bc.links.length - 1; idx >= 0; idx--)
                        if (bc.links[idx].linkedItem)
                        bc.links.length = idx;

                    //search for sibling or self and truncate
                    for (idx = bc.links.length - 1; idx >= 0; idx--)
                        if (src.gstrParentID == bc.links[idx].parent && !bodyBreadcrumbFalse)
                        bc.links.length = idx;
                }
				else
				{
                    for (idx = bc.links.length - 1; idx >= 0; idx--)
                        if (bc.links[idx].linkedItem && src.gstrParentID == bc.links[idx].parent && !bodyBreadcrumbFalse)
                        bc.links.length = idx;
                }
            }
        } else {
            //Get the Href
            try {
                var sTitle = bc.formatTitle(src.document.title);
                if (sTitle == "")
                    sTitle = "Untitled"
                var sHref = bc.normalize((overloadPath != "") ? overloadPath : src.document.location.href, true, skipRemovePageName);
                var sBase = bc.normalize(sHref, false, skipRemovePageName);
                var b = (de && de.getElementsByTagName("body").length) ? de.getElementsByTagName("body")[0] : null;
                var sTab = ''; //(b)?""+b.getAttribute("tab"):""+de.getAttribute("tab");
                var sParent = "";
                var bLinkedItem = false;
                var sTest = bc.normalize(sHref, false, skipRemovePageName);
                var sBaseLowerCase = sBase.toLowerCase();
                //now search existing breadcrumbs for a match and truncate to the item before the match if found
                for (idx = 0; idx < bc.links.length; idx++) {
                    if ((bc.normalize(bc.links[idx].url, false, skipRemovePageName).toLowerCase() == sBaseLowerCase) && (sTitle == bc.links[idx].title)) {
                        bc.links.length = idx;
                        break;
                    }
                }

                //Mimics same functionality as root content items, but for non-content item pages.  Just put var called gstrRootID 
                //set to "ROOT" on page and it will truncate all dynamic breadcrumbs.
                if (src.gstrRootID == "ROOT") {
                    ANGEL.ui.bc.links.length = 0;
                }

            } catch (e) {
                alert('error');
                return;
            }
        }
        //check if this is a tab entry and truncate
        for (var t in ANGEL.tabs) {
            if (bc.normalize(sHref, true, false) == bc.normalize(ANGEL.tabs[t].url, true, false)) {
                if (sTab == "")
                    sTab = "" + t;
                ANGEL.ui.bc.links.length = 0;
            }
        }
        //set tab if explicitly defined
        if (sTab != "" && ANGEL.tabs[sTab])
            ANGEL.ui.tabmenu.selectTab(ANGEL.tabs[sTab].id);

        //set the index variable to 1 beyond the last item in the breadcrumb array
        idx = ANGEL.ui.bc.links.length;

        //add the item to the breadcrumb dictionary
        if ((!bodyBreadcrumbFalse) && (bHasBody)) {
            var groupName = "";
            if (src.gstrBreadcrumbGroupName != undefined) {
                groupName = src.gstrBreadcrumbGroupName;
            }
            bc.links[idx] = new bc.Breadcrumb(idx, sTitle, sHref, "", "", false, sParent, bLinkedItem, groupName);
        }
        //attempt to update the breadcrumb display
        bc.write(document.getElementById("breadcrumbMenu"), bc.links);
        return idx;
    },

    Breadcrumb: function(sId, sTitle, sURL, sTarget, sAttributes, bExactMatch, sParentID, bLinkedItem, groupName) {
        this.id = sId;
        this.title = sTitle;
        this.url = sURL;
        this.target = (sTarget) ? sTarget : "";
        this.attributes = (sAttributes) ? sAttributes : "";
        this.exactMatch = (bExactMatch) ? true : false;
        this.parent = (sParentID) ? sParentID : "";
        this.linkedItem = bLinkedItem;
        this.groupName = groupName;
        return this;
    }
};

/***********************************************************************
* User Menu Toggle
***********************************************************************/
ANGEL.ui.usermenu = {
	toggle:function(){
		if (YAHOO.util.Dom.getStyle("userLinks","display")!="none")
			ANGEL.ui.usermenu.hide();
		else
			ANGEL.ui.usermenu.show();
	},

	hide:function(){
		var anim_mn=new YAHOO.util.Anim("userLinks",{ opacity:{from:0.9,to:0}},0.2);
		anim_mn.animate();
		setTimeout('YAHOO.util.Dom.setStyle("userLinks","display","none");',200);
	},

	show:function(){
		var anim_mn=new YAHOO.util.Anim("userLinks",{opacity:{from:0,to:0.9}},0.2);
		anim_mn.animate();
		setTimeout('YAHOO.util.Dom.setStyle("userLinks","display","block");',5);
	}
};

/***********************************************************************
* Sidebar Toggle
***********************************************************************/
ANGEL.ui.sidebar = {
	init: function() {
		var d = YAHOO.util.Dom;
		var gm = d.get("guideMenu");
		var tabs = (gm && gm.getElementsByTagName)?gm.getElementsByTagName("li"):[];
		ANGEL.ui.sidebar.tabs = tabs;
		if (tabs.length>0) {
			var sb = (document.frames&&document.frames['AngelMenu'])?document.frames['AngelMenu']:document.getElementById('guideWin');
			if (sb && sb.contentWindow) { sb=sb.contentWindow; }
			for (x=0; x<tabs.length; x++) {
				//check if the current tab and highlight
				try {
					if (tabs[x].getElementsByTagName('a')[0].getAttribute('href')==sb.window.location.href) {
						d.removeClass(tabs,"active");
						d.addClass(tabs[x],"active");
					}
				} catch(e)  { }
				// add an onclick handler to each tab to update the active class as needed:
				YAHOO.util.Event.on(tabs[x],"click",function(e) {
					d.removeClass(ANGEL.ui.sidebar.tabs,"active");
					d.addClass(this,"active");
				});
			}
		}
		return true;
	},
	toggle:function(){
		if (YAHOO.util.Dom.getStyle("pageGuide","display")!="none")
			ANGEL.ui.sidebar.hide();
		else
			ANGEL.ui.sidebar.show();
	},

	hide:function(bNoAnimation, sUrl){
		var d=YAHOO.util.Dom;
		var sb=d.get("pageSidebar");
		var mn=d.get("pageMain");
		var gn=d.get("globalNav");
		var gt=d.get("guideToggle");
		/* hide the sidebar long enough to determine its width when toc is cloased */
		var newWidth=gn.offsetLeft+gn.offsetWidth;
		if (bNoAnimation) {
			d.replaceClass("page","sidebarOn","sidebarOff");
			ANGEL.ui.onResize();
		} else {
			var anim_mn=new YAHOO.util.Anim("pageMain",{marginLeft:{from:sb.offsetWidth,to:newWidth}},0.2);
			anim_mn.onComplete.subscribe(function(){d.replaceClass("page","sidebarOn","sidebarOff");ANGEL.ui.onResize();});
			anim_mn.animate();
		}
		//change sidebar handle during transition
		setTimeout('YAHOO.util.Dom.replaceClass("guideToggle", "expanded", "collapsed")',0);
		//send command to update the sidebar env var
		var oXMLHTTP = new XMLHttpRequest;
		oXMLHTTP.open( "GET", ANGEL.config.root + "section/sidebar.asp?p_id=NONE&NOEXEC=1", true );
		try { oXMLHTTP.send(''); } catch(e) { }
	},

	show:function(bNoAnimation, sUrl){
		var d=YAHOO.util.Dom;
		var sb=d.get("pageSidebar");
		var mn=d.get("pageMain");
		var gm=d.get("guideMenu");
		var gmH=(gm)?gm.offsetHeight:0;
		var gt=d.get("guideToggle");
		var bIsOpen = d.hasClass("page","sidebarOn");
		if (sUrl && sUrl!='') {
			window.open(sUrl, "AngelMenu", "");
		}
		d.replaceClass("page","sidebarOff","sidebarOn");
		d.setStyle("tocWin","height",(d.get("pageBody").offsetHeight-gmH-8)+"px");
		d.setStyle(mn,"marginLeft",(sb.offsetLeft+sb.offsetWidth)+"px");
		ANGEL.ui.onResize();
		if (!bIsOpen && !bNoAnimation) {
			var anim_mn=new YAHOO.util.Anim("pageMain",{marginLeft:{from:mn.offsetLeft,to:sb.offsetWidth}},0.2);
			anim_mn.onComplete.subscribe(ANGEL.ui.onResize);
			anim_mn.animate();
		}
		//change sidebar handle during transition
		setTimeout('YAHOO.util.Dom.replaceClass("guideToggle","collapsed","expanded")',0);
	}
};

/***********************************************************************
* Banner Toggle
***********************************************************************/
ANGEL.ui.banner = {
	toggle:function(){
		if (document.getElementById("bannerToggle").className.indexOf("collapsed")==-1)
			ANGEL.ui.banner.hide();
		else
			ANGEL.ui.banner.show();
	},

	hide:function(){
		YAHOO.util.Dom.replaceClass("bannerToggle","expanded","collapsed");
		YAHOO.util.Dom.replaceClass("page","bannerOn","bannerOff");
		setTimeout('ANGEL.ui.onResize();',210);
	},

	show:function(){
		YAHOO.util.Dom.replaceClass("page","bannerOff","bannerOn");
		YAHOO.util.Dom.replaceClass("bannerToggle","collapsed","expanded");
		setTimeout('ANGEL.ui.onResize();',210);
	}
};

/***********************************************************************
* Tabs Manager
***********************************************************************/
ANGEL.ui.tabmenu = { 
	_tab:null,
	selectTab:function(theTab, sURL, sTarget) {
	    if (sURL && sURL!='') {
		    if (!checkForm()) { return false; }
		}
		//may accept either LI or A element of the tab as a parameter
		//if (!checkForm()) { return false; }
		if (!theTab || theTab.length==0) { return; }
		var li = (theTab && theTab.tagName)?theTab:document.getElementById(theTab);
		while (li && li.parentNode && li.tagName && li.tagName.toUpperCase()!="LI") { li = li.parentNode; }
		if (!li || !li.tagName || li.tagName.toUpperCase()!="LI") { return; }
		var a = (li.getElementsByTagName)?li.getElementsByTagName("A")[0]:null;
		if (!a) { return; }
		//update tab selection
		if (ANGEL.ui.tabmenu._tab&&a&&ANGEL.ui.tabmenu._tab!=a) {YAHOO.util.Dom.removeClass(ANGEL.ui.tabmenu._tab,"active");}
		ANGEL.ui.tabmenu._tab=a;
		if (a) {YAHOO.util.Dom.addClass(a,"active");}
		//navigate to tab url if second param is true
		if (sURL && sURL!='') {
			var target=(sTarget&&sTarget!='')?sTarget:(a.getAttribute("target")&&a.getAttribute("target")!='')?a.getAttribute("target"):"AngelContent";
			window.open(sURL,target);
		}
		return false;
	}
};

/***********************************************************************
* Session Timer
***********************************************************************/
ANGEL.sessionTimer = {
    lastAccess: new Date(),

    //15 mins
    delay: 900000,

    //1 min
    countdown: 60000,

    timer: null,

    timerStarted: null,

    updateLastAccess: function(dDate) {
        var dNow = new Date();
        if (dDate)
            ANGEL.sessionTimer.lastAccess = dDate;
        else if (dNow > ANGEL.sessionTimer.lastAccess)
            ANGEL.sessionTimer.lastAccess = dNow;
        if (ANGEL.sessionTimer.timerStarted && ANGEL.sessionTimer.lastAccess.getTime() - ANGEL.sessionTimer.timerStarted.getTime() > 1 * 60 * 1000) {
            if (ANGEL.user && ANGEL.user.username != '')
                ANGEL.sessionTimer.extendSession();
        }
    },

    //Reset the session timer
    reset: function() {
        if (ANGEL.config && ANGEL.config.timeout)
        //include the timer countdown at part of the delay, otherwise the session will be gone by the time the user clicks to continue the session.
            ANGEL.sessionTimer.delay = (parseInt(ANGEL.config.timeout) * 60 * 1000) - (ANGEL.sessionTimer.countdown * 2);
        if (ANGEL.sessionTimer.timer) {
            clearTimeout(ANGEL.sessionTimer.timer);
        }
        if (ANGEL.user && ANGEL.user.username != '') {
            ANGEL.sessionTimer.timerStarted = new Date();
            ANGEL.sessionTimer.timer = setTimeout(ANGEL.sessionTimer.fire, ANGEL.sessionTimer.delay);
        }
    },

    //Checks the status of the keepalive session variable, and prompts for a session warning, or extends the session
    fire: function() {
        if (ANGEL.user && ANGEL.user.username != '' && ANGEL.config && ANGEL.config.timeout) {
            YAHOO.util.Connect.asyncRequest("GET", ANGEL.config.root + "jscript/keepalive/checkkeepalive.ashx", { success: ANGEL.sessionTimer.fireSuccess, failure: ANGEL.sessionTimer.warn });
        }
    },

    fireSuccess: function(e) {
        if (e.responseText == "Prompt") {
            ANGEL.sessionTimer.warn();
        }
        else {
            ANGEL.sessionTimer.extendSession();
        }
    },

    warn: function() {
        if (ANGEL.user && ANGEL.user.username != '' && ANGEL.config && ANGEL.config.timeout) {
            ANGEL._modal.alert(ANGEL.lang["InactivePrompt"], "warn", ANGEL.lang["TimeoutWarning"], function() { ANGEL.sessionTimer.extendSession(true); }, { lblOK: ANGEL.lang["ExtendMySession"] });
            //set timer for auto-logoff if no response
            //alert('ending session in (ms)=' + ANGEL.sessionTimer.countdown);
            /////////////////////////////////////////
            // PSU #R00148 - 09/30/2008
            // Add 4 minutes to timeout and warning display
            /////////////////////////////////////////
            // ORIGINAL: ANGEL.sessionTimer.timer=setTimeout(ANGEL.sessionTimer.endSession, ANGEL.sessionTimer.countdown);
            /////////////////////////////////////////
            ANGEL.sessionTimer.timer = setTimeout(ANGEL.sessionTimer.endSession, (ANGEL.sessionTimer.countdown + 240000));
            /////////////////////////////////////////
            // END PSU #R00148
            /////////////////////////////////////////
        }
    },

    extendSession: function(reSync) {
        var cb = { success: ANGEL.sessionTimer.reset, failure: function(x) { alert(ANGEL.lang["ErrorAPIConnect"]); } }
        if (reSync) {
            YAHOO.util.Connect.asyncRequest("GET", ANGEL.config.root + "ping.asp?reSync=true", cb);
        } else {
            YAHOO.util.Connect.asyncRequest("GET", ANGEL.config.root + "ping.asp", cb);
        }
        YAHOO.util.Connect.asyncRequest("GET", ANGEL.config.root + "ping.aspx", { failure: function(x) { alert(ANGEL.lang["ErrorAPIConnect"]); } });
    },

    endSession: function(bConfirm) {
        if (typeof (bConfirm) != 'boolean' || !bConfirm || confirm(ANGEL.lang['LogoutPrompt'])) {
            //set up to call old school logout method in 5 secs just in case ajax does not work
            setTimeout(function() { document.location.replace(ANGEL.config.root + "signon/logout.asp"); }, 10000);
            //use ajax to call logout page then reload the interface, so we bypass the logout page in the UI
            YAHOO.util.Connect.asyncRequest("GET", ANGEL.config.root + "signon/logout.asp", {
                success:
		            function() {
		                //Call a .NET page to end the user's .NET session
		                YAHOO.util.Connect.asyncRequest("GET", ANGEL.config.root + "signon/logout.aspx", { success: function() { document.location.replace(ANGEL.config.sourceDomain || ANGEL.config.root); } });
		            }
            });
        }
    }
}

/***********************************************************************
* Privacy - EU Cookie Opt-in
***********************************************************************/
ANGEL.eu = {

    //set this property from pages you don't want the dialog to pop up on, like the logon page.
    doCheck: true,

    //loads cookie if needed, and fires the check
    loadApprovalStateAndCheck: function(refresh, dbgString) {
        var cookieApproved = ANGEL.eu.getCookie("CookiesApproved");
        var cookieApprovalState = ANGEL.eu.getCookie("CookieApprovalState");
        //we can save a trip to server
        if (!ANGEL.eu.isAuthenticated() && cookieApproved != null && cookieApproved == "1" && !refresh) {
            ANGEL.eu.setCookie("CookieApprovalState", 1, false, "\/", false, false);
        }

        //lazy load the cookie value. If loaded, fire check, otherwise fire after the callback.
        if (ANGEL.eu.getCookie("CookieApprovalState") == null || refresh) {
            YAHOO.util.Connect.asyncRequest("GET", ANGEL.config.root + "JScript/CookieAcceptance/ApprovalState.ashx", ANGEL.eu.callback);
        } else {
            ANGEL.eu.check();
        }
        //alert('SUCCESS: check ran from: ' + dbgString);
        //console.log('SUCCESS: check ran from: ' + dbgString);
    },

    callback: {
        success: function(res) {
            if (res.responseText != '') {
                ANGEL.eu.setCookie("CookieApprovalState", parseInt(res.responseText, 10), false, "\/", false, false);
            }
            ANGEL.eu.check();
        },
        failure: function(res) { }
    },

    //check if we need to prompt for approval based on state
    check: function() {
        var modalTitle = ANGEL.lang["PleaseRead"];
        var modalIcon = "info";
        var modalBody = '<p>' + ANGEL.lang["Cookies1"] + '</p><p>' + ANGEL.lang["Cookies2"] + '</p>' + ANGEL.lang["Cookies3"] + '<p>' + ANGEL.lang["Cookies4"] + '</p>';

        var NO_ACCOUNT_COOKIE_APPROVED = 1,
        ACCT_COOKIE_APPROVED = 2,
        NO_ACCOUNT_COOKIE_UNAPPROVED = 3,
        ACCOUNT_COOKIE_UNAPPROVED = 4,
        OFF = 0;

        var cookieApprovalState = parseInt(ANGEL.eu.getCookie("CookieApprovalState"), 10);

        switch (cookieApprovalState) {
            case NO_ACCOUNT_COOKIE_APPROVED:
                //authentication status changed from what we think it is, try again...
                if (ANGEL.eu.isAuthenticated()) {
                    ANGEL.eu.loadApprovalStateAndCheck(true, "NO_ACCOUNT_COOKIE_APPROVED");
                }
                break;
            case ACCT_COOKIE_APPROVED:
                //authentication status changed from what we think it is, try again...
                if (!ANGEL.eu.isAuthenticated()) {
                    ANGEL.eu.loadApprovalStateAndCheck(true, "ACCT_COOKIE_APPROVED");
                }
                break;
            case NO_ACCOUNT_COOKIE_UNAPPROVED:
                //authentication status changed from what we think it is, try again... else get approval
                if (ANGEL.eu.isAuthenticated()) {
                    ANGEL.eu.loadApprovalStateAndCheck(true, "NO_ACCOUNT_COOKIE_UNAPPROVED");
                } else {
                    var cookiesApproved = function() {
                        var yearFromNow = new Date();
                        yearFromNow.setDate(yearFromNow.getDate() + 365);
                        //set anon cookie and state
                        ANGEL.eu.setCookie("CookiesApproved", 1, yearFromNow, "\/", false, false);
                        ANGEL.eu.setCookie("CookieApprovalState", 1, false, "\/", false, false);
                    }
                    if (ANGEL.eu.doCheck) {
                        ANGEL._modal.confirm(modalBody, modalIcon, modalTitle, function(bOk) { bOk ? cookiesApproved() : ANGEL.eu.endSession() }, { lblOK: ANGEL.lang["Agree"], lblCancel: ANGEL.lang["Decline"] });
                    }
                    ANGEL.eu.doCheck = true;
                }
                break;
            case ACCOUNT_COOKIE_UNAPPROVED:
                //authentication status changed from what we think it is, try again... else get approval
                if (!ANGEL.eu.isAuthenticated()) {
                    ANGEL.eu.loadApprovalStateAndCheck(true, "ACCOUNT_COOKIE_UNAPPROVED1");
                } else {
                    var cookiesApproved = function() {
                        var yearFromNow = new Date();
                        yearFromNow.setDate(yearFromNow.getDate() + 365);
                        //set anon cookie and state for auth approval
                        ANGEL.eu.setCookie("CookiesApproved", 1, yearFromNow, "\/", false, false);
                        ANGEL.eu.setCookie("CookieApprovalState", 2, false, "\/", false, false);
                        //force new value into the database
                        ANGEL.eu.loadApprovalStateAndCheck(true, "ACCOUNT_COOKIE_UNAPPROVED2");
                    }
                    if (ANGEL.eu.doCheck) {
                        ANGEL._modal.confirm(modalBody, modalIcon, modalTitle, function(bOk) { bOk ? cookiesApproved() : ANGEL.eu.endSession() }, { lblOK: ANGEL.lang["Agree"], lblCancel: ANGEL.lang["Decline"] });
                    }
                    ANGEL.eu.doCheck = true;
                }
                break;
            case OFF: //0 OFF - do nothing for the rest of the session via checking session cookie regardless of auth.
            default:
                //Do nothing.
        }
    },

    preview: function() {
        var modalTitle = ANGEL.lang["PleaseRead"];
        var modalIcon = "info";
        var modalBody = '<p>' + ANGEL.lang["Cookies1"] + '</p><p>' + ANGEL.lang["Cookies2"] + '</p>' + ANGEL.lang["Cookies3"] + '<p>' + ANGEL.lang["Cookies4"] + '</p>';
        ANGEL._modal.confirm(modalBody, modalIcon, modalTitle, "", { lblOK: ANGEL.lang["Agree"], lblCancel: ANGEL.lang["Decline"] });
    },

    //check if the user is authenticated
    isAuthenticated: function() {
        if (ANGEL.user && ANGEL.user.username != '') {
            return true;
        } else {
            return false;
        }
    },

    endSession: function() {
        //make cookie for anon user expire after session
        ANGEL.eu.setCookie("CookiesApproved", 0, false, "\/", false, false);
        //set up to call old school logout method in 5 secs just in case ajax does not work
        setTimeout(function() { document.location.replace(ANGEL.config.root + "signon/logout.asp"); }, 10000);
        //use ajax to call logout page then reload the interface, so we bypass the logout page in the UI
        YAHOO.util.Connect.asyncRequest("GET", ANGEL.config.root + "signon/logout.asp", {
            success:
					function() {
					    //Call a .NET page to end the user's .NET session
					    YAHOO.util.Connect.asyncRequest("GET", ANGEL.config.root + "signon/logout.aspx", { success: function() { document.location.replace(ANGEL.config.optOutUrl || ANGEL.config.sourceDomain || ANGEL.config.root); } });
					}
        });
    },

    setCookie: function(name, value, expires, path, domain, secure) {
        document.cookie = name + "=" + escape(value) +
        ((expires) ? "; expires=" + expires.toUTCString() : "") +
        ((path) ? "; path=" + path : "") +
        ((domain) ? "; domain=" + domain : "") +
        ((secure) ? "; secure" : "");
    },

    getCookie: function(name) {
        var dc = document.cookie;
        var prefix = name + "=";
        var begin = dc.indexOf("; " + prefix);
        if (begin == -1) {
            begin = dc.indexOf(prefix);
            if (begin != 0)
                return null;
        }
        else {
            begin += 2;
        }
        var end = document.cookie.indexOf(";", begin);
        if (end == -1)
            end = dc.length;
        return unescape(dc.substring(begin + prefix.length, end));
    }
}

/***********************************************************************
* Instant Messaging Functions
***********************************************************************/
ANGEL.ui.live = {
	currentIMWindow:null,

	openIMWindow:function(){
	    ANGEL.ui.live.stopUniversalIMListener();
		ANGEL.ui.live.currentIMWindow = window.open(ANGEL.config.root + 'Live/im/default.aspx', 'ANGELIM', 'width=600,height=400,resizable=1,toolbar=0,scrollbars=no,top=100,left=250,screenY=150,screenX=250'); 
		ANGEL.ui.live.waitForIMWindowToClose(ANGEL.ui.live.restartUniversalIMListener);
	},

	restartUniversalIMListener:function(delay, override){
		var startUniversalIMListener = function(override){
			//If they just refreshed the IM window or it's still open, don't try to connect here
			if(ANGEL.ui.live.currentIMWindow && ANGEL.ui.live.currentIMWindow.closed){
				var universalIMClient = document.getElementById('universalIMClient');
				if(!override){
					override = false;
				}
				if(universalIMClient){
					universalIMClient.src = ANGEL.config.root + "Live/IM/IMPresenceOnly.aspx?forceAJAX=true&override=" + override;
				}
			}
		};
		var waitTime = 1000;
		if(delay){
			waitTime = delay;
		}
		if(!override || override == "undefined"){
			override = false;
		}
		ANGEL.ui.live.stopUniversalIMListener();
		setTimeout(function() { startUniversalIMListener(override); }, waitTime);
	},

    waitForIMWindowToClose:function(callback){
        function isIMClosed(){
            return ANGEL.ui.live.currentIMWindow && ANGEL.ui.live.currentIMWindow.closed;
        }
        
        function handleIMClosed(){
            if(isIMClosed()){
                callback();
            }
            else{
                setTimeout(function() { handleIMClosed(); }, 1000);
            }
        }
        
        handleIMClosed();
    },

	stopUniversalIMListener:function(){
		var universalIMClient = document.getElementById('universalIMClient');
		if(universalIMClient){
			universalIMClient.src = "";
		}
	},

	truncateMessageText:function(message){
		if(message.length > 100){
			message = message.substring(0, 97) + "...";
		}
		return message;
	},

	URLEncode:function(str){
		return escape(str.replace("%", "%25").replace("+", "%2B"));
	},

	randomString:function() {
		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
		var string_length = 21;
		var randomstring = '';
		for (var i=0; i<string_length; i++) {
			var rnum = Math.floor(Math.random() * chars.length);
			randomstring += chars.substring(rnum,rnum+1);
		}
		return randomstring;
	},

	showIMNotifyWindow:function(fromUser, message){
		var imNotifyWindow = window.open(ANGEL.config.root + "Live/IM/newIMNotify.aspx?fromUser=" + ANGEL.ui.live.URLEncode(fromUser) + "&message=" + ANGEL.ui.live.URLEncode(ANGEL.ui.live.truncateMessageText(message)), "imNotify" + ANGEL.ui.live.randomString(), "width=250,height=100,top=" + (self.screen.availHeight - 120) + ",left=" + (self.screen.availWidth - 260), false);
	}
};

/***********************************************************************
* Wire up events and initialize
***********************************************************************/
angelevent.register("updateTimeout","site_main_load",ANGEL.ui.main.onLoad);
YAHOO.util.Event.onDOMReady(ANGEL.ui.init);
//YAHOO.util.Event.on(window,"resize",ANGEL.ui.onResize);
YAHOO.util.Event.on(window,"load",ANGEL.ui.onResize);
// resize events do not always get fired, this timed function conditionally runs resize code if width or height has changed

var isIphone = navigator.userAgent.toLowerCase().indexOf('iphone') >= 0;

//The iPhone screen can't be resized. The resize function adds substantial delay to the user's browsing experience and causes the content frame to bounce.
if (!isIphone) {
    setInterval(function() { ANGEL.ui.onResize(true); }, 1000);
}

//add a reference to the dialog script
//document.write('<' + 'script type="text\/javascript" language="javascript" src="' + ANGEL.config.root + 'jscript\/dialog.js"><\/' + 'script>');
