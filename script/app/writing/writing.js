$(
	function(){
		//contentEditable
		var WT = window.WT = {};
		WT.correction = {};
		var $writeEditor = $('#writingContent');
		var $writingEditorIframe = $('#writingEditorIframe');
		var $claimActionsArea = $('#claimActionsArea');
		var isIe = $.browser.msie;
		var isMoz = $.browser.mozilla;
		var isKit = $.browser.webkit;
		var editor = $writingEditorIframe[0];
		var cWin = editor.contentWindow;
		var doc = cWin.document;
		var getSelectText = function(){
			var sel;
			if(isIe){
				sel = doc.selection.createRange();
			}else{
				sel = doc.getSelection();
			}
			return sel;
		};
		var GetInnerHTML = function( nodes ){
			var builder = [];
			for (var i = 0; i < nodes.length; i++){
				if (nodes[i].innerHTML != undefined){
					builder.push(nodes[i].innerHTML);
				}else{
					if (nodes[i].textContent) builder.push(nodes[i].textContent.replace(/\</ig, function() { return "&lt;"; }));
					else if (nodes[i].nodeValue) builder.push(nodes[i].nodeValue.replace(/\</ig, function() { return "&lt;"; }));
				}
			}
			return builder.join('');
		};
		var SelectionRange = function( range ){
			this.GetSelectedHtml = function(){
				if (range == null) return '';
				
				if (isIe){
					if (range.htmlText != undefined) return range.htmlText;
					else return '';
				}
				else if (isMoz || isKit){
					return GetInnerHTML(range.cloneContents().childNodes);
				}
				else{
					return '';
				}
			}
			
			this.Replace = function(html){
				if (range != null){
					if (isIe){
						if (range.pasteHTML != undefined){
							range.select();
							range.pasteHTML(html);
							return true;
						}
					}
					else if (isMoz || isKit){
						if (range.deleteContents != undefined && range.insertNode != undefined){
							var temp = doc.createElement('DIV');
							temp.innerHTML = html;

							var elems = [];
							for (var i = 0; i < temp.childNodes.length; i++){
								elems.push(temp.childNodes[i]);
							}
							range.deleteContents();
							for (var i in elems){
								temp.removeChild(elems[i]);
								range.insertNode(elems[i]);
								editor.contentWindow.$(elems[i]).tooltip('toggle');
							}
							return true;
						}
					}
				}
				return false;
			}
			this.range = range;
		};
		
		var GetSelectionRange = function(){
			var range = null;
			if (isIe){
				range = doc.selection.createRange();
				if (range.parentElement().document != doc){
					range = null;
				}
			}else if(isMoz || isKit){
				var sel = doc.getSelection();
				if (sel.rangeCount > 0){
					range = sel.getRangeAt(0);
				} else{
					range = null;
				}
			}
			return new SelectionRange(range);
		};
		var insertWriting = function(){
			doc.designMode = 'on';
			doc.open();
			doc.write('<html>' +
							'<head>' +
							'<link rel="stylesheet" type="text/less" href="../../../css/common/bootstrap.css"/>'+
							'<style type="text/css">' +
								'body{color:#48484C;}' +
								'div::selection{ background:#ff720e;color:white;}' +
								'code{border:none;font-weight:bold;color:ff720e;}' +
								'.writing-content{font-size:13px;line-height:20px;padding:30px 55px;}' +
							'</style>' +
							'<script type="text/javascript" src="../../../script/lib/jquery.js"></script>' +
							'<script type="text/javascript" src="../../../script/plugin/bootstrap-tooltip.js"></script>' +
							'</head>' +
							'<body>' +
							'<div class="writing-content">' +
								'Dear Sir,<br/>How are you? I\'d like to ask you some legal advice. Last week, I was broken my right arm in the gym room when I was using the equipment. I think the equipment was faulty. That day, I heard some sound from the equipment when I was using it. After a few minutes, I was broken. I told the gym, they said that I did not use the machine correctly. Actually, I use the machine every day so I totally understand how to use it. Meanwhile, there had a witness told me that she saw a screw dropped it down from the machine when I was using it. She is willing to testify in the court.' +
							'</div>' +
							'</body></html>');
			doc.close();
		};
		insertWriting();
		/*
		!function(){
			var sel;
			var range;
			var txt;
			var saveCorrect = function(){
				var correctionTxt;
				if(sel != ''){
					correctionTxt = $('#correctionText').val();
					range.Replace('<code rel="tooltip" data-original-title="'+correctionTxt+'">'+sel+'</code>');
					$('#correctionEditting').animate({'height':0});
				}
			};
			$claimActionsArea.find('li:eq(0)').bind('click',function(){
				//editorDoc.execCommand("Bold", false, null);
				sel = getSelectText();
				range = GetSelectionRange();
				txt = sel.toString();
				if(sel == ''){
					return;
				}
				$('#sectionText').val(txt);
				$('#correctionText').addClass('focused').focus();
				$('#correctionEditting').removeClass('hide').css({'height':0,'overflow':'hidden'}).animate({'height':61});
			});
			
			$('#correctionSave').bind('click',function(){
				saveCorrect();
			});
			
			$('#correctionText').bind('keypress',function(ev){
				if (ev.keyCode == 13){
					saveCorrect();
				}
			});
			$('#correctionText').bind('focus',function(ev){
				$(this).val('');
			})
		}();
		*/
		var currentSelection = function(){
			this.sel = getSelectText();
			this.range = GetSelectionRange();
			this.txt = this.range.GetSelectedHtml();
		};
		var currentSelectionObj;
		
		
		WT.correction.btnsActionView = Backbone.View.extend({
			el : $('#claimActionsArea'),
			events: {
			  'click .btn'  : 'editAction'
			},
			btnsAction : {
				'ac1' : '',
				'ac2' : '',
				'ac3' : '',
				'ac4' : '',
				'ac5' : '',
				'ac6' : '',
				'ac7' : '',
				'ac8' : '',
				'ac9' : '',
				'ac10' : '',
				'ac11' : '',
				'ac12' : '',
				'ac13' : '',
				'ac14' : '',
				'ac15' : ''
			},
			initialize : function(){
				//this.setFocus();
				var edittingViewObj = new WT.correction.edittingView();
			},
			editAction : function(){
				currentSelectionObj = new currentSelection();
				this.setEditVal();
				if(currentSelectionObj.sel != ''){
					WT.correction.edittingView.expandEditStatus();
				}
			},
			setEditVal : function(){
				$('#correctionText').val('');
				$('#sectionText').val(currentSelectionObj.txt);
				this.setFocus();
			},
			setFocus : function(){
				$('#correctionText').addClass('focused').focus();
			}
		});
		
		
		WT.correction.edittingView = Backbone.View.extend({
			el : $('#correctionEditArea'),
			events : {
				'keypress #correctionText'  :  'enterCorrection',
				'keydown #correctionText'  :  'escExitCorrection',
				'click #correctionSave'     :  'saveCorrection',
				'click #correctionCancel'   :  'cancelCorrection'
			},
			initialize : function(){
				
			},
			saveCorrection : function(){
				var correctionTxt;
				if(currentSelectionObj.sel != ''){
					correctionTxt = $('#correctionText').val();
					currentSelectionObj.range.Replace('<code rel="tooltip" data-original-title="'+correctionTxt+'">'+currentSelectionObj.sel+'</code>');
					WT.correction.edittingView.collapseEditStatus();
				}
			},
			enterCorrection : function( ev ){
				if (ev.keyCode == 13){
					this.saveCorrection();
				}
			},
			escExitCorrection : function( ev ){
				if (ev.keyCode == 27){
					this.cancelCorrection();
				}
			},
			cancelCorrection : function(){
				WT.correction.edittingView.collapseEditStatus();
			}
		},
		{
			expandEditStatus : function(){
				$('#correctionEditting').removeClass('hide').css({'height':0}).animate({'height':61});
			},
			collapseEditStatus : function(){
				$('#correctionEditting').animate({'height':0});
			}
		});
		_.once(WT.correction.edittingView);
		new WT.correction.btnsActionView();
		
		
		
	}
)
