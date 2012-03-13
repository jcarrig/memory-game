var turn = [];

$(function(){
	
	$('div.card a').click(function(e) {
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
							var won = $(document.createElement('div')).addClass('status green').html('You Won!  <a href="#">Click here to play again.</a>');
							$('div#messages').append(won);
							setTimeout(function() {$('div.status').fadeOut('normal', function(){$(this).remove();})}, 2000);
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
});