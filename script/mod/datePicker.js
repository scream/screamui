window.DatePicker = { 
	config :{
		title:'',
		backType:'{yyyy-mm-dd}',
		className:'DatePicker',
		showMonthCount:2,
		startDate:new Date(),
		read:true,
		onSelect:false,
		onSelectBack:false,
		left:0,
		top:0,
		capture:true,
		move:true,
		maxDate:false,
		minDate:false,
		expired:true,
		stop:false,
		lang: 'en',
		isShowToday:true,
		isShowMoreYear:true,
		yearLimit:'1960-2020',
		weekLimit:'0123456',
		dateLimit:/\d/,
		text:{
			en:{
				week:['Mo','Tu','We','Th','Fr','Sa','Su'],
				previousMonth:'Previous Month',
				nextMonth:'Next Month',
				more:'More',
				today:''
			}
		}
	}
};

(function( config ){
	var	 ie = document.all && navigator.userAgent.match( /\s{1}\d{1}/ ),	
	today = {
		year:new Date().getUTCFullYear(),
		month:new Date().getMonth(),
		date:new Date().getDate()
	},
	
	opacity = function( element, val ) {
		if( ie )
			element.style.filter = 'alpha(Opacity=' + val + ')';
		else
			element.style.opacity = val / 100;
	},
	
	offset = function( el ) {
		var 
		x = 0,
		y = 0;
		while( el ){
			x += el.offsetLeft;
			y += el.offsetTop;
			el = el.offsetParent;
		}
		return { x:x, y:y };
	},
	
	each = function( nodes, func ) {
		nodes = nodes.nodeType==1 ? [ nodes ] :nodes;
		for(var i=0; i<nodes.length; i++)
			func.call( nodes[i],i );
	},
	
	addEvent = function( el, type, fn ) {
		if( el.attachEvent )	el.attachEvent('on' + type, fn );
		else if( el.addEventListener ) el.addEventListener( type, fn, false );
	},
	
	removeEvent = function ( element, type, fn ) {
		if( element.detachEvent )	element.detachEvent( 'on' + type, fn );
		else if( element.removeEventListener ) element.removeEventListener( type, fn, false );
	},
	
	dayCount = function( date ) {
				return [31, date.year % 4 == 0 && date.year % 100 != 0  || date.year % 400 == 0 ? 29 : 28 ,31,30,31,30,31,31,30,31,30,31][ date.month ];
	},
	
	evt = function(e) {
		if( !e ) return new arguments.callee( arguments.callee.caller.arguments[0] || window.event );
		this.e = e;
		this.x = e.clientX;
		this.y = e.clientY;
		this.target = e.srcElement || e.target;
		this.toElement = e.toElement || e.relatedTarget;
		
		this.cancelDefault = function(){
			if( typeof e.returnValue != undefined ) e.returnValue = false;	
			else e.preventDefault();
		};
		
		this.cancelBubble=function(){
			if( e.stopPropagation ) e.stopPropagation();
			else e.cancelBubble = true;
		};
	};

	window.DatePicker = function( options ) {
		
			if( options == undefined ) options = {};
			
			if( typeof options.dom != 'undefined' ) {
				if( document.getElementById( options.dom ) == null ) {
					setTimeout( function(){
							DatePicker( options );				  
					} ,50 );
					return null;
				}else	options.dom = document.getElementById( options.dom );	
			}
			
			if( typeof DatePicker._DatePicker == 'object' ) document.body.removeChild( DatePicker._DatePicker );
			
			if( typeof options.dom == 'undefined' ){
				var targetEvent=window.event || arguments.callee.caller.arguments[0];
				if( targetEvent.stopPropagation ) 
					targetEvent.stopPropagation();
				else targetEvent.cancelBubble = true;
			}
			
			var options = {
					target:typeof options.dom != 'object' ? options.target || targetEvent.srcElement || targetEvent.target : null,
					back:typeof options.dom != 'object' ? options.back || targetEvent.srcElement || targetEvent.target : null,
					dom:options.dom || false,
					startDate:options.startDate ? ( options.startDate.constructor == Date ? options.startDate : new Date( options.startDate ) ): config.startDate,
					read:options.read || config.read,
					onSelect:options.onSelect || config.onSelect,
					onSelectBack:options.onSelectBack || config.onSelectBack ,
					backType:options.backType || config.backType,
					className:options.className || config.className,
					left:options.left ? parseInt( options.left ) : config.left,
					top:options.top ? parseInt( options.top ) : config.top,
					showMonthCount:options.showMonthCount || config.showMonthCount,
					capture:options.capture || config.capture,
					move:options.move || config.move,
					maxDate:options.maxDate || config.maxDate,
					minDate:options.minDate || config.minDate,
					expired:options.expired || config.expired,
					title:typeof options.title != 'undefined' ? options.title : config.title,
					stop:options.stop || config.stop,
					lang:options.lang ? config.text[ options.lang ] : config.text[ config.lang ],
					isShowToday:options.isShowToday || config.isShowToday,
					yearLimit:options.yearLimit || config.yearLimit,
					weekLimit:options.weekLimit || config.weekLimit,
					dateLimit:options.dateLimit || config.dateLimit,
					isShowMoreYear:options.isShowMoreYear || config.isShowMoreYear
			},
			
			DOM = {},
			
			defaultXY = {
				x:0,
				y:0
			},

			editDate = false;
			
			if( options.read && !options.dom ){
					var readDate = options.back.getAttribute( 'DatePickerValue' );
					if( readDate ) {
						options.startDate = new Date( parseInt( readDate ) );
						editDate = { 
							year:options.startDate.getFullYear(),
							month:options.startDate.getMonth(),
							days:options.startDate.getDate()
						};
					}else{
						readDate = options.back.value || options.back.innerHTML;
						
						if( readDate != '' ) {
							readDate = readDate.split ( /[^\d]/g );
							if( readDate.length == 3 ) {
								if( readDate[2].length == 4 )
									options.startDate = new Date( readDate[2], readDate[0]-1, readDate[1] );
								else
									options.startDate = new Date( readDate[0], readDate[1]-1, readDate[2] );
								editDate={
									year:options.startDate.getFullYear(),
									month:options.startDate.getMonth(),
									days:options.startDate.getDate()
								};		
							}
						}
					}	
			}
			
			if( options.maxDate ) {
				if( options.maxDate.constructor == Date )
					options.maxDate  = [ 
						options.maxDate.getFullYear(),
						options.maxDate.getMonth(),
						options.maxDate.getDate()
					];
					
				else{
					options.maxDate = options.maxDate.split( /[^\d]/g );
					if( options.maxDate.length != 3 )	
									options.maxDate = false;
				}
			}
			
			if( options.minDate ){
				if( options.minDate.constructor == Date )
					options.minDate = [
							 options.minDate.getFullYear(),
							 options.minDate.getMonth(),
							 options.minDate.getDate()
						];
				else{
					options.minDate = options.minDate.split( /[^\d]/g );
					if( options.minDate.length !=3 )
									options.minDate = false;
				}
			}
			
			var currentDate = {
					year:options.startDate.getFullYear(),
					month:options.startDate.getMonth(),
					days:options.startDate.getDate()
			},
			
			limit = false,

			interface = document.createElement( 'div' );
			
			( options.dom || document.body ).appendChild( interface );
			
			if( !options.dom ) DatePicker._DatePicker = interface;

			var fade = function ( element, type, func ) {
					if( !options.stop ) {
							each( element, function() {
								opacity( this, type == 'out' ? 0 :100 );			  
							});	
							( func || function(){} )();
					}else{
						var time = type == 'out' ? 100 :0,
						out = setInterval( function() {
								time += type == 'out' ?  - 10 :10;
								each( element, function() {
									opacity( this, time );			  
								});
								if( time > 100 || time < 0 ){
									clearInterval( out );
									( func || function(){} )();
								}
						},10 );
					}
			},
			
			removeDate = function() {
					fade(interface, 'out', function() {
							DatePicker._DatePicker = undefined;
							try{ document.body.removeChild( interface ) }catch(e){}
					});
					removeEvent( document,'click',arguments.callee );
			},

			onSelectEvent = function( e ) {
					var element = evt().target,
					yyyy = element.getAttribute( 'y' ),
					yy = yyyy.substr( 2 ),
					m = parseInt( element.getAttribute( 'm' ) ),
					mm = m < 10 ? '0' + m : m,
					d = parseInt( element.getAttribute( 'd' ) ),
					dd = d < 10 ? '0' + d : d,
					date = new Date( yyyy ,m-1, d ),
					time = date.getTime(),
					back = options.backType.replace( /\{.*\}/ig , function( str ) {
							return str
							.replace( /[\{\}]/g, '')
							.replace( /y{4}/ig ,yyyy )
							.replace( /y{2}/ig, yy )
							.replace( /m{2}/ig, mm )
							.replace( /m{1}/ig, m )
							.replace( /d{2}/ig, dd )
							.replace( /d{1}/ig, d );
					}),
					
					backData = {
						yyyy:yyyy,
						yy:yy,
						mm:mm,
						m:m,
						dd:dd,
						d:d,
						back:back,
						date:date,
						time:time
					};

					if( options.onSelect  &&  !options.onSelect.call( options.back,backData ) )  return null;
					
					if( options.read  &&  !options.dom ) options.back.setAttribute( 'DatePickerValue', time );
					
					if( options.onSelectBack ) {
						if( options.onSelectBack.call( options.back,backData ) )
							if( !options.dom ) removeDate();
						return null;
					}
					
					if( !options.dom  &&  options.back.nodeType == 1 ){
						if( options.back.value )
							options.back.value = back;
						else if( options.back.innerHTML )
							options.back.innerHTML = back;
						removeDate();
					}
			},
			
			createList = function( backCallFn ){
				var limit, 
				year = currentDate.year,
				month = currentDate.month,
				__today = new Date( today.year, today.month, today.date );
				
				var isLimit = function( year, month, date, day){
						return options.maxDate && new Date( options.maxDate[0], options.maxDate[1]-1, options.maxDate[2] ) <=  new Date( year,month,date )   ||   options.minDate && new Date( options.minDate[0], options.minDate[1]-1, options.minDate[2])  >=  new Date( year, month, date ) || options.weekLimit.indexOf( day ) == -1 || !options.dateLimit.test( date );	
				}
				
				for( var MonthLegth = 0; MonthLegth < options.showMonthCount; MonthLegth++ ){
				
					var MonthDayCount = dayCount({ year:year, month:month }),
		
					startPad = new Date( year, month, 1 ).getDay(),
					list = document.createElement( 'div' );
                    if(startPad == 0){
                        startPad = 6;
                    }else{
                        startPad--;
                    }
					list.className = 'list month' + ( MonthLegth + 1 ) + ( options.showMonthCount >1 && year == today.year && month == today.month ? ' currentMonth' : '') ;
					opacity( list ,0 );
					
					var html = '<div class="head">';
					
					if( MonthLegth == 0 )
						html += '<a hidefocus="true" class="selectMonthLeft" href="javascript:void(0)" >&lt;</a>';
					
					html += '<a hidefocus="true" class="year" href="javascript:void(0)">' + year + '</a>.<a hidefocus="true" class="month" year="' + year + '" href="javascript:void(0)" dom="month" >' +( month + 1 ) + '</a>';

					if( MonthLegth + 1 == options.showMonthCount )
						html += '<a hidefocus="true" class="selectMonthRight" href="javascript:void(0)" >&gt;</a>';

					html += '</div><div class="week">';
					
					for( var j = 0; j < 7; j++ ) 
						html+='<div class="d '+ j + '">' + options.lang.week[j] +'</div>';
						
					html += '<br /></div><div class="days">';

					for( var j=0; j < startPad; j++ )
						html += '<div class="d' + j +' none"></div>';
					
					for( var j=1; j <= MonthDayCount; j++ ){
						limit = false;
						html += '<div class="';
						var day = new Date( year, month, j ).getDay();
						html += 'days d' + day;
						
						if( isLimit( year, month, j, day )){
							limit = true;
							html += ' limit';	
						}
						
						if( options.expired && new Date( year, month, j ) <   __today )
							html += ' old';
							
						if( editDate && editDate.days == j && editDate.month == month && editDate.year == year ) 
							html +=' edit';
							
						if( today.year == year && today.month == month && today.date == j )
							html += ' current';
						
						html += '"><a hidefocus="true" href="javascript:void(0)" y="' + year + '" m="' + ( month + 1 ) + '" d="' + j + '" limit="' + limit + '" old="' + ( new Date( year,month,j ) < __today ? 1 :0 ) + '" >'+ j + '</a></div>';
					
					}
					
					for(var j = 41 - MonthDayCount-startPad; j>0; j-- ) {
						if( options.isShowToday && !isLimit( today.year, today.month, today.date, new Date().getDay() ) && j==1 ){
							html += '<div class="other none">';
							html += '<a hidefocus="true" href="javascript:void(0)" limit="false" y="' + today.year + '" m="'+ ( today.month + 1 ) + '" d="' + today.date + '">' + options.lang.today + '</a>';
						}
						else html += '<div class="none">';
						html += '</div>';
					}
					
					list.innerHTML = html + '<br/></div>';
					DOM.content.appendChild( list );
					
					each( list.getElementsByTagName( 'a' ),function() {
						switch( this.className ){
							case 'year':
								this.onclick = function( e ) {
									evt().cancelBubble();
									var self = this,
									yearList = document.createElement( 'div' );
									yearList.className = 'yearList';
									opacity( yearList, 0 );
									var html = '',
									yearLimit= options.yearLimit.split( /[^\d]/g );
									for(var y = parseInt( yearLimit[0] ); y<parseInt( yearLimit[1] ); y++ ){
										html += '<a href="javascript:void(0)" class="';
										if( y < today.year ) html += 'old ';
										if( y == today.year) html += 'current';
										html += '" hidefocus="true" year="'+ y +'">'+ y +'</a>';
									}
									if( options.isShowMoreYear )
									html += '<a href="javascript:void(0)" hidefocus="true" class="more" more="' +( parseInt( yearLimit[0] ) - 30 ) + '-' + ( parseInt( yearLimit[1] ) + 30 )+'">'+ options.lang.more +'</a>';
									yearList.innerHTML  = html;
									yearList.style.left = offset( this ).x - offset( interface ).x + 'px';
									yearList.style.top = offset( this ).y - offset( interface ).y + this.offsetHeight + 'px';
									DOM.content.appendChild( yearList );
									fade( yearList, 'in' );
									each( yearList.getElementsByTagName( 'a' ), function() {
										if( options.isShowMoreYear && this.getAttribute( 'more' ) )
											this.onclick = function(){
												options.yearLimit = this.getAttribute( 'more' );
												fade(yearList, 'out', function() {	
													try{ DOM.content.removeChild( yearList );}catch(e){}
												});
												self.onclick( e );
											};
										else
											this.onclick = function() {
												currentDate.year = parseInt( this.getAttribute( 'year' ) );
												setList();
											};
									});
									this.onmouseout = function( e ) {
										evt().cancelBubble();
										if( evt().toElement != yearList ){
											fade( yearList, 'out', function() {	
												try{ DOM.content.removeChild( yearList )}catch(e){}
											});
										}
									};
									yearList.onmouseout = function( e ){
										if( evt().toElement != this && evt().toElement.parentNode != this  ){
											fade( yearList, 'out', function() {
												try{ DOM.content.removeChild( yearList )}catch(e){}
											});
										}
									};
								};
							break;
							case 'month':
								this.onclick = function( e ){
									evt().cancelBubble();
									var monthList = document.createElement( 'div');
									monthList.className = 'monthList';
									opacity( monthList, 0 );
									var html = '';
									for( var i=0; i<12; i++ ) {
										html += '<a href="javascript:void(0)" hidefocus="true" class="';
										if( i == parseInt( this.innerHTML ) -1 )
											html += 'current ';
										html += '" year="' + this.getAttribute( 'year' ) + '" month="' + i + '">' + ( i+1 ) + '</a>';
									}
									monthList.innerHTML = html;
									monthList.style.left = offset( this ).x - offset( interface ).x + 'px';
									monthList.style.top = offset( this ).y - offset( interface ).y + this.offsetHeight - 5 +'px';
									DOM.content.appendChild( monthList );
									fade( monthList, 'in');
									each( monthList.getElementsByTagName( 'a' ),function(){
										this.onclick = function() {
											currentDate.year = parseInt( this.getAttribute( 'year' ) );
											currentDate.month = parseInt( this.getAttribute( 'month' ) );
											setList();
										};
									});
									this.onmouseout = function( e ){
										evt().cancelBubble();
										if( evt().toElement != monthList )
											fade( monthList, 'out', function() {												
												try{ DOM.content.removeChild( monthList ) }catch(e){}
											});
									};
									monthList.onmouseout = function(e){
										if( evt().toElement != this && evt().toElement.parentNode != this )
											fade( monthList, 'out', function(){												
												try{ DOM.content.removeChild( monthList ) }catch(e){}
											});
									};
								};
							break;
							case 'selectMonthLeft':
								this.onclick = function() {
									currentDate.month -= options.showMonthCount;
									if(currentDate.month < 0 ){
										currentDate.month = currentDate.month+12;
										currentDate.year--;
									}
									setList();	
								};
							break;
							case 'selectMonthRight':
								this.onclick = function(){
									currentDate.month += options.showMonthCount;
									if( currentDate.month > 11 ){
										currentDate.month = currentDate.month - 12;
										currentDate.year++;
									}
									setList();	
								};
							break;
							default:
								if( this.getAttribute( 'limit' ) == 'false' )
								this.onclick = onSelectEvent;	
						}								 
					});	
					
					if( ++month == 12 ){
						year++;
						month = 0;
					}
					
				}
				
				DOM.content.appendChild( document.createElement( 'br' ) );
	
				if( typeof backCallFn == 'function' )
					backCallFn();
				else
					fade( DOM.content.childNodes, 'in' );
				
				if( options.dom && ie || ie == 6 ) 
					interface.style.width = parseInt( DOM.main.currentStyle.borderRightWidth ) + parseInt( DOM.main.currentStyle.marginRight ) + DOM.content.lastChild.offsetLeft + 1 + 'px';
				
				if( ie && options.title ) DOM.title.style.width = DOM.content.lastChild.offsetLeft + 1 + 'px';		
				
				if( ie==6 ){	
					var background = document.createElement( 'div' );
					background.style.width = interface.offsetWidth + 'px';
					background.style.height = interface.offsetHeight + 'px';
					background.style.position = 'absolute';
					background.style.zIndex  ='-1';
					background.style.left = 0;
					background.style.top = 0;
					background.innerHTML = '<iframe style="width:' + background.style.width + ';height:' + background.style.height + '" ></iframe>';
					opacity( background,0 );
					interface.appendChild( background );
				}
	
			};
			
			interface.className = options.className;
			
			if( !options.dom ){
				interface.style.left = defaultXY.x = ( options.left || offset( options.target ).x) + 'px';
				interface.style.top = defaultXY.y = ( options.top || offset(options.target).y + options.target.offsetHeight-1 )+ 'px';
			}else{
				interface.style.position = 'relative';
				interface.style.zIndex = 0;
			}
			
			var html = '<div class="main" dom="main">';
			if( options.title )
			html += '     <div class="title" dom="title">' + options.title +'</div>';
			html += '		<div class="content" dom="content"></div>';
			html += '	  </div>';
			interface.innerHTML = html;
			
			each( interface.getElementsByTagName( '*' ),function(){
				if( this.getAttribute( 'dom' ) != null )
					DOM[ this.getAttribute( 'dom' ) ] = this;											  
			});
			
			var setList = function() {
					fade( DOM.content.childNodes , 'out', function() {
							DOM.content.innerHTML = '';
							createList( function() {
								fade( DOM.content.childNodes, 'in' );
							});					 
					});
			};
			
			if( options.move && !options.dom )
			interface.onmouseover = function() {
				  var x,y,w,h,
				  b = document.body.offsetWidth - interface.offsetWidth;
				  interface.onmousedown = function(e){
					   var l = this.offsetLeft,
					   t = this.offsetTop,
					   move = function(e) {
							w = l + evt().x - x;
							h = t + evt().y - y;
							if( b >= w && w >= 0 )
								interface.style.left = w + "px";
							else if( w < 0 )
								interface.style.left = 0 + "px";
							else
								interface.style.left = b + "px";
								interface.style.top = h + "px";
							evt().cancelDefault();
					   };
					   x = evt().x;
					   y = evt().y;

					   addEvent( document, 'mousemove', move);
					   addEvent( document, 'mouseup', function(){
						   if( options.capture && Math.abs( parseInt( interface.style.left ) - parseInt( defaultXY.x ) ) <= 80 && Math.abs( parseInt( interface.style.top ) - parseInt(defaultXY.y) ) <= 80 ){
								interface.style.left = defaultXY.x; 
								interface.style.top = defaultXY.y;
						   }
						   removeEvent( document, 'mousemove', move );
						   removeEvent( document, 'mouseup', arguments.callee );							
						});
				 };
			};
			
			setList();
			
			if( !options.dom ) addEvent( document, 'click', removeDate );
			
			interface.onclick = function(e){
				evt().cancelBubble();
			};
			
			setTimeout( function(){
				interface.style.visibility = 'visible';
			},options.stop ? 500 : 200 );
	};
})( window.DatePicker.config );