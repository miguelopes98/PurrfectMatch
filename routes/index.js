var express = require("express"),
	router = express.Router({mergeParams: true}),
	passport = require("passport"),
	middleware = require("../middleware/index.js"),
	Shelter = require("../models/shelter.js"),
	Dog = require("../models/dog.js"),
	Comment = require("../models/comment.js"),
	Review = require("../models/reviews.js"),
	User = require("../models/user.js"),
	async = require("async"),
	nodemailer = require("nodemailer"),
	crypto = require("crypto");



//root route
router.get("/", function(req, res){
	res.render("landing.ejs");
});

//Asks the user what type of account he wants to create, normal or shelter account
router.get("/register", function(req, res){
	res.render("registerQuestion.ejs");
});

//shows form to create a user account
router.get("/register/user", function(req, res){
	res.render("registerUser");
});

//handling user sign up logic
router.post("/register/user", function(req, res){
	var newUser = new User(
	{
		username: req.body.username,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		avatar: req.body.avatar,
		description: req.body.description,
		email: req.body.email,
		role: "user"
	});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("back");
		}
		//if we successfully register the user, we log them in automatically and send them to /dogs
		passport.authenticate("local")(req, res, function(){
			req.flash("success", "Welcome to Purrfect Match " + user.username);
			res.redirect("/dogs");
		});
	});
});

//shows form to create a shelter account
router.get("/register/shelter", function(req, res){
	res.render("registerShelter");
});

//properly handle shelter account registering
router.post("/register/shelter", function(req, res){
	//we create the shelter's account and straight after that, we create the shelter's object to add to the index page
	var newShelterUser = new User(
	{
		username: req.body.username,
		name: req.body.name,
		address: req.body.address,
		avatar: req.body.avatar,
		description: req.body.description,
		email: req.body.email,
		phoneNumber: req.body.phoneNumber,
		schedule: req.body.schedule,
		websiteUrl: req.body.websiteUrl,
		role: "shelterUser"
	});
	
	User.register(newShelterUser, req.body.password, function(err, user){
		if(err){
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("/resgister/shelter");
		}
		//if we successfully register the shelter account, we log them in automatically, then we redirect them to create the respective shelter object and send a post request to /shelters so the shelter object is created with the information we already have
		passport.authenticate("local")(req, res, function(){
			// the first param is to send a post request instead of a get
			req.flash("success", "Welcome to Purrfect Match " + user.username);
			res.redirect(307, "/shelters");
		});
	});
});

//shows login form
router.get("/login", function(req, res){
	res.render("login.ejs");
});

//handling login logic
router.post("/login", 
	middleware.userBruteforce.getMiddleware({
		key: function(req, res, next) {
			// prevent too many attempts for the same username
			next(req.body.username);
		}
    }), 
	passport.authenticate("local",
	{
		failureRedirect: "/login",
		successFlash: "You have successfully logged in.",
		failureFlash: true
	}), 
	function(req, res){
		//resets the time a user is blocked from trying if he manages to login before failing again
		req.brute.reset(function(){});
		res.redirect("/shelters");
});

//logout route
router.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "You have successfully logged out.");
	res.redirect("/");
});

//FORGOT PASSWORD LOGIC AND ROUTES
router.get('/forgot', function(req, res) {
  res.render('forgot');
});

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'mikescoursemail@gmail.com',
          pass: 'signinapril'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'mikescoursemail@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'mikescoursemail@gmail.com',
          pass: 'singinapril'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'mikescoursemail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/shelters');
  });
});

module.exports = router;