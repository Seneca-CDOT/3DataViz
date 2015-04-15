var Application = Application || {};

/**
 * Application.GlobeRouter (Controller)
 * Perform functions besed on the parameters from URL.
 * @return null
 */
Application.GlobeRouter = Backbone.Router.extend({

  routes : {
    "globeView/spreadsheet" : "initSpreadSheetGlobeView",
    "globeView/statictwitter" : "initStaticTwitterGlobeView",
    "globeView/flightPath" : "initFlightPathGlobeView",
    "globeView/dynamic" : "initDynamicGlobeView",
    //"globeView/population/:action" : "doSomething",
    //"globeView/flightPath/:action" : "doSomething",
    //"globeView/dynamic/:action" : "doSomething",
  },

  // initGlobeView: function(views, collection){

  //   this.rootGlobeView = new Application.RootGlobeView(views, collection);
  //   $("#applicaitonRegion").empty().append(this.rootGlobeView.render().$el[0]);
  // },
  
  // TODO: Dima
  initSpreadSheetGlobeView: function(){

    var that = this;
    require(Application.globeViews.spreadsheet.files , function(){

      // See examples below.

      // from Applicaiton class
      // views: {
      //     globeView: "SpreadSheetGlobeView",
      // },
      // collection: {
      //     globeView: "Tweets"
      // }


      // var views = Application.globeViews.spreadsheet.views;
      // var collection = Application.globeViews.spreadsheet.collection;
      // Application.router.initGlobeView(views, collection);


      //call fetch test
      that.rootGlobeView.globeView.collection.fetch({
        success: function(){
          // console.log(Application.router.rootGlobeView.globeView.collection);
        }
      });

    });
  },

  initStaticTwitterGlobeView: function(){

    var that = this;
    require(Application.globeViews.statictwitter.files , function(){
 
      that.rootGlobeView = new Application.StaticTwitterRootGlobeView();
      $("#applicaitonRegion").empty().append(that.rootGlobeView.$el);
      that.rootGlobeView.render();

      //call fetch test
      that.rootGlobeView.globeView.collection.fetch({
        success: function(){
          // console.log(Application.router.rootGlobeView.globeView.collection);
        }
      });

    });
  },

  initFlightPathGlobeView: function(){

    var that = this;
    require(Application.globeViews.flightPath.files , function(){

      // Very, very wrong!!! If there is a need, subclass from Application.RootGlobeView...
      that.rootGlobeView = new Application.RootGlobeView();
      that.rootGlobeView.globeView = new Application.FlightPathGlobeView();

      $("#applicaitonRegion").empty().append(that.rootGlobeView.$el);
      that.rootGlobeView.render();
    });
  },

  initDynamicGlobeView: function(){

    var that = this;
    require(Application.globeViews.dynamic.files , function(){

      that.rootGlobeView = new Application.DynamicRootGlobeView();
      $("#applicaitonRegion").empty().append(that.rootGlobeView.$el);
      that.rootGlobeView.render();

      //call fetch test
      that.rootGlobeView.globeView.collection.fetch({
        success: function(){
          // console.log(Application.router.rootGlobeView.globeView.collection);
        }
      });

    });
  }

});