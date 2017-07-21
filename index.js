var Alexa=require('alexa-sdk');
var request=require('request');
var cheerio=require('cheerio');
var express=require('express');

var states={
	SEARCHMODE:'_SEARCHMODE',
	DESCRIPTION:'_DESKMODE'
};

// Message when the skill is first called
var welcomeMessage = "You can ask for the Local places. Search for Shops by places. or say help. What would you like? ";

// Message for help intent
var HelpMessage = "Here are some things you can say: Ask Local Business to search for pizza in stoke on trent";

// Used to tell user skill is closing
var shutdownMessage = "Ok see you again soon.";

var killSkillMessage = "Ok, great, see you next time.";

// output for Alexa
var output = "";

var alexa;

var sessionhandlers = {
	'LaunchRequest': function () {
		this.emit('Welcome to Bristols Local Listings.Ask for your nearby places with the location.');
	},

	'searchIntent': function () {
		this.handler.state=states.SEARCHMODE;
		this.emitwithState(searchIntent);
	},
	'Unhandled': function () {
		this.emit(':ask', HelpMessage, HelpMessage);
	},
};

var startSearchHandlers=alexa.CreateStateHandler(states.SEARCHMODE,{
	'AMAZON.YesIntent': function () {
		output = welcomeMessage;
		alexa.emit(':ask', output, welcomeMessage);
	},

	'AMAZON.NoIntent': function () {
		this.emit(':tell', shutdownMessage);
	},

	'AMAZON.RepeatIntent': function () {
		this.emit(':ask', output, HelpMessage);
	},

	'searchIntent':function(){
		var Shops = this.event.request.intent.slots.shop.value;
		var Places = this.event.request.intent.slots.place.value;
		if(Shops != undefined && Places != undefined)
		{
			var URL="http://directory.stokesentinel.co.uk/search/place/shop";
			var url1=URL.replace(/place/i,Places);
			var url2=url1.replace(/shop/i,Shops);
			request(url2, function (error, response, html) {
				if (!error && response.statusCode == 200) {
      // console.log(html);
      var $=cheerio.load(html);
      var json=[];
      // let i=0;
      $('h2.ser-title').each(function(){
      	var result = $(this);
      	var shop={title:result.text().trim()};
      	json.push(shop);
       //  i++;
       // console.log(i);
      	// console.log(result.text());
      });
      console.log(json)

  }
  else{
  	console.log(error);
  }
});
		}
	},

	'AMAZON.HelpIntent': function () {
		output = HelpMessage;
		this.emit(':ask', output, output);
	},

	'AMAZON.StopIntent': function () {
		this.emit(':tell', killSkillMessage);
	},

	'AMAZON.CancelIntent': function () {
		this.emit(':tell', killSkillMessage);
	},

	'SessionEndedRequest': function () {
		this.emit('AMAZON.StopIntent');
	},

	'Unhandled': function () {
		this.emit(':ask', HelpMessage, HelpMessage);
	}
})





exports.handler = function(event, context, callback){

	var alexahandle = Alexa.handler(event, context,callback);
	alexahandle.registerHandlers(sessionhandlers,startSearchHandlers);
	alexahandle.execute();
};






































