if(window.ActiveXObject&&!window.XMLHttpRequest){
	window.XMLHttpRequest=function(){
		var msxmls=new Array('Msxml2.XMLHTTP.5.0','Msxml2.XMLHTTP.4.0','Msxml2.XMLHTTP.3.0','Msxml2.XMLHTTP','Microsoft.XMLHTTP');
		for(var i=0;i < msxmls.length;i++){
			try{return new ActiveXObject(msxmls[i]);}catch(e){}
		}
		return null;
	};
}

if(!window.tree){
document.writeln("<"+"style type=\"text/css\">");
document.writeln("a.toggle,a:hover.toggle{display:block;position:absolute;top:0.4em;left:-1.1em;width:0.85em;height:0.85em;overflow:hidden;font-family:courier,monospace;font-weight:bold;font-size:1em;line-height:0.85em;border-style:outset;border-width:1px;text-decoration:none !important;text-align:center;padding:0px;margin:0px;color:black;background-color:white;background-repeat:no-repeat;background-position:center center;background-image:url(/AngelThemes/icons/map/toggle.png); }");
document.writeln("ul.mktree,ul.mktree ul{margin:0px;padding:0px 0px 0px 1.2em;}");
document.writeln("ul.mktree li,ul.mktree ul li{list-style:none !important;padding:2px;margin:0px;position:relative;}");
document.writeln("ul.mktree li.collapsed ul{display:none !important;}");
document.writeln(".treeControls{font-family:arial;font-size:85%;padding-left:0.2em;}");
document.writeln("<"+"/style>");

window.tree={}

tree._focused=null;

tree._selected=null;

tree.select=function(el){
	if(tree._selected){tree.unselect();}
	if(el&&typeof(el).toUpperCase()=="STRING"){el=document.getElementById(el);}
	if(el){tree.addClass(el,"selected");tree._selected=el;}
}

tree.unselect=function(){
	if(tree._selected&&tree._selected!=null){tree.removeClass(tree._selected,"selected");tree._selected=null;}
}

tree.addEvent=function(o,e,f){
		if(o.addEventListener){o.addEventListener(e,f,true);return true;}
		else if(o.attachEvent){return o.attachEvent("on"+e,f);}
		else{return false;}
}

tree.regexToggle=new RegExp("^\s*\<(SPAN|span)\s*\>\s*[\-\+]\s*\</(SPAN|span)\s*\>\s*$");
tree.regexToggle.global=true;
tree.regexToggle.ignoreCase=true;

tree.blur=function(ev){
	var el=ev;//(!ev)?tree.selected:(ev.originalTarget)?ev.originalTarget:(ev.srcElement)?ev.srcElement:ev;
	if(!el){return;}
	if(tree._focused&&tree._focused.id&&tree._focused.id==el.id){tree._focused=null;}
}

tree.focus=function(ev){
	var el=ev;
	if(tree._focused){tree.blur(tree._focused);}
	if(!el){return;}
	if(!el.id||el.id==""){el.id=tree.newId(el.tagName.toLowerCase());}
	if(el.tagName.toUpperCase()!="A"&&!el.getAttribute("tabindex")){el.setAttribute("tabindex","-1");}
	try{el.focus();}catch(e){}
	tree._focused=el;
}

tree.afterFetch=function(oXMLHTTP,sURL,elTarget,elFocus,bWait){
	if(window.afterFetch){
		window.afterFetch(oXMLHTTP,sURL,elTarget,elFocus,bWait);
	}else{
		elTarget.innerHTML=oXMLHTTP.responseText;
		tree.initNodes(elTarget);
		if(elFocus){tree.focus(elFocus);}
	}
}

tree.fetch=function(sURL,elTarget,elFocus,bWait){
	try{
		if(!bWait){
			var oXMLHTTP=new XMLHttpRequest;
			oXMLHTTP.open('GET',sURL,true);
			oXMLHTTP.onreadystatechange=function(){
				if(oXMLHTTP.readyState==4){
					tree.afterFetch(oXMLHTTP,sURL,elTarget,elFocus,bWait);
				}
			}
			oXMLHTTP.send('');
		}else{
			var oXMLHTTP=new XMLHttpRequest;
			oXMLHTTP.open('GET',sURL,false);
			oXMLHTTP.send('');
			tree.afterFetch(oXMLHTTP,sURL,elTarget,elFocus,bWait);
		}
	}catch(e){
		if(elTarget&&elTarget.innerHTML){elTarget.innerHTML="<div>error retrieving data</div>";}
	}
}

tree.addTreeControls=function(ul){
	var el=null;
	//make sure that the tree ul has an id
	if(!ul.id||ul.id==""){ul.id=tree.newId("ul");}
	//check if controls are disabled
	if(ul.getAttribute("controls")=="false"){return;}
	//if we have already added the controls then exit now
	if(ul.previousSibling&&ul.previousSibling.id=="controls"+ul.id){return;}
	//create a div element for tree controls
	var div=document.createElement("div");
	div.id='controls'+ul.id;
	div.className="treeControls";
	//expand all link
	el=document.createElement("a");
	el.id='expandAll'+ul.id;
	el.setAttribute("target","_self");
	el.setAttribute("href","javascript:tree.expandAll('"+ul.id+"',true)");
	var expandAllText = "expand all";
	if(expandAllLocalized != undefined) {
	    expandAllText = expandAllLocalized;
	}
	el.appendChild(document.createTextNode(expandAllText));
	div.appendChild(el);
	//divider
	el=document.createElement("span");
	el.innerHTML="&nbsp;|&nbsp;";
	div.appendChild(el);
	//collapse all link
	el=document.createElement("a");
	el.id='collapseAll'+ul.id;
	el.setAttribute("target","_self");
	el.setAttribute("href","javascript:tree.collapseAll('"+ul.id+"')");
	var collapseAllText = "collapse all";
	if(collapseAllLocalized != undefined) {
	    collapseAllText = collapseAllLocalized;
	}
	el.appendChild(document.createTextNode(collapseAllText));
	div.appendChild(el);
	//add control div before ul of tree
	ul.parentNode.insertBefore(div,ul);
}

tree.addToggle=function(li){
	if(!li){return;}
	if(li.childNodes&&li.childNodes.length>0&&li.childNodes[0].id&&li.childNodes[0].id=='toggle'+li.id){li.removeChild(li.firstChild);}
	var sTitle="+/-";
	for(var x=0;x<li.childNodes.length;x++){
		var n=li.childNodes[x];
		if(n.tagName&&n.tagName=="UL"&&n.getAttribute("title")){sTitle+=" "+n.getAttribute("title");}
	}
	var el=document.createElement("a");
	el.id='toggle'+li.id;
	el.setAttribute("target","_self");
	el.setAttribute("href","javascript:tree.toggle('"+li.id+"')");
	el.setAttribute("title",sTitle);
	el.className="toggle";
	var txt=document.createTextNode((tree.hasClass(li,"expanded"))?"-":"+");
	tree.addClass(el,(tree.hasClass(li,"expanded"))?"toggleExpanded":"toggleCollapsed");
	var span=document.createElement("span");
	span.appendChild(txt);
	while(el.childNodes.length>0){el.removeChild(el.childNodes[0]);}
	el.appendChild(span);
	li.insertBefore(el,li.childNodes[0]);
}

tree.hasClass=function(oTag,sClass){
	if(oTag&&oTag.className&&oTag.className!=''&&sClass&&sClass!=null&&sClass!=''){
		var arrClass=oTag.className.split(/\s+/);
		for(var x=0;x < arrClass.length;x++)
		if(arrClass[x]==sClass){return true;}
	}
	return false;
}

tree.addClass=function(oTag,sClass){
	var sRtn=''+oTag.className;
	if(!oTag.className||oTag.className==''){
		sRtn=sClass;
	}else{
		var arrClass=oTag.className.split(/\s+/);
		for(var x=0;x < arrClass.length;x++)
		if(arrClass[x]==sClass)return oTag.className;
		sRtn=oTag.className+' '+sClass;
	}
	oTag.className=sRtn;
	return sRtn;
}

tree.removeClass=function(oTag,sClass){
	var sRtn='';
	if(oTag.className&&oTag.className!=''){
		var arrClass=oTag.className.split(/\s+/);
		for(var x=0;x < arrClass.length;x++)
			if(arrClass[x]!=sClass)sRtn+=' '+arrClass[x];
		sRtn.substring(1,sRtn.length);
	}
	oTag.className=sRtn
	return sRtn;
}

tree.expandAll=function(treeId,bRefresh){
		var arrTmp;
		var colDone=new Object();
		var ul=document.getElementById(treeId);
		if(!ul){return;}
		setTimeout(function(){
		//if a source is specified then refresh the tree(blocking)
		if(bRefresh&&ul.getAttribute("source")&&(ul.getAttribute("source")!="")){
			var sURL=ul.getAttribute("source");
			sURL+=(sURL.indexOf("?")==-1)?"?":"&"
			sURL+="ts="+tree.newId("ts")+"&expanded=true&recursive=true";
			tree.fetch(sURL,ul,null,true);
		}
		//now grab missing ul sections(up to three levels deep)
		bFound=true;
		var nLoops=0;
		while(bFound&&(nLoops<5)){
			bFound=false;
			nLoops++;
			var uls=ul.getElementsByTagName("ul");
			var arrUL=new Array();
			for(var x=0;x<uls.length;x++){
				if(!uls[x].id||uls[x].id==''){uls[x].id=tree.newId("ul");}
				if(!colDone[uls[x].id]&&uls[x].getAttribute("source")&&uls[x].getAttribute("source")!=""&&(bRefresh||uls[x].getElementsByTagName("li").length==0)){arrUL[arrUL.length]=uls[x].id;}
			}
			for(var x=0;x<arrUL.length;x++){
				bFound=true;
				var el=document.getElementById(arrUL[x]);
				var sURL=el.getAttribute("source");
				sURL+=(sURL.indexOf("?")==-1)?"?":"&"
				sURL+="ts="+tree.newId("ts")+"&expanded=true&recursive=true";
				colDone[el.id]=true;
				tree.fetch(sURL,el,null,true);
			}
			uls=null;
			arrUL=null;
		}
		//now expand li elements
		var lis=ul.getElementsByTagName("li");
		var arrLI=new Array();
		for(var x=0;x<lis.length;x++){
			if(tree.hasClass(lis[x],"collapsed")){
				if(!lis[x].id||lis[x].id==''){lis[x].id=tree.newId("li");}
				arrLI[arrLI.length]=lis[x].id;
			}
		}
		for(var x=0;x<arrLI.length;x++){
			var el=document.getElementById(arrLI[x]);tree.expand(el,false,false,null);
		}
		tree.focus(document.getElementById(treeId))
		lis=null;
		arrLI=null;
	},0);
}

tree.collapseAll=function(treeId){
	var ul=document.getElementById(treeId);
	if(!ul){return;}
	var sDisplay=ul.style.display;
	setTimeout(function(){ul.style.display='none';},0);
	setTimeout(function(){
		var lis=ul.getElementsByTagName("li");
		for(var x=0;x<lis.length;x++){
		if(tree.hasClass(lis[x],"expanded")){
			if(!lis[x].id||lis[x].id==''){lis[x].id=tree.newId("li");}
			//setTimeout("tree.collapse(document.getElementById('"+lis[x].id+"'));",0);
			tree.collapse(document.getElementById(lis[x].id));
		}
	}
			ul.style.display=sDisplay;
	},0);
}

tree.expand=function(li,bRecursive,bRefresh,oFocus){
	tree.removeClass(li,'collapsed');
	tree.addClass(li,'expanded');
	var sText='';
	var el=li.childNodes[0];
	if(el&&el.innerHTML&&tree.regexToggle.test(el.innerHTML)){
		tree.removeClass(el,"toggleCollapsed");
		tree.addClass(el,"toggleExpanded");
		el.innerHTML="<SPAN>-</SPAN>";
	}
	var uls=li.getElementsByTagName("ul");
	for(var x=0;x<uls.length;x++){
		if(uls[x].tagName&&uls[x].tagName.toUpperCase()=="UL"&&uls[x].getAttribute("source")&&uls[x].getAttribute("source")!=""&&(bRecursive||uls[x].parentNode.id==li.id)){
			if(bRefresh||(uls[x].getElementsByTagName("li").length==0)){
				var dNow=new Date();
				var sURL=uls[x].getAttribute("source");
				sURL+=(sURL.indexOf("?")==-1)?"?ts="+dNow.getTime():"&ts="+dNow.getTime();
				sURL+=(bRecursive)?"&expanded=true&recursive=true":"&expanded=false&recursive=false";
				uls[x].innerHTML="<div class=\"loading\">loading ...</div>";
				tree.fetch(sURL,uls[x],oFocus,bRecursive);
			}
		}
	}
}

tree.makeVisible=function(elTarget){
	var el=elTarget;
	if(el&&!el.parentNode){el=document.getElementById(el);}
	if(!el){return false;}
	var par=el.parentNode;
	while(par){
		if(par.tagName&&par.tagName.toUpperCase()=="LI"&&tree.hasClass(par,"collapsed"))
			tree.expand(par,false,false,null);
		par=par.parentNode;
	}
	return true;
}

tree.collapse=function(li){
	tree.removeClass(li,'expanded');
	tree.addClass(li,'collapsed');
	var el=li.childNodes[0];
	if(el&&el.innerHTML&&tree.regexToggle.test(el.innerHTML)){
		tree.removeClass(el,"toggleExpanded");
		tree.addClass(el,"toggleCollapsed");
		el.innerHTML="<SPAN>+</SPAN>";
	}
}

tree.toggle=function(sId){
	var li=document.getElementById(sId);
	if(tree.hasClass(li,'collapsed'))
		tree.expand(li,false,false,li);
	else
		tree.collapse(li);
}

tree.newId=function(sPrefix){
	var sId='';
	while(sId==''||document.getElementById(sId))
		sId=sPrefix+Math.floor(Math.random()* 10000000);
	return sId;
}

tree.initNodes=function(el){
	var uls=el.getElementsByTagName("ul");
	for(var x=0;x<uls.length;x++){
		//only process if it has list items or a valid source attribute
		if(uls[x].getElementsByTagName("LI").length>0||(uls[x].getAttribute("source")&&uls[x].getAttribute("source")!="")){
			var li=uls[x].parentNode;
			//to allow uls nested in other tags uncomment the following line
			//while(li&&(!li.tagName||li.tagName.toUpperCase()!="LI")){li=li.parentNode;}
			if(li&&li.tagName&&li.tagName.toUpperCase()=="LI"){
				//force collapse if there is an empty ul element with a source attribute
				var bExpanded=(tree.hasClass(li,"expanded")&&uls[x].getElementsByTagName("LI").length>0)?true:false;
				if(!li.id||li.id==''){li.id=tree.newId("li");}
				if(bExpanded){
					tree.removeClass(li,'collapsed');
					tree.addClass(li,'expanded');
				}else{
					tree.removeClass(li,'expanded');
					tree.addClass(li,'collapsed');
				}
				tree.addToggle(li);
			}
		}
	}
}

tree.init=function(){
	var uls=document.getElementsByTagName("ul");
	for(var x=0;x<uls.length;x++){
		if(tree.hasClass(uls[x],'mktree')){
			if(!uls[x].id||uls[x].id==''){uls[x].id=tree.newId("ul");}
			if(uls[x].getAttribute("controls")=="true"){tree.addTreeControls(uls[x]);}
			tree.initNodes(uls[x]);
		}
	}
}

tree.addEvent(window,"load",tree.init);

}// end if(!window.tree)