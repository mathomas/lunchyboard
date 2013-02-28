// Set up a collection to contain restaurant information. On the server,
// it is backed by a MongoDB collection named "restaurants".

Restaurants = new Meteor.Collection("restaurants");

Helpers = {
    incrementBy:function (amount) {
        Restaurants.update(Session.get("selected_restaurant"), {$inc:{score:amount}});
    }
};

if (Meteor.isClient) {
    Template.lunchyboard.restaurants = function () {
        return Restaurants.find({}, {sort:{score:-1, name:1}});
    };

    Template.lunchyboard.selected_name = function () {
        var restaurant = Restaurants.findOne(Session.get("selected_restaurant"));
        return restaurant && restaurant.name;
    };

    Template.lunchyboard.any_restaurants = function () {
        return (Restaurants.find({}).count() > 0);
    };

    Template.restaurant.selected = function () {
        return Session.equals("selected_restaurant", this._id) ? "selected" : '';
    };


    Template.lunchyboard.events({
        'click input.inc5':function () {
            Helpers.incrementBy(5);
        },
        'click input.inc3':function () {
            Helpers.incrementBy(3);
        },
        'click input.inc1':function () {
            Helpers.incrementBy(1);
        },
        'click input.clearScores':function () {
            Restaurants.update({}, {$set:{score:0}}, {multi:true});
        },
        'click input.clearAll':function () {
            $(".restaurant").fadeOut(500, function() {
                Restaurants.remove({});
            })
        }
    });


    Template.new_restaurant.events({
        'click, focus input':function (evt) {
            $(evt.target).addClass('typed').val('');
        }
    });

    Template.restaurant.events({
        'click .restaurant':function () {
            Session.set("selected_restaurant", this._id);
        },
        'click .deleter':function (evt) {
            var row = $(evt.target).parent();
            var score = row.children(".score")[0];
            if (score.innerHTML === "0") {
                evt.stopPropagation();
                var that = this;
                row.fadeOut(500, function () {
                    Restaurants.remove({_id:that._id});
                });
            } else {
                evt.stopPropagation();
                $(score).fadeOut(150).fadeIn(150).fadeOut(150).fadeIn(150);
            }
        }
    });

    Template.new_restaurant.events({
        'keypress input.new_restaurant':function (evt) {
            if (evt.keyCode == 13) { // Enter
                var textbox = evt.currentTarget;
                if (textbox.value.length > 0) {
                    var id = Restaurants.insert({name:textbox.value, score:0});
                    textbox.value = "";
                    Session.set("selected_restaurant", id);
                }
            }
        }
    });
}


// On server startup, create some restaurants if the database is empty.
if (Meteor.isServer) {
    Meteor.startup(function () {
//        if (Restaurants.find().count() === 0) {
//            var names = ["The Tavern",
//                "The Tilted Kilt",
//                "Tuk Tuk Thai",
//                "Slattery's",
//                "La Fogata",
//                "Elephant Bar"];
//            for (var i = 0; i < names.length; i++)
//                Restaurants.insert({name:names[i], score:0});
//        }
    });
}
