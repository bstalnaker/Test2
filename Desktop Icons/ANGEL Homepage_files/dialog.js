/***********************************************************************
* DialogManager object
* Requires: YAHOO/utilities/utilities.js, YAHOO/container/container-min.js
***********************************************************************/
function DialogManager() {
	this.queue = new Array();
	this.dlg = null;
	this.info = null;

	this.alert = function(dlgText, dlgIcon, dlgTitle, fnHandler, properties) {
		var icon = dlgIcon;
		switch (dlgIcon) {
			case "default": icon=YAHOO.widget.SimpleDialog.ICON_INFO;break;
			case "help": icon=YAHOO.widget.SimpleDialog.ICON_HELP;break;
			case "info": icon=YAHOO.widget.SimpleDialog.ICON_INFO;break;
			case "warn": icon=YAHOO.widget.SimpleDialog.ICON_WARN;break;
		}
		var info = {mode:"ALERT", text:dlgText, icon:icon, title:(dlgTitle)?dlgTitle:ANGEL.lang["Alert"], handler:fnHandler, opt:properties};
		this.queue.push(info);
		this.next();
	}

	this.confirm = function(dlgText, dlgIcon, dlgTitle, fnHandler, properties) {
		var icon = dlgIcon;
		switch (dlgIcon) {
			case "default": icon=YAHOO.widget.SimpleDialog.ICON_INFO;break;
			case "help": icon=YAHOO.widget.SimpleDialog.ICON_HELP;break;
			case "info": icon=YAHOO.widget.SimpleDialog.ICON_INFO;break;
			case "warn": icon=YAHOO.widget.SimpleDialog.ICON_WARN;break;
		}
		var info = {mode:"CONFIRM", text:dlgText, icon:icon, title:(dlgTitle)?dlgTitle:ANGEL.lang["Confirm"], handler:fnHandler, opt:properties};
		this.queue.push(info);
		this.next();
	}

	this.prompt = function(dlgText, dlgValue, dlgTitle, fnHandler, properties) {
		var info = {mode:"PROMPT", text:dlgText, value:(dlgValue)?dlgValue:'', title:(dlgTitle)?dlgTitle:ANGEL.lang["Prompt"], handler:fnHandler, opt:properties};
		this.queue.push(info);
		this.next();
	}

	this.onOK = function() {
		if (this.info.handler)
			this.info.handler((this.info.mode=="PROMPT")?document.getElementById("text"+this.id).value:true);
		var owner = this.owner;
		owner.finish();
		owner.next();
	};
	
	this.onCancel = function() {
		if (this.info.handler)
			this.info.handler((this.info.mode=="PROMPT")?null:false);
		var owner = this.owner;
		owner.finish();
		owner.next();
	};

	this.onKeyPress = function(type, args, obj) {
		if (args[0]==13)
			this.onOK();
		else
			this.onCancel();
	};
	
	this.next = function() {
		//check if we are currently displaying a dialog and exit if we are
		if (!this.dlg && this.queue.length > 0)
		{
			this.dlg = new YAHOO.widget.SimpleDialog("dlgDefault", 
			 { width:"30em",
			   fixedcenter:true,
			   visible:false,
			   draggable:true,
			   modal:true,
			   close:false,
			   constraintoviewport:true,
			   underlay:"none",
			   postmethod:"none"
			 } );
			var info = this.queue.shift();
			this.dlg.id = YAHOO.util.Dom.generateId();
			this.dlg.info = info;
			this.dlg.owner = this;
			 switch (info.mode) {
				case "ALERT":
					this.dlg.cfg.queueProperty("icon", (info.icon)?info.icon:YAHOO.widget.SimpleDialog.ICON_INFO);
					this.dlg.cfg.queueProperty("text", info.text);
					this.dlg.cfg.queueProperty("buttons", [{text:(info.opt&&info.opt.lblOK)?info.opt.lblOK:ANGEL.lang["OK"], handler:this.onOK, isDefault:true}]);
					break;
				case "CONFIRM":
					this.dlg.cfg.queueProperty("icon", (info.icon)?info.icon:YAHOO.widget.SimpleDialog.ICON_HELP);
					this.dlg.cfg.queueProperty("text", info.text);
					this.dlg.cfg.queueProperty("buttons", [{text:(info.opt&&info.opt.lblOK)?info.opt.lblOK:ANGEL.lang["OK"], handler:this.onOK, isDefault:true}, {text:(info.opt&&info.opt.lblCancel)?info.opt.lblCancel:ANGEL.lang["Cancel"], handler:this.onCancel}]);
					break;
				case "PROMPT":
					var sValue = "" + this.dlg.info.value;
					this.dlg.cfg.queueProperty("icon", YAHOO.widget.SimpleDialog.ICON_HELP);
					this.dlg.cfg.queueProperty("text", info.text + "<div><input type=\"text\" id=\"text" + this.dlg.id + "\" style=\"width:26em\" value=\"" + sValue.replace(/"/g, "&quot;") + "\"></div>");
					this.dlg.cfg.queueProperty("buttons", [{text:(info.opt&&info.opt.lblOK)?info.opt.lblOK:ANGEL.lang["OK"], handler:this.onOK, isDefault:true}, {text:(info.opt&&info.opt.lblCancel)?info.opt.lblCancel:ANGEL.lang["Cancel"], handler:this.onCancel}]);
					break;
			 }
			for (var x in info.opt)
				this.dlg.cfg.queueProperty(x, info.opt[x]);
			this.dlg.cfg.queueProperty("close", false);
			this.dlg.kl = new YAHOO.util.KeyListener(document, { keys:[13,27] }, 	
														  { fn:this.onKeyPress,
															scope:this } );
			this.dlg.cfg.queueProperty("keylisteners", this.dlg.kl);
			this.dlg.render(document.body);
			this.dlg.setHeader(info.title);
			this.dlg.show();
			if (this.dlg.info.mode=="PROMPT") {
				try {
					var sTextboxId = "text" + this.dlg.id;
					YAHOO.util.Dom.get(sTextboxId).focus();
					YAHOO.util.Dom.get(sTextboxId).select();
				} catch(e) { }
			}
		}
	};

	this.finish = function() {
		if (this.dlg) {
			this.dlg.owner = null;
			this.dlg.info = null;
			this.dlg.kl = null;
			this.dlg.hide();
			this.dlg.destroy();
			this.dlg = null;
		}
	}

};
