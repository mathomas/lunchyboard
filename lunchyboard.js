// Set up a collection to contain restaurant information. On the server,
// it is backed by a MongoDB collection named "restaurants".

Restaurants = new Meteor.Collection("restaurants");
Occasions = new Meteor.Collection("occasions");

Util = {
    getPath:function () {
        return location.toString().split('/')[3];
    },
    baseUrl:function() {
        return window.location.protocol + "//" + window.location.host + "/";
    }
};

UI = {
    handleTyping:function (evt) {
        $(evt.target).addClass('typed').val('');
    }
};


Occasion = {
    addOccasion:function (evt) {
        var textbox = evt.currentTarget;
        if (textbox.value.length > 0) {
            var id = Occasions.insert({name:textbox.value});
            Occasion.set(id);
        }
        Session.set("selected_restaurant", undefined);
    },
    current:function () {
        return Session.get("selected_occasion");
    },
    set:function(occasion_id) {
        Session.set("selected_occasion", occasion_id);
    }
};


Restaurant = {
    addRestaurant:function (evt) {
        var textbox = evt.currentTarget;
        if (textbox.value.length > 0) {
            var id = Restaurants.insert({name:textbox.value, score:0, occasion:Occasion.current()});
            Session.set("selected_restaurant", id);
        }
    },
    incrementBy:function (amount) {
        Restaurants.update(Session.get("selected_restaurant"), {$inc:{score:amount}});
    },
    deleteRestaurant:function (evt) {
        var row = $(evt.target).parent();
        var score = row.children(".score")[0];
        if (score.innerHTML === "0") {
            evt.stopPropagation();
            var that = this;
            row.fadeOut(500, function () {
                Restaurants.remove({_id:that._id});
            });
        } else { // disallow deletion, and show why
            evt.stopPropagation();
            $(score).fadeOut(150).fadeIn(150).fadeOut(150).fadeIn(150);
        }
    }
};

if (Meteor.isClient) {
    Meteor.startup(function () {
        var occasion_id = Util.getPath();
        if (occasion_id) {
            Occasion.set(occasion_id);
        } else {
            $(".occasion_form").fadeIn();
        }
    });

    Template.lunchyboard.restaurants = function () {
        return Restaurants.find({occasion:Occasion.current()}, {sort:{score:-1, name:1}});
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

    Template.outer.occasion = function () {
        return Occasions.findOne(Occasion.current());
    };


    Template.outer.share_url = function () {
        if (location.toString().indexOf(Occasion.current()) > -1) {
            return location;
        } else {
            return location + Occasion.current();
        }
    };

    Template.outer.events({
        'click .share':function (evt) {
            var $e = $(".share input");
            $e.slideDown(function() {
                $e.attr("value", Template.outer.share_url());
                $e.select();
            });
            $(evt.target).addClass("clicked");
        }
    });


    Template.occasion_form.events({
        'click input.typeover, focus  input.typeover':function (evt) {
            UI.handleTyping(evt);
        },
        'keypress input.new_occasion':function (evt) {
            if (evt.keyCode == 13) { // Enter
                Occasion.addOccasion(evt);
            }
        }
    });


    Template.lunchyboard.events({
        'click input.inc5':function () {
            Restaurant.incrementBy(5);
        },
        'click input.inc3':function () {
            Restaurant.incrementBy(3);
        },
        'click input.inc1':function () {
            Restaurant.incrementBy(1);
        },
        'click input.newOccasion':function () {
            Occasion.set(undefined);
            window.location = Util.baseUrl();
        },
        'click input.clearScores':function () {
            Restaurants.update({}, {$set:{score:0}}, {multi:true});
        },
        'click input.clearAll':function () {
            $(".restaurant").fadeOut(500, function () {
                Restaurants.remove({});
            })
        }
    });


    Template.new_restaurant.events({
        'click input.typeover, focus  input.typeover':function (evt) {
            UI.handleTyping(evt);
        }
    });

    Template.restaurant.events({
        'click .restaurant':function () {
            Session.set("selected_restaurant", this._id);
        },
        'click .deleter':function (evt) {
            Restaurant.deleteRestaurant.call(this, evt);
        }
    });

    Template.new_restaurant.events({
        'keypress input.new_restaurant':function (evt) {
            if (evt.keyCode == 13) { // Enter
                Restaurant.addRestaurant(evt);
            }
        }
    });
}


if (Meteor.isServer) {
    Meteor.startup(function () {
    });
}
