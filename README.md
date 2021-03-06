COMP3550Project
===============
An attempt to solve the problem of information overload with respect to twitter 

Inzamam Rahaman - 810006495

Jherez Taylor - 812003287

Steffan Boodhoo - 812003126

Akash Manohar - 812002280

Requirements
============
NodeJS - http://nodejs.org/

NPM - Usually installed with NodeJS but can be confirmed with `npm -v` on Debian machines or running `npm version` from command prompt on Windows

Neo4j - http://neo4j.com/

Bower - http://bower.io/

Setup Instructions
==================
Pull the code from https://github.com/IzzyRahaman/COMP3550Project.git

In the root folder, open a command prompt or terminal and run npm install

Open the folder app, and run bower install

Start the Neo4j instance and go the address it points to, run the following queries:

For some reason, the uniqueness constraint in neo4j is being fragile. As such, we need to manually run the query to enforce uniquenss of hastags:

`CREATE CONSTRAINT ON (hashtag:Hashtag) ASSERT hashtag.name IS UNIQUE`

`CREATE CONSTRAINT ON (user:User) ASSERT user.identifier IS UNIQUE`

The above will also automatically create an index to improve query performance

For dev purposes- in the root folder open app.js and in the function call twitter.setUpTwitter(.....) set the first boolean to false to stop the database from populating

From command line, run `node app.js` This will populate the database with the hashtags and build the correlations. Let it run for a few minutes

Confirm the number of successful relationships by going to the neo4j dashboard and running the following cypher query

`Match (h:Hashtag) with count(h) as c_h return c_h`

While the neo4j instance is running, from root folder, run `node app.js`

Nagivate to localhost:3000

Usage
==================

The first step would be to register with an email address and login

In the subscribe filed, enter hashtags that you want to see correlations on

In the nav bar, hit graph. Select the desired tag


CS Topic - Modularity
==================

Modularity was a core design principle of both the front-end and the back-end. 

At the back-end, node modules were used extensively, with each module only dealing with a specific class of concerns. Within the modules, care was taken to ensure that code was written modularly as well. For example, serveral higher-order functions were implemented that wrapped their submitted function in a new function that is then returned. These modules were all stored in the ~/lib folder. 

At the front-end, modularity was enforced using angular controllers and angular services in accord with the MVVM architecture. Angular services were made responsible for all DOM manipulations and ajax requests and were utilized by angular controllers that equested services from the angular services and/or  registered themselves as observers to the services, thereby enabling the controllers to remain specific to certain concerns while allowing the manipulation at regions not under the auspices of a controller indirectly. Moreover, modularity was enforced with the non-angular code as well, as specific javascript code (wrapped in self-executed functions) and css code were relegated to specific files
These characteristics were explified by ~/app/js/angularApps and ~/app/js and ~/app/css

CS Topic - Information Overload
======================

Information overload refers to the phenomenon that users are inudated with so much information that they are bewildered and find themselves unable to extract meaningful insight from data.

The naive solution to the problem of Information overload is to restrict the data being streamed to users based on their stated preferences. However, with this naive solution emerges a problem - users may be prevented from viewing data that they might be interested in since they may not be directly within the scope of their preferences. Consequently, it would be useful to derive some method and/or metric to determine what information a user might be interested in given the information they are aware they are interested in. This is the slant of our solution.

Twitter is a prime example of a source of information overload. Tweets in twitter may be classified according to the hashtags assigned to them by the denizens of the twitterverse. In our solution, we leveraged a graph model, represented and stored in the graph database neo4j, to connect hashtags with one another. The database was populated using the tweets received from the twitter streaming API, from where hashtags were extracted and correlated using a variant of the Jaccard Index based on hashtags' concomitancy with one another. 

Our users then subscribe to hashtags and can then view an extracted subgraph and the tweets associated with the hashtags in the subgraph, facilitating the delivery of tweets according to hashtags that they are interested in and tweets related to those hashtags, thereby easing the problem of information overload

