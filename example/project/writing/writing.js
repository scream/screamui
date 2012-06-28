
		(function(win){
			//contentEditable
			var $writeEditor = $('#writeEditor');
			var isIe = $.browser.msie;
			var isMoz = $.browser.mozilla;
			var isKit = $.browser.webkit;
			var doc = window.document;
			$(document).select(function(){
				//$writeEditor.contentEditable = true;
				var range = window.getSelection().getRangeAt(0);
				console.log(range);
			});
			var getSelectText = function(){
				var sel;
				if(isIe){
					sel = doc.selection.createRange().text;
				}else{
					sel = doc.getSelection();
				}
				return sel;
			};
			var GetInnerHTML = function(nodes){
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
			var SelectionRange = function(range){
				var doc = win.document;
				this.GetSelectedHtml = function(){
					if (range == null) return '';
					
					if (browser.msie){
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
									$(elems[i]).tooltip('toggle');
									/*
									$(elems[i]).popover({
										'placement' : 'right',
										'trigger' : 'manual',
										'title' : 'Action',
										'content' : '<input type="text"/>'
									});
									*/
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
					range = win.selection.createRange();
					if (range.parentElement().document != win.document){
						range = null;
					}
				}else if(isMoz || isKit){
					var sel = win.getSelection();
					if (sel.rangeCount > 0){
						range = sel.getRangeAt(0);
					} else{
						range = null;
					}
				}
				return new SelectionRange(range);
			};

			$writeEditor.mouseup(function(ev){
				var sel = getSelectText();
				var range;
				range = GetSelectionRange();
				if(sel != ''){
					console.log(ev.pageX);
					console.log(ev.pageY);
					//$('a[rel=popover]').popover('show');
					//modifyWrite(range.range);
					range.Replace('<code rel="tooltip" data-original-title="'+sel.toString().toUpperCase()+'">'+sel+'</code>');
				}
			});
		})(this)