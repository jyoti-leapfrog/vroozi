
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index');
};

exports.login = function(req, res){
  res.render('frontpage', {
      sessionMessage: "none"
  });
};

exports.session = function(req, res){
  res.render('frontpage', {
      sessionMessage: "block"
  });
};

exports.partials = function(req, res){
  res.render(req.params.name);
};