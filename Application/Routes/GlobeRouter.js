var Application = Application || {};

/**
 * Application.GlobeRouter (Controller)
 * Perform functions besed on the parameters from URL.
 * @return null
 */
Application.GlobeRouter = Backbone.Router.extend({

  routes : {
    "globeView/spreadSheet" : "initSpreadSheetGlobeView",
    "globeView/staticTwitter" : "initStaticTwitterGlobeView",
    "globeView/flightPath" : "initFlightPathGlobeView",
    "globeView/dynamic" : "initDynamicGlobeView",
    "globeView/googleTrends" : "initGoogleTrendsGlobeView"
    // "globeView/spreadsheet/request/:id" : "request",
    //"globeView/flightPath/:action" : "doSomething",
    //"globeView/dynamic/:action" : "doSomething",
  },

  // initGlobeView: function(views, collection){

  //   this.rootGlobeView = new Application.RootGlobeView(views, collection);
  //   $("#applicaitonRegion").empty().append(this.rootGlobeView.render().$el[0]);
  // },
  initGoogleTrendsGlobeView: function(){

    var that = this;
    require(Application.globeViews.googleTrends.files , function(){

      that.rootGlobeView = new Application.GoogleTrendsRootGlobeView();
      $("#applicaitonRegion").empty().append(that.rootGlobeView.$el);
      that.rootGlobeView.render();

      //call fetch test
      // that.rootGlobeView.globeView.collection.fetch({
      //   success: function(){
      //     // console.log(Application.router.rootGlobeView.globeView.collection);
      //   }
      // });

    });
  },
  initSpreadSheetGlobeView: function(){

    var that = this;
    require(Application.globeViews.spreadSheet.files , function(){

      that.rootGlobeView = new Application.SpreadSheetRootGlobeView();
      $("#applicaitonRegion").empty().append(that.rootGlobeView.$el);
      that.rootGlobeView.render();

      //call fetch test
      // that.rootGlobeView.globeView.collection.fetch({
      //   success: function(){
      //     // console.log(Application.router.rootGlobeView.globeView.collection);
      //   }
      // });

    });
  },

  initStaticTwitterGlobeView: function(){

    var that = this;
    require(Application.globeViews.staticTwitter.files , function(){

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
      that.rootGlobeView = new Application.FlightPathRootGlobeView();
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
  },
  request: function (id) { 

      Application.router.rootGlobeView.globeView.collection.trigger("grab", id );
  }

});
