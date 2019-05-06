var garrTokens = new Array();
var garrTokenValues = new Array();
garrTokens[0] = 'USER_ID';
garrTokenValues[0] = 'WCS5056';
garrTokens[1] = 'USER_KEY';
garrTokenValues[1] = 'wcs5056';
garrTokens[2] = 'LOGIN_NAME';
garrTokenValues[2] = 'WCS5056';
garrTokens[3] = 'USER:UID';
garrTokenValues[3] = 'WCS5056';
garrTokens[4] = 'USER:USERNAME';
garrTokenValues[4] = 'WCS5056';
garrTokens[5] = 'USER:FULLNAME';
garrTokenValues[5] = 'WILLIAM STALNAKER';
garrTokens[6] = 'USER:FIRSTNAME';
garrTokenValues[6] = 'WILLIAM';
garrTokens[7] = 'USER:LASTNAME';
garrTokenValues[7] = 'STALNAKER';
garrTokens[8] = 'USER:EMAIL';
garrTokenValues[8] = 'WCS5056@PSU.EDU';
garrTokens[9] = 'USER:ACCOUNTTYPE';
garrTokenValues[9] = '0';
garrTokens[10] = 'USER:ACCOUNTRIGHTS';
garrTokenValues[10] = '4';
garrTokens[11] = 'USER_NAME';
garrTokenValues[11] = 'WILLIAM STALNAKER';
garrTokens[12] = 'FIRST_NAME';
garrTokenValues[12] = 'WILLIAM';
garrTokens[13] = 'LAST_NAME';
garrTokenValues[13] = 'STALNAKER';
garrTokens[14] = 'SECTION_ID';
garrTokenValues[14] = '';
garrTokens[15] = 'SECTION:TYPE';
garrTokenValues[15] = '';
garrTokens[16] = 'SECTION:TITLE';
garrTokenValues[16] = '';
garrTokens[17] = 'SECTION:INSTRUCTORID';
garrTokenValues[17] = '';
garrTokens[18] = 'SECTION:INSTRUCTOR';
garrTokenValues[18] = '';
garrTokens[19] = 'COURSE_ID';
garrTokenValues[19] = '';
garrTokens[20] = 'COURSE_TITLE';
garrTokenValues[20] = '';
garrTokens[21] = 'ESC_USER_ID';
garrTokenValues[21] = 'WCS5056';
garrTokens[22] = 'ESC_USER_NAME';
garrTokenValues[22] = 'WILLIAM+STALNAKER';
garrTokens[23] = 'ESC_COURSE_ID';
garrTokenValues[23] = '';
garrTokens[24] = 'ESC_COURSE_TITLE';
garrTokenValues[24] = '';
garrTokens[25] = 'FD';
garrTokenValues[25] = 'file:///A|';
garrTokens[26] = 'HD';
garrTokenValues[26] = 'file:///C|';
garrTokens[27] = 'CD';
garrTokenValues[27] = 'file:///D|';
garrTokens[28] = 'DVD';
garrTokenValues[28] = 'file:///D|';
garrTokens[29] = 'PROTOCOL';
garrTokenValues[29] = 'https://';
garrTokens[30] = 'SERVER_NAME';
garrTokenValues[30] = 'cms.psu.edu';
garrTokens[31] = 'SERVER_BASE';
garrTokenValues[31] = 'https://cms.psu.edu';
garrTokens[32] = 'COURSE_PATH';
garrTokenValues[32] = '';
garrTokens[33] = 'IMAGE_PATH';
garrTokenValues[33] = '/Images/';
garrTokens[34] = 'ICON_PATH';
garrTokenValues[34] = '/Images/Icons/';
garrTokens[35] = 'GOTO';
garrTokenValues[35] = '/section/content/default.asp?WCU=CRSCNT&WCI=GOTO&MATCH=';
garrTokens[36] = 'SHORTCUT';
garrTokenValues[36] = '/section/content/default.asp?WCU=CRSCNT&WCI=pgDisplay&ENTRY_ID=';
garrTokens[37] = 'ANGEL:NAME';
garrTokenValues[37] = 'Penn State ANGEL';
garrTokens[38] = 'ANGEL:TIMEOUT';
garrTokenValues[38] = '90';
garrTokens[39] = 'ANGEL:NAVBUTTONS';
garrTokenValues[39] = 'true';
garrTokens[40] = 'ANGEL:FRAMES';
garrTokenValues[40] = 'true';
garrTokens[41] = 'ANGEL:VROOT';
garrTokenValues[41] = '/';
garrTokens[42] = 'ANGEL:UPLOADPATH';
garrTokenValues[42] = '/AngelUploads/';
garrTokens[43] = 'ONCLICK';
garrTokenValues[43] = 'onclick';
garrTokens[44] = 'ONMOUSEDOWN';
garrTokenValues[44] = 'onmousedown';
garrTokens[45] = 'ONMOUSEUP';
garrTokenValues[45] = 'onmouseup';
garrTokens[46] = 'EXACTMATCH';
garrTokenValues[46] = '0';
garrTokens[47] = 'THREAD_FRAME_AREA';
garrTokenValues[47] = 'LEFT';

