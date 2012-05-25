$(function(){
	//parent.$('iframe')[0].contentWindow.document.designMode = 'on';
	/*
	$(document).contextmenu(function( ev ){
		if(ev.button == 2){
			ev.stopPropagation();
			$('.btns-action').remove();
			var btns = createAllButtons();
			btns.css({'left':ev.pageX,'top':ev.pageY});
			$(document.body).append(btns);
			return false;
		}
	});
	$(document.body).click(function(ev){
		$('.btns-action').remove();
	});
	var createAllButtons = function(){
		var btnsHtml =  '<div class="btns-action" style="position:absolute;">'+
						'<ul class="nav nav-pills">'+
							'<li>button1</li>'+
							'<li>button1</li>'+
							'<li>button1</li>'+
							'<li>button1</li>'+
							'<li>button1</li>'+
							'<li>button1</li>'+
							'<li>button1</li>'+
							'<li>button1</li>'+
							'<li>button1</li>'+
							'<li>button1</li>'+
							'<li>button1</li>'+
							'<li>button1</li>'+
							'</ul>'+
						'</div>';
		btnsHtml = $(btnsHtml);
		btnsHtml.find('li').click(function(ev){
			ev.stopPropagation();
		});
		btnsHtml.find('div,ul,li').click(function(ev){
			ev.stopPropagation();
		});
		return btnsHtml;
	}
	*/
})