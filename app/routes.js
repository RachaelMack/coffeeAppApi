var Post = require('./models/posts.js');
var Token = require('./models/token');

// REQUIRED FOR IMAGE UPLOAD
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var options = multer.diskStorage({ destination : 'assets/uploads/' ,
  filename: function (req, file, cb) {
    cb(null, (Math.random().toString(36)+'00000000000000000').slice(2, 10) + Date.now() + path.extname(file.originalname));
  }
});
var upload = multer({ storage: options });

module.exports = function(app, passport) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs', {
            user : req.user
        });
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user
        });
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/browse');
    });

    app.get('/browse', function(req, res) {
        res.render('browse.ejs', {
            user : req.user
        });
        });

    app.get('/post/new', function(req, res) {
        res.render('post.ejs', {
            user : req.user
        });
        });

     app.get('/nav', function(req, res) {
        res.render('nav.ejs');
        user : req.user
    });
     

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

// locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/browse', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('loginMessage') });
        });

// process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/browse', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// Mobile Login 

       app.post('/api/login', function(req, res) {
       passport.authenticate('local-login', function(err, user, info) {
 
           //an error was encountered (ie. no database available)
           if (err) {  
             return next(err); 
           }
 
           //a user wasn't returned; this means that the user isn't available, or the login information is incorrect
           if (!user) {  
             return res.json({
               'loginstatus' : 'failure',
               'message' : info.message
             }); 
           }
           else {  

            //success!  create a token and return the successful status and the if of the logged in user

            // create a token (random 32 character string)
            var token = Math.round((Math.pow(36, 32 + 1) - Math.random() * Math.pow(36, 32))).toString(36).slice(1);

            // add the token to the database
            Token.create({
              user_id: user.id,
              token: token,
            }, function(err, tokenRes) {
              if (err)
                  res.send(err);

              return res.json({
                'loginstatus' : 'success',
                'userid' : user.id,
                'token' : token,
              });
            });
           }
         })(req, res);
     });

// authenticates a userid/token combination
    app.post('/api/authlogin', function(req, res) {

        if (!req.param('user_id') || !req.param('token')) {
            
            // user_id/token combination not complete, return invalid
            return res.json({ status: 'error'});
        }

        // attempt to retrieve the token info
        Token.find({
          user_id: req.param('user_id'),
          token: req.param('token'),
        }, function(err, tokenRes) {
          if (err)
              return res.json(err);

          // not found
          if (!tokenRes) {
              res.json({ status: 'error'});
          }

          // all checks pass, we're good!
          return res.json({ status: 'success'});
        });
    });

    app.post('/api/phoneposts', upload.single('file'), isApiLoggedIn, function(req, res) {

          var postInfo = JSON.parse(req.body.info);

          var postColumns = {
            title : postInfo.title,
            hashtag: postInfo.hashtag,
            address: postInfo.address,
            done : false
          };
          console.log("post Columns pass 1");
          console.log(postColumns);

          User.findById(req.body.user_id, function(err, user) {
              if (err)
                  res.send({ status: 'error', message: "We're sorry, but there was an error with your request"});

              // not found
              if (!user) {
                  res.send({ status: 'error', message: "You're not real!"});
              }

              postColumns.author = user.local.display_name;
              console.log("post Columns pass 2");
              console.log(postColumns);

              // save the image (if applicable)
              if (req.file.filename != "") {

                postColumns.photo = req.file.filename;
                console.log("post Columns pass 3");
                console.log(postColumns);

                // there is an image found, save the image data and continue 
                if (err)
                  console.log(err);

                // create a todo, information comes from AJAX request from Angular
                Post.create(postColumns, function(err, post) {
                    if (err)
                        res.send(err);
                });
              }
              else {

                // No image, save with the empty image variable
                postColumns.photo = "";
                console.log("Post Columns pass 4");
                console.log(todoColumns);

                // create a todo, information comes from AJAX request from Angular
                Post.create(postColumns, function(err, posts) {
                    if (err)
                        res.send(err);

                    // get and return all the todos after you create another
                    Post.find(function(err, posts) {
                        if (err)
                            res.send(err)
                        return res.json(posts);
                    });
                });
              }
          });

      });
    };


    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

        // handle the callback after facebook has authenticated the user
        app.get('/auth/facebook/callback',
            passport.authenticate('facebook', {
                successRedirect : '/browse',
                failureRedirect : '/'
            }));


    // google ---------------------------------

        // send to google to do the authentication
        app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

        // the callback after google has authenticated the user
        app.get('/auth/google/callback',
            passport.authenticate('google', {
                successRedirect : '/browse',
                failureRedirect : '/'
            }));

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

    // locally --------------------------------
        app.get('/connect/local', function(req, res) {
            res.render('connect-local.ejs', { message: req.flash('loginMessage') });
        });
        app.post('/connect/local', passport.authenticate('local-signup', {
            successRedirect : '/browse', // redirect to the secure profile section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

        // handle the callback after facebook has authorized the user
        app.get('/connect/facebook/callback',
            passport.authorize('facebook', {
                successRedirect : '/browse',
                failureRedirect : '/'
            }));

    // twitter --------------------------------

        // send to twitter to do the authentication
        app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

        // handle the callback after twitter has authorized the user
        app.get('/connect/twitter/callback',
            passport.authorize('twitter', {
                successRedirect : '/browse',
                failureRedirect : '/'
            }));


    // google ---------------------------------

        // send to google to do the authentication
        app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

        // the callback after google has authorized the user
        app.get('/connect/google/callback',
            passport.authorize('google', {
                successRedirect : '/browse',
                failureRedirect : '/'
            }));

        // POST ITEMS =============================================================
// =============================================================================
        app.get('/post/new', function(req, res) {
        res.render('post.ejs');
        });

    app.post('/api/post', isApiLoggedIn, upload.single('file'), function(req, res) {

    // var newPost = new Post();
        Post.create({
           title : req.body.info.title,
           hashtag : req.body.info.hashtag,
           address: req.body.info.address,
           photo: req.file.filename,
            done : false
        }, function(err, post) {
            if (err)
                res.send(err);
        });

        

    });

    app.get('/api/post', function(req, res) {
            Post.find({}, function(err, posts){
                return res.json(posts);
            })
        });
// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // facebook -------------------------------
    app.get('/unlink/facebook', function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // google ---------------------------------
    app.get('/unlink/google', function(req, res) {
        var user          = req.user;
        user.google.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });


};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

// route middleware for API
function isApiLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated()) {
        return next();
    }
    else if (req.body.user_id && req.body.token) {
        Token.find({
          user_id: req.body.user_id,
          token: req.body.token,
        }, function(err, tokenRes) {
          if (err)
              res.send({ status: 'error', message: "why aren't you logged in?"});

          // not found
          if (!tokenRes) {
              res.send({ status: 'error', message: "why aren't you logged in?"});
          }

          // all checks pass, we're good!
          return next();
        });
    }
    else {
      res.send({ status: 'error', message: "why aren't you logged in?"});
    }
}