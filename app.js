var bodyParser = require("body-parser");
var mongoose   = require("mongoose");
var express    = require("express");
var app        = express();
var methodOverride = require("method-override");
var User = require("./models/user");
var Comment = require("./models/comments");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");


mongoose.connect("mongodb://localhost/restaurants");


app.use(require("express-session")({
    secret:"Abdelaziz Mohamed Elalfy",
    resave:false,
    saveUninitialized:false
}))


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(methodOverride("_method"));

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    next();
});





//SETUP Rrestaurant SCHEMA 

var restaurantSchema = new mongoose.Schema({
    name: String,
    image: String,
    rating : Number,
    address : String,
    number : Number
});

//SETUP restaurant Model

var Restaurant = mongoose.model("restaurant", restaurantSchema)

// Adding New restaurant to DB 

// Restaurant.create({
//     name:"PizzaKing",
//     image:"https://images.unsplash.com/photo-1536090219743-b4d977a0d9f2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
//     rating: 8 ,
//     address : "Nasr city , abbas elakkad"
// }, function(err,restaurant){
//     if(err){
//         console.log("error")
//     }else {
//         console.log("a new restaurant is added to db",restaurant)
//     }
// });




// APPLICATION ROUTES 

app.get("/",function(req,res){
    res.redirect("/restaurants");
})



//====================
//   REGISTER ROUTES
//====================

app.get("/register",function(req,res){
    res.render("register");
})
 
app.post("/register",function(req,res){
    User.register(new User({username: req.body.username}),req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register")
        } else {
            passport.authenticate("local")(req,res,function(){
                res.redirect("/restaurants")
            })
        }
    })
})


//====================
//   LOGIN ROUTES
//====================


app.get("/login",function(req,res){
    res.render("login")
})

app.post("/login",passport.authenticate("local",{
    successRedirect:"/restaurants",
    failureRedirect:"/login"
}),function(req,res){
})



//====================
//   LOGOUT ROUTES
//====================


app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/")
})


// index route show all the restaurants
app.get("/restaurants", function(req,res){
    Restaurant.find({},function(err,restaurants){
        if(err){
            console.log(err)
        } else {
            res.render("index",{restaurants : restaurants})
        }
    })
});


//add new restaurants form
app.get("/restaurants/new",isLoggedIn, function(req,res){
    res.render("new")
});


//submitting the new added restaurants and redirecting to index
app.post("/restaurants",isLoggedIn, function(req,res){
    var name = req.body.name;
    var image = req.body.image;
    var address = req.body.address;
    var newRest = {name : name , image : image , address : address}
    Restaurant.create(newRest,function(err,restaurant){
        if(err){
            console.log(err)
        }else {
            res.redirect("/restaurants")
        }
    })
});


//show a specific restaurant
app.get("/restaurants/:id",isLoggedIn, function(req,res){
    Restaurant.findById(req.params.id,function(err,foundRestaurant){
        if (err){
            console.log(err)
        } else {
            res.render("show", {restaurant : foundRestaurant})
        }
    })
});


//edit a specific restaurant
app.get("/restaurants/:id/edit",isLoggedIn, function(req,res){
    Restaurant.findById(req.params.id , function(err,foundRest){
        if(err){
            console.log(err);
        } else {
            res.render("edit" , {restaurant : foundRest});
        }
    })
});


//submitting the edition 
app.put("/restaurants/:id",isLoggedIn, function(req,res){
    var name = req.body.name;
    var image = req.body.image;
    var address = req.body.address;
    var editedRest = { name : name , image : image , address : address }
    Restaurant.findByIdAndUpdate(req.params.id,editedRest,function(err,updatedRest){
        if (err){
            console.log(err)
        } else {
            res.redirect("/restaurants/"+ req.params.id);
        }
    } )
});


//deleting a specific restaurant
app.delete("/restaurants/:id",isLoggedIn, function(req,res){
    Restaurant.findByIdAndDelete(req.params.id,function(err){
        if(err){
            console.log(err);
        } else {
         res.redirect("/restaurants")   
        }
});




app.get("*",function(req,res){
        res.redirect("/")
    })
});




function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        next()
    } else {
        res.redirect("/login");
    }
}



app.listen(8080,function(){
    console.log("Server has started");
})



