# conTEXT: ReSA (Real-time Sentiment Analysis)

Based on [Powder.js](https://github.com/yamalight/generator-powder)
ReSA annotates real-time streams (e.g. Twitter streams) using Linked Data and provides views for real-time text analytics. It calculates sentiment for the given company. ReSA is an extension of conTEXT platform for lightweight text analytics available at http://context.aksw.org

###Requirements

Latest Node.js + NPM

Latest MongoDB

Bower (get by running "npm install -g bower")

Gulp (get by running "npm install -g gulp")

###How to Install

1.	Install the required NodeJS modules
	npm install

2.	Configure Twitter API keys
	open config.sample.js and fill in the required keys under the twitter app config and save it as config.js

3.	To start NodeJS server: 
	start MongoDB server
	run the command "gulp"

4.	Run the web browser
	Copy the link in the browser http://localhost:8082/resa

###User Manual

User can select any company and the sentiment graph interval from the drop-down list. User can then click on the ‘start’ button which is colored green. After clicking the ‘start’ button, the button turns its color to orange and user can see the stream of the real-time tweets at the right side. The tweets will have annotations of the DBpedia entities (if the tweets contain DBpedia entities). In the tab ‘Bubble Cloud’, user can see the growing bubbles with the special formation that depends on the annotations in the tweets. In the ‘Sentiment Graph’ tab, user can see the continuous graph that is being modified continuously according to the interval selected and the sentiment calculated by the application. The user can anytime click the orange button which can stop the process. User can then select to start the process again or can choose to reset the variables by clicking ‘reset’ button. The ‘reset’ button, which is next to start/stop button, enables user to select different company. Also, with ‘reset’ button, the sentiment value is set to zero. 


