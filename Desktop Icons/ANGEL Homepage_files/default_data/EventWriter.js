<!--
function buildhref(base, more)
{
	if (more.length > 0)
	{
		var x;
		if (base.indexOf('?') > -1) 
		{
			x = base + '&' + more;
		}
		else
		{
			x = base + '?' + more;
		}
		return x;
	}
	else
	{
		return base;
	}
}

function dateformat(dt)
{
	var m_names = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
	var curr_date = dt.getUTCDate();
	var curr_month = dt.getUTCMonth();
	var curr_year = dt.getUTCFullYear();
	var dtf = m_names[curr_month] + " " + curr_date + " " + curr_year;
	return dtf
}

function SRTElistEvents(root, divId) 
{
	var feed = root;
	var events = document.getElementById(divId);

	if (events.childNodes.length > 0) 
	{
		events.removeChild(events.childNodes[0]);
	}	  

	var UT = '';
	//if (feed.UserToken != null)
	//    { UT = feed.UserToken; }

	var listtitle1 = feed.Title;
	//var titleLinkHref = feed.href;
	var titleLinkHref = buildhref(feed.href, UT);


	titleLink = document.createElement('a');
	titleLink.setAttribute('href', titleLinkHref);
	titleLink.setAttribute('target', '_top');
	titleLink.appendChild(document.createTextNode(listtitle1));

	var myp1 = document.createElement('span')
	myp1.setAttribute ('class', 'headingspan')

	myp1.appendChild(titleLink);
	events.appendChild(myp1);

	// create a new unordered list
	var ul = document.createElement('ul');

	// loop through each event in the feed
	if (feed.EventEntries != null)
	{
		// fli = first list item,   fli2 first list item nesting level 2,  ful2 = first unordered list nesting level 2
		var fli = document.createElement('li');
		var ful2 = document.createElement('ul');
		var studentCount = 0;
		for (var i = 0; i < feed.EventEntries.length; i++) 
		{
			var fli2 = document.createElement('li');
			var entry = feed.EventEntries[i];

			if (entry.IsInstructor == '0')
			{
				if (studentCount == 0)
				{
					studentCount++;
					
					var subTitle = document.createElement('div');
					subTitle.appendChild(document.createTextNode("SRTE Forms Available for Completion"));
			
					fli.appendChild(subTitle);
					ul.appendChild(fli);
					ul.appendChild(ful2);
				}
				
				var title = entry.Title;
				var status = entry.Status;
				title = title + ' (' + status + ')';
				var entryLinkHref = buildhref(entry.href, UT);
				
				if ( (typeof entryLinkHref != 'undefined') && ( (status.toLowerCase() == 'open') || (status.toLowerCase() == 'pending') ) )
				{
					// if we have a link to the event, create an 'a' element
					var entryLink = document.createElement('a');
					entryLink.setAttribute('href', entryLinkHref);
					entryLink.setAttribute('target', '_top');
					title = title.replace('(Open)', '');
				    
					var duedatenode = document.createElement('div');
					duedatenode.appendChild(document.createTextNode('(Due : ' + dateformat(entry.EndDate) + ')'));
					duedatenode.style.cssText  = 'font-size:smaller;font-weight:bold;';
				    
					entryLink.appendChild(document.createTextNode(title));
					entryLink.appendChild(duedatenode);
					fli2.appendChild(entryLink);
				} 
				else 
				{
					fli2.appendChild(document.createTextNode(title));
				}

				ful2.appendChild(fli2);
			}
		}

		
		// sli = second list item,   sli2 second list item nesting level 2,  sul2 = second unordered list nesting level 2
		var sli = document.createElement('li');
		var sul2 = document.createElement('ul');
		var instructorCount = 0;
		for (var i = 0; i < feed.EventEntries.length; i++) 
		{
			var sli2 = document.createElement('li');
			var entry = feed.EventEntries[i];

			if (entry.IsInstructor == '1')
			{
				if (instructorCount == 0)
				{
					instructorCount++;
					
					var subTitle = document.createElement('div');
					subTitle.appendChild(document.createTextNode("Instructor Report"));
			
					sli.appendChild(subTitle);
					ul.appendChild(sli);
					ul.appendChild(sul2);
				}

				var title = entry.Title;
				var status = entry.Status;
				title = title + ' (' + status + ')';
				var entryLinkHref = buildhref(entry.href, UT);

				var entryLink = document.createElement('div');
				// uncomment this to make the instructor entries links, and change the 'div' to 'a' in the above statement
				//if (entryLinkHref.indexOf('?') != -1)
				//{
				//	entryLinkHref = entryLinkHref.substring(0, entryLinkHref.indexOf('?')); // This removes the querystring from the href....this eventually in turn links it to MyPage.aspx
				//}
				//entryLink.setAttribute('href', entryLinkHref);
				//entryLink.setAttribute('target', '_top');
				title = title.replace('(Open)', '');
				title = title.replace('(Complete)', '');
				title = title.replace('(Pending)', '');
				title = title.replace('(Closed)', '');
				//title += "Instructor Response Rates";
				entryLink.style.cssText  = 'font-weight:bold;';

				var respRate = document.createElement('div');
				respRate.appendChild(document.createTextNode("Response Rate: "));
				respRate.style.cssText  = 'font-weight:bold;';
				    
				var percentCompleteNode = document.createElement('div');
				percentCompleteNode.appendChild(document.createTextNode(entry.PercentComplete));
				percentCompleteNode.style.cssText  = 'font-size:smaller';
				    
				var duedatenode = document.createElement('div');
				duedatenode.appendChild(document.createTextNode('(StartDate: ' + dateformat(entry.StartDate) + '   EndDate: ' + dateformat(entry.EndDate) + ')'));
				duedatenode.style.cssText  = 'font-size:smaller;';
				    
				entryLink.appendChild(document.createTextNode(title));
				entryLink.appendChild(respRate);
				entryLink.appendChild(percentCompleteNode);
				entryLink.appendChild(duedatenode);
				sli2.appendChild(entryLink);				
				sul2.appendChild(sli2);
			}
		}
	}
	else 
	{
		if (feed.EventCount != null && feed.EventCount == 0)
		{
			var noticespan = document.createElement('div');
			noticespan.setAttribute('className', 'descriptionSpan');
			var noticetext = '(none available at this time)';
			noticespan.appendChild(document.createTextNode(noticetext));

			events.appendChild(noticespan);
		}
	}

	if (feed.AdEntry != null)
	{
		// tli = third list item
		var tli = document.createElement('li');
		var listtitleA = feed.AdEntry.Title;
		//var ALinkHref = feed.AdEntry.href;
		var ALinkHref = buildhref(feed.AdEntry.href, UT);

		ALink = document.createElement('a');
		ALink.setAttribute('href', ALinkHref);
		ALink.setAttribute('target', '_top');
		ALink.appendChild(document.createTextNode(listtitleA));

		var myp2 = document.createElement('span')
		myp2.setAttribute ('class', 'headingspan')

		myp2.appendChild(ALink);
		tli.appendChild(myp2);
		ul.appendChild(tli);
	}
		
	events.appendChild(ul);

}
//-->
