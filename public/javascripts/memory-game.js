var turn = [];

$(function(){
	
	//Start a new game of memory from the start button
	$('button#start-btn').click(function(e){
		
		$.ajax({
			url: '/start'
		,	type: "POST"
		,	dataType: "json"
		,	cache: false
		, 	data: { 'tag': $('#search').val() }
		,	success: function(data){
				var cards = data[0].cards;
				var game_id = data[0].game_id;
				if(cards.length > 0) {
					$('div#game').hide().html('loading...');
					var game = $(document.createElement('div'));
					for (var i in cards) {
						var el = $(document.createElement('div')).attr({'id': cards[i].card_id, 'class':'card'});
						el.append($(document.createElement('a')).attr('href', '/flip/'+game_id+'/'+cards[i].card_id).text('flip me'));
						game.append(el);
					}
					$('div#game').hide().html(game).fadeIn();
				}
			}
		,	error: function(jqXHR, textStatus, err){
		   		alert('text status '+textStatus+', err '+err)
		  	}	
		});
	});
	
	//Start a new game of memory from Popular search button
	$('div#popularGameTags button').click(function(e){
		
		$('#search').val($(this).val());
		
		$.ajax({
			url: '/start'
		,	type: "POST"
		,	dataType: "json"
		,	cache: false
		, 	data: { 'tag': $(this).val() }
		,	success: function(data){
				var cards = data[0].cards;
				var game_id = data[0].game_id;
				if(cards.length > 0) {
					$('div#game').hide().html('loading...');
					var game = $(document.createElement('div'));
					for (var i in cards) {
						var el = $(document.createElement('div')).attr({'id': cards[i].card_id, 'class':'card'});
						el.append($(document.createElement('a')).attr('href', '/flip/'+game_id+'/'+cards[i].card_id).text('flip me'));
						game.append(el);
					}
					$('div#game').hide().html(game).fadeIn();
				}
			}
		,	error: function(jqXHR, textStatus, err){
		   		alert('text status '+textStatus+', err '+err)
		  	}	
		});
	});
	
	//Game card flip
	$('div.card a').live('click',function(e) {
		e.preventDefault();
		$(this).addClass('selected');
		//if less than 2 cards have been flipped.
		if($('div.card a.selected').length < 3) {
			$.ajax({
			  url: $(this).attr('href')
			, type: "GET"
			, dataType: "json"
			, cache: false
			, success: function(data){
				var img = $(document.createElement('img')).attr({'src':data.source,'width':'150px','height':'150px'}).addClass('flip');
				$('a.selected').hide();
				$('div#'+data.card_id).append(img);					
				turn.push(data.pic_id);
				if(turn.length == 2) {
					if(turn[0] == turn[1]) {
						// a match is found!
						$('a.selected').remove();
						$('img.flip').addClass('match').removeClass('flip');
						// last match is found - game is over
						if($('img.match').length == 16) {
							var won = $(document.createElement('div')).addClass('status green').html('You Won!  <a class="start-over" href="#search">Click here to play again.</a>');
							$('div#messages').append(won);
							//setTimeout(function() {$('div.status').fadeOut('normal', function(){$(this).remove();})}, 2000);
						}else{
							var msg = $(document.createElement('div')).addClass('status green').text('You found a match!');
							$('div#messages').append(msg);
							setTimeout(function() {$('div.status').fadeOut('normal', function(){$(this).remove();})}, 1000);
						}
						turn = [];
					}else{
						// turn over mis-match cards
						setTimeout(function(){
							$('img.flip').remove();
							$('a.selected').show().removeClass('selected');
						},2000);
						//alert('try again');	
						var msg = $(document.createElement('div')).addClass('status red').text('Those cards don\'t match.  Try again.');
						$('div#messages').append(msg)
						setTimeout(function() {$('div.status').fadeOut('normal', function(){$(this).remove();})}, 1000);
						turn = [];					
					}		
				}
			  }
		    , error: function(jqXHR, textStatus, err){
			   alert('text status '+textStatus+', err '+err)
			  }
			});
		}
	});
	
	$('a.start-over').live('click', function(){
		$('div.status').fadeOut('normal', function(){$(this).remove()});
		$('#search').val('').focus();
	});
	
});