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
NMP - Usually installed with NodeJS but can be confirmed with sudo npm install npm -g on Debian machines or running npm -version from command prompt on Windows
Neo4j - http://neo4j.com/
Bower - http://bower.io/

Setup Instructions
==================
Pull the code from https://github.com/IzzyRahaman/COMP3550Project.git
In the root folder, open a command prompt or terminal and run npm install
Open the folder app, and run bower install

Start the Neo4j instance and go the address it points to, run the following queries:

For some reason, the uniqueness constraint in neo4j is being fragile. As such, we need to
manually run the query to enforce uniquenss of hastags:

CREATE CONSTRAINT ON (hashtag:Hashtag) ASSERT hashtag.name IS UNIQUE;
CREATE CONSTRAINT ON (user:User) ASSERT user.identifier IS UNIQUE

The above will also automatically create an index to improve query performance

In the root folder open app.js and in the function call twitter.setUpTwitter(.....) set the first boolean to true
From command line, run node app.js. This will populate the database with the hashtags and build the correlations. Let it run for a few minutes.

Confirm the number of successful relationships by going to the neo4j dashboard and running the following cypher query

Match (h:Hashtag) with count(h) as c_h return c_h

This shows us the number of hashtags currently in the graph database


