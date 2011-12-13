var Movie = Backbone.Model.extend({
  validate: function(attrs) {
	if (attrs.title) {
	  if (!_.isString(attrs.title) || attrs.title.length === 0) {
		return 'Title must be a string with a length';
	  }
	}
  }
});

var MovieCollection = Backbone.Collection.extend({
  model: Movie
});

var MovieView = Backbone.View.extend({
  initialize: function(args) {
	_.bindAll(this, 'changeTitle');
	this.model.bind('change:title', this.changeTitle);
  },

  events: {
	'click .title': 'handleTitleClick'
  },

  render: function() {
	var template = '\
	  <li id="movie_{{ cid }}"><span class="title">{{ title }}</span> <span>{{ format }}</span>   <a href="#movies/remove/{{ cid }}">x</a></li>\
	';
	var context = _.extend(this.model.toJSON(), {cid: this.model.cid});
	$(this.el).html(Mustache.to_html(template, context));
	return this;
  },

  changeTitle: function() {
	this.$('.title').text(this.model.get('title'));
  },

  handleTitleClick: function() {
	alert('you clicked the title: '+this.model.get('title'));
  }
});

var MovieAppModel = Backbone.Model.extend({
  initialize: function() {
	this.movies = new MovieCollection();
  }
});

var MovieAppView = Backbone.View.extend({
  initialize: function() {
	_.bindAll(this, "addMovie", "removeMovie");
	this.model.movies.bind('add', this.addMovie);
	this.model.movies.bind('remove', this.removeMovie);
  },

  render: function() {
	var template = '\
	  <h1>Movie App</h1>\
	  <a href="#movies/add">add new movie</a>\
	  <ul id="movieList"></ul>';
	$(this.el).html(Mustache.to_html(template, this.model.toJSON()));
	this.movieList = this.$('#movieList');
	return this;
  },

  addMovie: function(movie) {
	var view = new MovieView({model: movie});
	this.movieList.append(view.render().el);
  },

  removeMovie: function(movie) {
	this.$('#movie_'+movie.cid).remove();
  }
});

var MovieAppController = Backbone.Router.extend({
  initialize: function(params) {
	this.model = new MovieAppModel();
	this.view = new MovieAppView({model: this.model});
	params.append_at.append(this.view.render().el);
  },

  routes: {
	"movies/add": "add",
	"movies/remove/:number": "remove",
  },

  add: function() {
	app.model.movies.add(new Movie({
	  title: 'The Matrix ' + Math.floor(Math.random()*11),
	  format: 'dvd'
	  })
	);
	this.saveLocation(); // reset location so we can trigger again
  },

  remove: function(cid) {
	app.model.movies.remove(app.model.movies.getByCid(cid));
  },
});


$(function() {
  var movieApp = new MovieAppController({append_at: $('body')});
  window.app = movieApp;
  Backbone.history.start();
});