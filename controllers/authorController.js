var Author = require('../models/author');
var Book = require('../models/book');

async function zipit (input) {
    var done = await Promise.all(Object.values(input));
    var keys = Object.keys(input);
    var data = {};
    for (var i = 0; i < keys.length; i++) {
        data[keys[i]] = done[i];
    }
    return data;
}

// Display list of all Authors
exports.author_list = async(req, res) => {
    var list = await Author.find().sort([['family_name', 'ascending']]).exec();
    res.render('author_list', {title: 'Author List', author_list: list});
};

// Display detail page for a specific Author
exports.author_detail = async(req, res) => {
	var data = await zipit({
		author: Author.findById(req.params.id),
		author_books: Book.find({'author': req.params.id}, 'title summary'),
		title: 'Author Detail',
	})
	res.render('author_detail', data);
};

// Display Author create form on GET
exports.author_create_get = function(req, res, next) {       
    res.render('author_form', { title: 'Create Author'});
};

// Handle Author create on POST 
exports.author_create_post = async(req, res, next) => {
   
    req.checkBody('first_name', 'First name must be specified.').notEmpty(); //We won't force Alphanumeric, because people might have spaces.
    req.checkBody('family_name', 'Family name must be specified.').notEmpty();
    req.checkBody('family_name', 'Family name must be alphanumeric text.').isAlpha();
    req.checkBody('date_of_birth', 'Invalid date').optional({ checkFalsy: true }).isDate();
    req.checkBody('date_of_death', 'Invalid date').optional({ checkFalsy: true }).isDate();
    
    req.sanitize('first_name').escape();
    req.sanitize('family_name').escape();
    req.sanitize('first_name').trim();     
    req.sanitize('family_name').trim();
    req.sanitize('date_of_birth').toDate();
    req.sanitize('date_of_death').toDate();

    var errors = req.validationErrors();
    
    var author = new Author(
      { first_name: req.body.first_name, 
        family_name: req.body.family_name, 
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death
       });
       
    if (errors) {
        res.render('author_form', { title: 'Create Author', author: author, errors: errors});
    return;
    } 
    else {
        // Data from form is valid
        try {
            await author.save();
            res.redirect(author.url);
        } catch (err) {
            return next(err);
        }
    }

};

// Display Author delete form on GET
exports.author_delete_get = async(req, res) => {
    var data = await zipit({
        title: 'Delete Author',
        author: Author.findById(req.params.id).exec(),
        author_books: Book.find({'author': req.params.id}).exec(),
    });
    res.render('author_delete', data);
};

// Handle Author delete on POST
exports.author_delete_post = async(req, res, next) => {
    req.checkBody('authorid', 'Author id must exist').notEmpty();  

    var results = await zipit({
        title: 'Delete Author',
        author: Author.findById(req.body.authorid).exec(),
        authors_books: Book.find({'author': req.body.authorid}, 'title summary').exec(),
    })
    if (results.authors_books > 0) {
        // Author has books, so render as GET route.
        res.render('author_delete', data);
        return;
    } else {
        // Author lacks books. Delete the author and redirect to author list.
        try {
            Author.findByIdAndRemove(req.body.authorid);
            res.redirect('/catalog/authors');
        } catch (err) {
            return next(err);
        }
    }
};

// Display Author update form on GET
exports.author_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update GET');
};

// Handle Author update on POST
exports.author_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update POST');
};