function setToken(sName, sValue) {
	for (var x=0; x < garrTokens.length; x++) {
	  if (garrTokens[x].toLowerCase() == sName.toLowerCase()) {
	    garrTokenValues[x] = sValue;
	    return;
	  }
	}
	garrTokens[garrTokens.length] = sName;
	garrTokenValues[garrTokenValues.length] = sValue;	
}

function validTokenPage(win) {
	var sCmp = '';
	try {
		sCmp = win.document.location.href.toLowerCase();
	} catch(e) { }
	if (sCmp != '' && win && !win.noTokens) {
		if (sCmp.indexOf('.asp') == -1) {
			return true;
		} else if (sCmp.indexOf('edit')!=-1) {
			return false;
		} else if (sCmp.indexOf('newforum.aspx')!=-1) {
			return false;
		} else if (sCmp.indexOf('tools/envvars')!=-1) {
			return false;
		} else if (sCmp.indexOf('/section/assessment/question/editors/')!=-1) {
			return false;
		} else {
			return true;
		}
	}
	return false;
}

function _replaceTokens(strText, bLinkMode) 
{
	var sText = new String(strText);
	var sPrefix = (bLinkMode)?'^.*\\$':'\\$';
	var sSuffix = '\\$';
	for (var z=0; z < garrTokens.length; z++) 
	{
		var oReg = new RegExp();
		oReg.ignoreCase = true;
		oReg.global = true;
		oReg.compile(sPrefix + garrTokens[z] + sSuffix, 'gi');
		sText = sText.replace(oReg, garrTokenValues[z]);
		oReg = null;
	}
	return sText;
}
function replaceTokens(win, nRecurse) {
	try {
	    if (!win || !win.document || !win.document.body) { return; }
		var oElem = null;
		if (!win.noTokens) {
			if (win.document.body.innerHTML.match(/\$[^\$\s< >]*\$/gi)) {
				//alert('replacing text nodes');
				var allTags = (win.document.all)?win.document.all:win.document.getElementsByTagName("*");
				var linkAttrib = {"href":true, "src":true, "movie":true};
				for (var z=0; z < allTags.length; z++) {
					// First replace tokens in any text nodes that are children of this node
					if(allTags[z].tagName == "TEXTAREA" && allTags[z].id == "queryTextBox")
					{
					    // do not parse the textbox for query manager (replaces tokens we need)
					    continue;
					}
					if(allTags[z].tagName == "SCRIPT")
					{
					    if(allTags[z].innerHTML.indexOf('$') != -1 && allTags[z].innerHTML.indexOf('/*Detokenize*/') != -1)
					    {
					        allTags[z].text = _replaceTokens(allTags[z].text);
					    }
					}
					if (allTags[z].childNodes) {
						for (var x=0; x<allTags[z].childNodes.length; x++) {
							var oNode = allTags[z].childNodes[x];
							if (oNode.nodeType==3 && oNode.nodeValue.indexOf('$')!=-1) {
								allTags[z].childNodes[x].nodeValue = _replaceTokens(allTags[z].childNodes[x].nodeValue);
							}
						}
					}
					// Next look for tokens in attributes of this node
					if (allTags[z].attributes) {
						if (!allTags[z].hasAttributes) { // If IE
							for (var a in allTags[z].attributes) {
								var attrib = allTags[z].getAttribute(a);
								if (attrib && typeof(attrib)=='string' && (attrib.indexOf('$')!=-1)  && !(attrib.name=='src' && attrib.value.indexOf('Objects/IMS/SCORMLaunch.aspx')!=-1)) { 
									allTags[z].setAttribute(a, _replaceTokens(attrib, linkAttrib[a]));
								}
							}
						} else if (allTags[z].hasAttributes()) { // DOM compliant model
							for (var a=0; a < allTags[z].attributes.length; a++) {
								var attrib = allTags[z].attributes[a];
								if (attrib && attrib.value && typeof(attrib.value)=='string' && (attrib.value.indexOf('$')!=-1) && !(attrib.name=='src' && attrib.value.indexOf('Objects/IMS/SCORMLaunch.aspx')!=-1)) { 
									//alert('replace ('+typeof(attrib.value) + ') ' + attrib.name+'='+attrib.value + '\n' + _replaceTokens(attrib.value, false));
									attrib.value = _replaceTokens(attrib.value, false);
								}
							}
						}
					}
				}
			}
		}
	} catch (e) { }	
	try {
		if (nRecurse != 0) {
			nRecurse--;			
			for (var y=0; y < win.frames.length; y++) {
				replaceTokens(win.frames[y], nRecurse)
			}
		}
	} catch(e) { }
}

function replaceJSObjectTokens(jsObject)
{
    for(var field in jsObject)
    {
        if(typeof(jsObject[field]) == "string") {
            jsObject[field] = _replaceTokens(jsObject[field]);
        }
    }
}


