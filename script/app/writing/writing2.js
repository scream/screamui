$(
	function(){
		//contentEditable
		var WT = window.WT = {};
		WT.correction = {};
		var $writeEditor = $('#writingContent');
		var $writingEditorIframe = $('#writingEditorIframe');
		var $claimActionsArea = $('#claimActionsArea');
		var $autoCorrection = $('#autoCorrection');
		var currentSelectionObj;
		var isIe = $.browser.msie;
		var isMoz = $.browser.mozilla;
		var isKit = $.browser.webkit;
		var doc = window.document;
		var mousePositon = {};
		var regExp = {
			'CC' : /^(\s{0,1})([a-zA-Z])(\w*)/g
		};
		
		
		var symbolsList = [{name:'AG',des:'agreement(I AM, she IS)',img:'AG.gif'},{name:'AR',des:'article (a, an, the)',img:'AR.gif'},{name:'CC',des:'capitalisation',img:'C.gif'},{name:'CO',des:'combine sentences',img:'CO.gif'},{name:'DD',des:'delete',img:'D.gif'},{name:'EX',des:'expression or idiom',img:'EX.gif'},{name:'I(x)',des:'insert x',img:'I(x).gif'},{name:'MW',des:'missing word',img:'MW.gif'},{name:'NS',des:'new sentence',img:'NS.gif'},{name:'NSW',des:'no such word',img:'NSW.gif'},{name:'PH',des:'phraseology',img:'PH.gif'},{name:'PL',des:'plural',img:'PL.gif'},{name:'PO',des:'possessive',img:'PO.gif'},{name:'PR',des:'preposition',img:'PR.gif'},{name:'PS',des:'part of speech',img:'PS.gif'},{name:'PU',des:'punctuation',img:'PU.gif'},{name:'SI',des:'singular',img:'SI.gif'},{name:'SP',des:'spelling',img:'SP.gif'},{name:'VT',des:'verb tense',img:'VT.gif'},{name:'WO',des:'word order',img:'WO.gif'},{name:'WC',des:'Word Choice',img:'WC.gif'},{name:'XY',des:'change from x to y',img:'xy.gif'},{name:'HL',des:'highlight',img:'HL.gif'}];
		
		$('code[rel=tooltip]').tooltip('show');
		
		$writeEditor.contextmenu(function( ev ){
			if(ev.button == 2){
				ev.preventDefault();
				ev.stopPropagation();
				$('.btns-action').remove();
				handleAction.fire(ev);
				return false;
			}
		});
		
		$(doc.body).click(function( ev ){
			$('.btns-action').remove();
			$span = $('span.s-color');
			if( $span.length ){
				$span.replaceWith($span.html());
			}
		});
		
		$writeEditor.mouseup(function( ev ){
			mousePositon.left = ev.pageX;
			mousePositon.top = ev.pageY;
			/*
			var sel = dealSelectedText.getSelectText();
			var range;
			range = dealSelectedText.getSelectionRange();
			if(sel != ''){
				range.replace('<span class="s-color">'+sel+'</span>');
			}
			*/
		});
		
		var dealSelectedText = {
		
			getSelectText : function(){
				var sel;
				if(isIe){
					sel = doc.selection.createRange();
				}else{
					sel = doc.getSelection();
				}
				return sel;
			},
			
			getInnerHTML : function( nodes ){
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
			},
			
			selectionRange : function( range ){
				this.getSelectedHtml = function(){
					if (range == null) return '';
					
					if (isIe){
						if (range.htmlText != undefined) return range.htmlText;
						else return '';
					}
					else if (isMoz || isKit){
						return dealSelectedText.getInnerHTML(range.cloneContents().childNodes);
					}
					else{
						return '';
					}
				}
				
				this.replace = function(html){
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
								}
								return true;
							}
						}
					}
					return false;
				}
				this.range = range;
			},
			
			getSelectionRange : function(){
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
				return new dealSelectedText.selectionRange(range);
			}
		}
		
		var handleAction = {};
		var showMenu = function( ev, key ){
			currentSelectionObj = new currentSelection();
			var selectedTxt = WT.correction.HandleSection.focusLight(currentSelectionObj.sel);
			
			/*
			var choosed = function(){
				return function (text, render) {
					var renderTxt = render(text);
					
					return render(text);
				}
			};
			*/
			
			if(currentSelectionObj.sel != ''){
				currentSelectionObj.range.replace(selectedTxt);
				var btnsActionViewObj = new WT.correction.btnsActionView({'symbolsList':symbolsList,'left':ev.pageX,'top':ev.pageY,'cName':ev.name});
			}
		};
		var handleAction = $.Callbacks();
		handleAction.add(showMenu);
		
		var currentSelection = function(){
			this.sel = dealSelectedText.getSelectText();
			this.range = dealSelectedText.getSelectionRange();
			this.txt = this.range.getSelectedHtml();
		};
		
		WT.correction.HandleSection = {
			focusLight : function( txt ){
				return '<span class="s-color">'+txt+'</span>';
			},
			blurLight : function(){
				$('span.s-color').remove();
			}
		};
		
		
		WT.correction.btnsActionView = Backbone.View.extend({
			template : $('#btnsActionTemplate').html(),
			className : 'btns-action',
			events: {
			    'click li'                            :  'editAction',
			    'keypress #correctionText'            :  'enterCorrection',
				'keydown #correctionText'             :  'escExitCorrection',
				'click #correctionSave'               :  'saveCorrection',
				'click #correctionCancel'             :  'cancelCorrection',
				'click ul,#correctionEditting'        :  'stopPro'
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
			initialize : function(options){
				this.render();
			},
			render : function(){
				this.$el = $(this.el);
				this.$el.css({left:this.options.left,top:this.options.top});
				this.$el.html(Mustache.to_html(this.template,this.options));
				$(document.body).append(this.$el);
				if(this.options.cName){
					this.shortCutAction();
				}
			},
			setChoosed : function(){
				this.$li = this.$el.find('li:contains('+this.options.cName+')').eq(0);
				this.$li.addClass('choosed');
			},
			shortCutAction : function(){
				this.setChoosed();
				this.editAction();
			},
			editAction : function(ev){
				var li;
				if( ev ){
					ev.stopPropagation();
					li = $(ev.target);
					this.options.cName = li.html();
				}else{
					li = this.$li;
				}
				this.addLiCls(li);
				
				if( symbolsAction[this.options.cName] ){
					this.setEditVal( symbolsAction[this.options.cName]( currentSelectionObj.txt ) );
					this.saveCorrection();
					return false;
				}else{
					this.setEditVal( currentSelectionObj.txt );
				}
				//symbolsAction[this.options.cName] ? this.setEditVal( symbolsAction[this.options.cName]() ) : this.setEditVal(currentSelectionObj.txt);
				/*
				if($('span.s-color').length){
					this.expandEditStatus();
				}
				*/
				this.expandEditStatus();
			},
			addLiCls : function( el ){
				this.remLiCls();
				el.addClass('choosed');
			},
			remLiCls : function(){
				$(this.el).find('ul li').removeClass('choosed');
			},
			setEditVal : function( txt ){
				$('#correctionText').val( txt );
				$('#sectionText').val( currentSelectionObj.txt );
			},
			setFocus : function(){
				$('#correctionText').addClass('focused').select().focus();
			},
			saveCorrection : function(){
				var HEIGHT = 24;
				var self = this;
				this.pos = 'top';
				var correctionTxt = $('#correctionText').val();
				var $span = $('span.s-color');
				var spanHtml = $span.html();
				if($span.outerHeight() > HEIGHT){
					this.pos = 'right';
				}
				var $code = $('<code rel="tooltip" action="'+this.options.cName+'" class="'+this.options.cName.toLowerCase()+'" data-correct-title="'+this.options.cName + ':' + correctionTxt+'">' + spanHtml + '</code>');
				$span.replaceWith($code);
				
				$code.data({
							'trigger'   : 'hover',
							'placement' : function(){return self.handleDelete.apply(self, [this].concat(Array.prototype.slice.call(arguments)) )},
							'template'  : '<div class="tooltip">' + 
											'<div class="tooltip-arrow"></div>' +
											'<div class="tooltip-inner inline">' +
												'<span class="txt"></span>' +
												'<label class="checkbox inline dl"><input type="button" value="Delete" class="btn-danger"/></label>' +
											'</div>' +
										'</div>'
							});
				$code.tooltip('show');
				this.cancelCorrection();
			},
			handleDelete : function( tooltips, tips, el ){
				$tips = $(tips);
				$tips.unbind('click').on('click',$.proxy(this.deleteCorrection,this));
				return this.pos;
			},
			deleteCorrection : function(){
				
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
				$(this.el).remove();
			},
			stopPro : function( ev ){
				ev.stopPropagation();
			},
			expandEditStatus : function(){
				var self = this;
				$('#correctionEditting').removeClass('hide').css({'height':0}).animate({'height':90},{'complete':function(){debugger;self.setFocus();}});
			}
		});

		_.once(WT.correction.edittingView);
		//new WT.correction.btnsActionView();

		
		
		var symbolsAction = {
			'CC' : function( str ){
				var tempStr;
				str.replace(regExp.CC,function(a,b,c,d){
					tempStr = b+c.toUpperCase()+d;
					return tempStr;
				});
				return tempStr;
			},
			'DD' : function( str ){
				
			},
			'HL' : function( str ){
				
			}
		};
		
		$.each( symbolsList, function( m, n ){
		
				jwerty.key( n.name.split('').join(','), function ( ev ) {
					var pos = !_.isEmpty( mousePositon ) ? mousePositon : $('#writingContent').position();
					ev = {'pageX' : mousePositon.left, 'pageY' : mousePositon.top, 'name' : n.name};
					handleAction.fire( ev );
				});
			
		});
		
		
		!function(){
			var str = "Dear Sir,How are you? I'd like to ask you some legal advice. Last week, I was broken my right arm in the gym room when I was using the equipment. I think the equipment was faulty. That day, I heard some sound from the equipment when I was using it. After a few minutes, I was broken. I told the gym, they said that I did not use the machine correctly. Actually, I use the machine every day so I totally understand how to use it. Meanwhile, there had a witness told me that she saw a screw dropped it down from the machine when I was using it. She is willing to testify in the court.";
			var stringArray = str.split('');
			var result = '';
			var _noneterminalPunctuation = "\"',:;()~@#$%^&*-+={}[]";
			var _terminalPunctuation = "!.?";
			var allPunctuation = _noneterminalPunctuation + _terminalPunctuation;
			var canTerminal = function(value){
				return _terminalPunctuation.indexOf(value) > -1;
			}
			var isPunc = function(value){
				return allPunctuation.indexOf(value) > -1;
			}
			var isPuncOrSpace = function(value){
				return isPunc(value) || value == ' ';
			}
			var count = 0;
			var max = 100;
			var reach = false;
			for(var i = 0; i < stringArray.length; i++){
				var current = stringArray[i];
				var next = stringArray[i+1];
				result += current;
				if(!reach && isPuncOrSpace(current) && !isPuncOrSpace(next)){
					count++;
					//result += count;
				}
				if(!reach && count >= max && canTerminal(current)){
					reach = true;
					result += '$';
				}
			}
			$writeEditor.html(result);
		}()
		
		
		!function(){
			$.ajax({
				url : '',
				method : 'post',
				success : function(){
					
				},
				error : function(){
				
				}
			});
		}()
	}
)
