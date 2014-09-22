var GithubApi = require('github'),
  base64 = require('base64'),
  fs = require('fs'),
  _ = require("underscore"),
  async = require("async"),
  config = require("./config/config.js");

var app = {};

app.config = config;
app.github = new GithubApi({version: "3.0.0"});
app.pageTemplate = fs.readFileSync(config.pageTemplate, {encoding: 'utf8'});
app.indexTemplate = fs.readFileSync(config.indexTemplate, {encoding: 'utf8'});
app.theme = fs.readFileSync(app.config.theme, {encoding: 'utf8'});
app.index = {pages:[]};

// clear index sql file
fs.writeFileSync(config.indexSqlFile, '', {encoding: 'utf8'});

fs.readFile('repository.json', 'utf8', function (err, data) {
  if (err) {
    return console.log('Error: ' + err);
  }
  var config = JSON.parse(data);
  var repos = _.map(_.pairs(config.repos), function (pair) {
    return {name: pair[0], repo: pair[1].split('/')[1], user: pair[1].split('/')[0]};
  });

  async.each(repos, function (repo, callback) {
    app.github.repos.getReadme({headers:{Accept: "application/vnd.github.v3.html"}, user: repo.user, repo:repo.repo}, function (err, res) {
      var templateData = {};
      templateData.theme = app.theme;
      templateData.title = repo.name;
      templateData.content = res.data;
      templateData.url = app.config.pagesPath + '/' + repo.name + '.html';

      async.parallel([function (cb) {
        // create page
        fs.writeFile(templateData.url, _.template(app.pageTemplate)(templateData), function (err) {
          cb(err);
        });
      }, function (cb) {
        app.index.pages.push({name: templateData.title, url: templateData.url });
        // create sqlite index
        fs.appendFile(app.config.indexSqlFile, "INSERT OR IGNORE INTO searchIndex(name, type, path) VALUES (\""
          +templateData.title+"\", \"Guide\", \""+templateData.url+"\");\n", function (err) {
          cb(err);
        });
      }], function (err, results) {
        if (err) {
          console.log(err);
          process.exit(0);
        }
        callback();
      });
    });
  }, function (err, results) {
    fs.writeFile(app.config.indexPage, _.template(app.indexTemplate)(app.index), function(err) {
      console.log("done");
    });
  });



});


