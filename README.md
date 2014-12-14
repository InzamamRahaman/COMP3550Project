COMP3550Project
===============
An attempt to solve the problem of information overload with respect to twitter 

For some reason, the uniqueness constraint in neo4j is being fragile. As such, we need to
manually run the query to enforce uniquenss of hastags:

CREATE CONSTRAINT ON (hashtag:Hashtag) ASSERT hashtag.name IS UNIQUE;
CREATE CONSTRAINT ON (user:User) ASSERT user.identifier IS UNIQUE


The above will also automatically create an index to improve query performance