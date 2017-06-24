var Genre = require('../models/genre');
var Book = require('../models/book');

// Display list of all Genre
exports.genre_list = async(req, res) => {
	var list = await Genre.find().sort([['name', 'ascending']]).exec();
	res.render('genre_list', {title: 'Genre List', genre_list: list});
};

async function zipit (input) {
    var done = await Promise.all(Object.values(input));
    var keys = Object.keys(input);
    var data = {};
    for (var i = 0; i < keys.length; i++) {
        data[keys[i]] = done[i];
    }
    return data;
}

// Display detail page for a specific Genre
exports.genre_detail = async(req, res) => {
	var data = await zipit({
        title: 'WASSUP',
		genre: Genre.findById(req.params.id).exec(),
		genre_books: Book.find({'genre': req.params.id}).exec()
	});
	res.render('genre_detail', data);
};

// Display Genre create form on GET
exports.genre_create_get = function(req, res) {
    res.render('genre_form', {title: 'Create Genre'});
};

// Handle Genre create on POST
exports.genre_create_post = async(req, res, next) => {
    // Check that the name filed is not empty
    req.checkBody('name', 'Genre name required').notEmpty();

    // Trim and escape the name field.
    req.sanitize('name').escape();
    req.sanitize('name').trim();

    // Run the validators
    var errors = req.validationErrors();

    // Create a genre object with escaped and trimmed data.
    var genre = new Genre(
        { name: req.body.name }
    );

    if (errors) {
        res.render('genre_form', {title: 'Create Genre', genre: genre, errors: errors});
        return;
    }
    else {
        // Data from form is valid.
        // Check if Genre with same name already exists
        var found_genre = await Genre.findOne({'name': req.body.name});
        if (found_genre) {
            res.redirect(found_genre.url);
        }
        else {
            try {
                await genre.save();
                // Genre saved. redirect to detail page.
                res.redirect(genre.url);
            } catch (err) {
                next(err);
            }
        }
    }
};

// Display Genre delete form on GET
exports.genre_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre delete GET');
};

// Handle Genre delete on POST
exports.genre_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre delete POST');
};

// Display Genre update form on GET
exports.genre_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update GET');
};

// Handle Genre update on POST
exports.genre_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update POST');
};