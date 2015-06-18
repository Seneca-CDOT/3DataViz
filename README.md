#3D data visualization project (Draft)

In this project we are developing a web application prototype that will allow users to visualize their data in the 3D world.

Our main focus in this project is creating a mechanism or tool that can process various types of data formats and visualize them on a specific visualization template that we have built so that users can visualize their data in the 3D world without knowing about much of the technologies around it.

##Demo
http://seneca-cdot.github.io/3DataViz/

1. Choose a data source from the following options.
  - **twitterDB** - collected tweets from Apple Worldwide Developers Conference 2015 (WWDC2015)
  - **twitterLive** - live tweets with a specific keyword
  - **csv** - flight path ( currently you cannot choose different a file for it )
  - **spread sheet** - google spread sheet ( currently only this [data](https://docs.google.com/spreadsheets/d/13aV2htkF_dYz4uU76mJMhFfDBxrCkD1jJI5ktw4lBLg/pubhtml) works. )
  - **google trends** - google trends with a specific keyword.

2. Fill out the required information for the option you choose if necessary.
3. Choose rendering type from Geometry or Texture.
4. Choose template type from options.
5. Click visualize.

---
##Architecture
What we have built so far is an application prototype that consists of:
- Architecture
- Data Processor ( Client )
- Visualization Templates ( Client )
- APIs ( Server )

Here is the diagram of our application architecture.
![Alt text](http://seneca-cdot.github.io/3DataViz/images/3dataviz-architect.png)

###Data Processor - Parser & Transformer
![Alt text](http://seneca-cdot.github.io/3DataViz/images/3dataviz-dataprocessor.png)


The data processor is one of the most important parts of our project. There are two main modules within the data processor. One module is the **parser** and the other one is the **transformer**.

When the parser receives data and its data type the parser will choose suitable functions to parse it. Then the parser will output **normalized data** and pass this data to the transformer.

The transformer will transform the **normalized data** in the format that the specific visualization template can understand and visualize the data.
 
###Visualization Templates
There are currently four different types of visualization templates in our application.
  1. **Countries** - This template colourizes the top 10 countries from the data given.
  2. **Points** - This template plots images onto the globe, where each image represents the location where each data occurs. 
  3. **Dynamic** - This template shows a sparkle object above the globe, where each sparkle represents the location where each data occurs. This data will be given dynamically.
  4. **Flight path** - This template will visualize a flight path from departure to destination. 
  
###APIs
There are currently two APIs that we provide from server side.
  1. **Twitter data which is aggregated in DB** - We collected tweets for WWDC2015 and save them to our database. We provide a REST API to retrieve those data to visualize.
  2. **Live tweets from Twitter** - This API provides a web socket connection that delivers live tweets from Twitter Streaming API.

##Contacts
If you have any feedbacks for our project or any other use cases that you would like to achieve using our application please let us know.
  - [@cathyatseneca](https://github.com/cathyatseneca)
  - [@hamabama](https://github.com/Hamabama)
  - [@collamo](https://github.com/collamo)
