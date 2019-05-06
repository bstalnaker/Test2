/******************************************************************************
  Author & Copyright: Brian J Clifton
  Url: http://www.advanced-web-metrics.com

  This script is NOT free to use

  Hack for Google Analytics auto-tracking of 
   external links - tracked as /outbound/url-of-external-site
   file downloads - tracked as /downloads/filename
   mailto:        - tracked as /mailto/email-address-clicked

   PLUS: Event trigger so that single page visits of >30 seconds are not treated as bounces

  VERSION:
  v1.30, 11-Aug-2011 ***DEV VERSION***

  USAGE:
  For use with ga.js(async) only. You need to do 4 straightforward things for this to work:
  1. Install this script in your website root directory and reference it in your GATC
      - as decribed at http://www.advanced-web-metrics.com/blog/auto-tracking-file-downloads-outbound-links/
  2. Replace the domain listed in the array "localDomains" on line 64 (shown as YOUR-DOMAIN.COM) to your website domain.
	   Any link NOT to localDomains will be considered an outbound link
     - only use your main domain. Do not include a subdomain e.g. www., shop., secure., - unless you specifically
       wish to restrict the operation of this script to a subdomain only
	 - add more domains as needed if you wish these to be treated as local e.g. YOUR-DOMAIN.CO.UK (not case sensitive)
  3. Optional: Scroll down and modify the following arrays to meet your requirments: extDoc, trackerObject
  4. Optional: Scroll down and modify the function addLinkerEvents to meet your requirements.
	 NOTE: Only change the values of a, b, c, and bounceTime in this line:
	 function init(){ addLinkerEvents(a,b,c,bounceTime,localDomains,extDoc));} ;
  
     where:
     a = 1 or 0, use Event Tracking for external links (1), or use virtual Pageview tracking (0)
     b = 1 or 0, use Event Tracking for file downloads (1), or use virtual Pageview tracking (0)
     c = 1 or 0, use Event Tracking for mailto links (1), or use virtual Pageview tracking (0)
     bounceTime = NN seconds, uses Event Tracking for single page visits >30 secs, or do not modify (0)
		This is tracked as a "dummy" event with category=Non-bounced, action=30 secs i.e. this not intended for analysis 

  DISCLAIMER:
  All scripts presented have been tested and validated by the author and are
  believed to be correct as of the date of publication or posting. The Google
  Analytics software on which they depend is subject to change, however; and
  therefore no warranty is expressed or implied that they will work as
  described in the future. Always check the most current Google Analytics
  documentation.

  UPDATES:
  v 1.30
  - fixed bug with multi-objects
  
  v 1.20
  - added case checking so that e.g. *.PDF and *.pdf files are tracked

  v 1.10
  - fixed 'timeout' undefined error that was stopping the bounce rate modifier working correctly
  - added a catch for bookmarked links to be ignored - previously logged as 'undefined' 
******************************************************************************/
/**
 * Thanks to Nick Mikailovski (Google) for initial discussions and Tomas Remotigue for additional development.
 */

// --Setup information --//
	// List of domains that should NOT be treated as an outbound link. Include at least your own domain here.
	var localDomains = ["google-analytics.com", // DO NOT REMOVE THIS ITEM
	                 "worldcampus.psu.edu"];  

	// List of file extensions on your site. Add/edit as you require
	var extDoc = [".doc",".xls",".ppt",".exe",".zip",".txt",".pdf"];

// for Dev version
	// For use with *multiple* tracker objects i.e. when calling multiple GA accounts/profiles on a single page.
	// For when and how to do this, see: www.advanced-web-metrics.com/blog/2009/03/30/roll-up-reporting-in-google-analytics/
	// Do NOT edit if you only use the single deafult GA tracker object
	var trackerObject = [""];	// Replace empty quotes with your second tracker name e.g. "tracker2"
					// Add extra trackers as quoted, comma separated list e.g. "tracker3", "tracker4" etc.
					// An example with 3 tracker objects, in addition to the default, would be:
					//
					//      var trackerObject = ["t2", "t3", "t4"];
					//
					// You can add as many tracker objects as you wish

	function init() {
		addLinkerEvents(1,1,1,30,localDomains,extDoc); // change first 4 params to match your requirements as described above
	}

