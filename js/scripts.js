
$(function() {
	window.SITE_URL = 'http://ryan-j-carter.github.io/multistream';
	window.CLIENT_ID = 'guub8xzlawnd08u9i6rkjh2ehpuim6t';
	window.USER;
	window.STREAMS;

	//Initialize Twitch SDK with application Client ID
  	Twitch.init({clientId: CLIENT_ID}, function(error, status) {
  		if (error) {
  			console.log(error);
  		}
  		if (status.authenticated) {
  			$('#login-btn').addClass('hidden');
  			$('#welcome-user').removeClass('hidden');
  			TOKEN = Twitch.getToken();
  		}
  	});

  	//Load Twitch account authorization when Connect button is clicked
  	//Redirect back to same page
  	$('.twitch-connect').click(function() {
		Twitch.login({
			scope: ['user_read', 'chat_login'],
			redirect_uri: SITE_URL
		});
	});
});

function getUrlParameter(param_name) {
	var urlString = document.location.hash.substring(1);
	var urlParams = urlString.split('&');
	var urlComponent;
	for (var i = 0; i < urlParams.length; i++) {
		urlComponent = urlParams[i].split('=');
		if (urlComponent[0] == param_name) {
			return urlComponent[1];
		}
	}
	console.log("Bad param name");
}

function getUser() {
	$.ajax({
		url: 'https://api.twitch.tv/kraken/user', 
		data: {oauth_token: getUrlParameter('access_token')},
		datatype: 'jsonp',
		success: function(user) {
			USER = user.display_name;
			$('#username').html(USER);
		}
	});
}

function getStreams() {
	$.ajax({
		url: 'https://api.twitch.tv/kraken/streams/followed',
		data: {oauth_token: getUrlParameter('access_token')},
		datatype: 'jsonp',
		success: function(data) {
			STREAMS = data.streams;
			console.log(data);
			var itemHtml;
			var streamer;
			for(var i = 0; i < STREAMS.length; i++) {
				streamer = STREAMS[i].channel.name;
				itemHtml = 	"<li>" +
							"<a class=\"stream-name tx-dark\"data-name=\""+streamer+"\">" + STREAMS[i].channel.display_name + "</a>" +
							"<div class=\"stream-options\">" +
							"<input class=\"check-chat\" type=\"checkbox\" data-name=\""+streamer+"\" data-url=\"https://www.twitch.tv/"+streamer+"/chat\" />Chat<br>" +
							"<input class=\"check-stream\" type=\"checkbox\" data-name=\""+streamer+"\" data-url=\"https://player.twitch.tv/?channel="+streamer+"\" />Stream" +
							"<span><a class=\"twitch-link\" href=\"https://www.twitch.tv/"+streamer+"\"><img src=\"images/GlitchIcon_purple.png\" width=\"30px\" height=\"30px\"></a></span>" +
							"</div>" +
							"</li>";
				$('#following').append(itemHtml);
			}
			$('.stream-name').click(function() {
				$('html,body').animate({scrollTop: $('#'+$(this).data("name")).offset().top}, 'slow');
			});
			$('.check-chat').click(function() {
				toggleMedia($(this));
			});
			$('.check-stream').click(function() {
				toggleMedia($(this));
			});
		}
	});
}

function toggleMedia(context) {
	var name = context.data("name");
	var mediaUrl = context.data("url");
	if (context.is(':checked')) {
		if (!($('#'+name).length)) {
			$('#content').append('<div id="'+name+'" class="media"></div>');
		}
		if (context.hasClass("check-chat")) {
			$('#'+name).append('<iframe frameborder="0" scrolling="no" id="chat-'+name+'" class="chat-embed" src="'+mediaUrl+'" height="400" width="350"></iframe>');
		}
		else if (context.hasClass("check-stream")) {
			$('#'+name).append('<iframe src="'+mediaUrl+'" id="stream-'+name+'" class="stream-embed" height="400" width="711" frameborder="0" scrolling="no" allowfullscreen="true"></iframe>');
		}
	}
	else {
		if (context.hasClass("check-chat")) {
			$('#chat-'+name).remove();
			if (!($('#stream-'+name).length)) {
				$('#'+name).remove();
			}
		}
		else if (context.hasClass("check-stream")) {
			$('#stream-'+name).remove();
			if (!($('#chat-'+name).length)) {
				$('#'+name).remove();
			}
		}
	}
}

$(document).ready(function() {
	$('#logout').click(function() {
		Twitch.logout(function(error) {
			if (!error) {
  				document.location = SITE_URL;
			}
		});
	});

	Twitch.getStatus(function(error, status) {
		if (error) {
			console.log(error);
		}
		if (status.authenticated) {
			getUser();
			getStreams();
		}
		else {
			$('body').show();
		}
		$('body').show();
	});
});