// --END Setup. Do NOT edit below this line UNLESS you wish to change the Event Category name or Virtual Pageview paths --//


window.onload=init;var newtimeout;
function addLinkerEvents(h,i,f,a,g){a!=0&&(milliTimeout=a*1E3,newtimeout=a+" secs",setTimeout("_gaq.push(['_trackEvent', 'Non-bounced', newtimeout]);",milliTimeout));
// 'Non-bounced' is the event category name used to collect hits so that a single pageview visit is not considered a bounced visit after nn seconds.
// You can change this name to whatever you wish. The data for this event is not relevant for analysis

for(var a=document.getElementsByTagName("a"),b=0;b<a.length;b++){var d=a[b].getAttribute("onclick");if(d!=null&&(d=String(d),d.indexOf("urchinTracker")>-1||d.indexOf("_trackPageview")>-1))continue;if(a[b].href.toLowerCase().indexOf("mailto:")!=-1){var e=a[b].href.split(":");if(trackerObject[0]!==""){multiObject=
"";for(var c=0;c<trackerObject.length;c++)multiObject+=getAsync(trackerObject[c],f,"mailto",e[1],d);multiObject+=getAsync("",f,"mailto",e[1],d);a[b].setAttribute("onclick",multiObject)}else a[b].setAttribute("onclick",getAsync("",f,"mailto",e[1],d))}
// "mailto" is the Event Category or Virtual pageview name used for mailto links. You can change this name to whatever you wish.
// there are 3 instances of "mailto" in the above code (do not confuse with "mailto:"). 

else{e=!0;for(c=0;c<g.length;c++)a[b].href.toLowerCase().indexOf(g[c].toLowerCase())!=-1&&(e=!1);if(e)if(e=a[b].href.split("//"),trackerObject[0]!==""){multiObject="";for(c=0;c<trackerObject.length;c++)multiObject+=getAsync(trackerObject[c],h,"outbound",
e[1],d);multiObject+=getAsync("",h,"outbound",e[1],d);a[b].setAttribute("onclick",multiObject)}else a[b].setAttribute("onclick",getAsync("",h,"outbound",e[1],d));
// "outbound" is the Event Category or Virtual pageview name used for outbound links. You can change this name to whatever you wish.
// there are 3 instances of "outbound" in the above code. 

else for(var j=0;j<extDoc.length;j++)if(a[b].href.toLowerCase().indexOf(extDoc[j].toLowerCase())!=-1)if(e=a[b].href.split(document.domain+"/"),trackerObject[0]!==""){multiObject="";for(c=0;c<trackerObject.length;c++)multiObject+=getAsync(trackerObject[c],i,"downloads",e[1],d);multiObject+=getAsync("",i,"downloads",e[1],d);a[b].setAttribute("onclick",
multiObject)}else{a[b].setAttribute("onclick",getAsync("",i,"downloads",e[1],d));break}}}}
// "downloads" is the Event Category or Virtual pageview name used for file downloads links. You can change this name to whatever you wish.
// there are 3 instances of "downloads" in the above code. 
// Nothing to chane below this...

function getAsync(h,i,f,a,g){var g=g!=null?g+";":"",b="";return h!==""?"_gaq.push(["+(i?"'"+h+"._trackEvent','"+f+"','Click','"+a+"'":"'"+h+"._trackPageview','/"+f+"/"+a+"'")+"]); "+g:"_gaq.push(["+(i?"'_trackEvent','"+f+"','Click','"+a+"'":"'_trackPageview','/"+f+"/"+a+"'")+"]); "+g};