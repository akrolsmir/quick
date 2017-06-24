var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookinstance');

async function zipit (input) {
    var done = await Promise.all(Object.values(input));
    var keys = Object.keys(input);
    var data = {};
    for (var i = 0; i < keys.length; i++) {
        data[keys[i]] = done[i];
    }
    return data;
}

exports.index = async(req, res) => {
    var data = await zipit({
        book_count: Book.count(),
        book_instance_count: BookInstance.count(),
        book_instance_available_count: BookInstance.count({status: 'Available'}),
        author_count: Author.count(),
        genre_count: Genre.count()
    });

    res.render('index', {title: "TitlePage", data: data});
};

// Display list of all books
exports.book_list = async(req, res) => {
    var list_books = await Book.find({}, 'title author ')
    .populate('author')
    .exec();

    res.render('book_list', {title: 'Book List', book_list: list_books});
};

// Display detail page for a specific book
exports.book_detail = async(req, res) => {
    var data = await zipit({
        title: 'Title',
        book: Book.findById(req.params.id).populate('author').populate('genre'),
        book_instances: BookInstance.find({'book': req.params.id}),
    })
    res.render('book_detail', data);
};

// Display book create form on GET
exports.book_create_get = async(req, res, next) => {
    try {
        var data = await zipit({
            title: 'Create Book',
            authors: Author.find(),
            genres: Genre.find(),
        });
        res.render('book_form', data)
    } catch (err) {
        return next(err);
    }
};

// Handle book create on POST 
exports.book_create_post = async(req, res, next) => {

    req.checkBody('title', 'Title must not be empty.').notEmpty();
    req.checkBody('author', 'Author must not be empty').notEmpty();
    req.checkBody('summary', 'Summary must not be empty').notEmpty();
    req.checkBody('isbn', 'ISBN must not be empty').notEmpty();
    
    req.sanitize('title').escape();
    req.sanitize('author').escape();
    req.sanitize('summary').escape();
    req.sanitize('isbn').escape();
    req.sanitize('title').trim();     
    req.sanitize('author').trim();
    req.sanitize('summary').trim();
    req.sanitize('isbn').trim();
    req.sanitize('genre').escape();
    
    var book = new Book({
        title: req.body.title, 
        author: req.body.author, 
        summary: req.body.summary,
        isbn: req.body.isbn,
        genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre.split(",")
    });
       
    console.log('BOOK: ' + book);
    
    var errors = req.validationErrors();
    if (errors) {
        // Some problems so we need to re-render our book

        try {
            // Get all authors and genres for form
            var data = await zipit({
                title: 'Create Book',
                authors: Author.find(),
                genres: Genre.find(),
                book: book,
                errors: errors,
            });

            // Mark our selected genres as checked
            for (i = 0; i < data.genres.length; i++) {
                if (book.genre.indexOf(data.genres[i]._id) > -1) {
                    //Current genre is selected. Set "checked" flag.
                    data.genres[i].checked='true';
                }
            }
            res.render('book_form', data);
        } catch (err) {
            return next(err);
        }

    } 
    else {
    // Data from form is valid.
    // We could check if book exists already, but lets just save.
    
        book.save(function (err) {
            if (err) { return next(err); }
            //successful - redirect to new book record.
            res.redirect(book.url);
        });
    }

};

// Display book delete form on GET
exports.book_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book delete GET');
};

// Handle book delete on POST
exports.book_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book delete POST');
};

// Display book update form on GET
exports.book_update_get = async(req, res, next) => {
    req.sanitize('id').escape();
    req.sanitize('id').trim();

    var results = await zipit({
        title: 'Update Book',
        book: Book.findById(req.params.id).populate('author').populate('genre').exec(),
        authors: Author.find(),
        genres: Genre.find(),
    });

    // Mark our selected genres as checked
    var bookGenreIds = results.book.genre.map(function(g) {
        return g._id.toString();
    });
    for (var genre of results.genres) {
        if (bookGenreIds.indexOf(genre._id.toString()) > -1) {
            genre.checked = 'true';
        }
    }
    res.render('book_form', results);
};

// Handle book update on POST
exports.book_update_post = async(req, res, next) => {
    
    //Sanitize id passed in. 
    req.sanitize('id').escape();
    req.sanitize('id').trim();
    
    //Check other data
    req.checkBody('title', 'Title must not be empty.').notEmpty();
    req.checkBody('author', 'Author must not be empty').notEmpty();
    req.checkBody('summary', 'Summary must not be empty').notEmpty();
    req.checkBody('isbn', 'ISBN must not be empty').notEmpty();
    
    req.sanitize('title').escape();
    req.sanitize('author').escape();
    req.sanitize('summary').escape();
    req.sanitize('isbn').escape();
    req.sanitize('title').trim();
    req.sanitize('author').trim(); 
    req.sanitize('summary').trim();
    req.sanitize('isbn').trim();
    req.sanitize('genre').escape();
    
    var book = new Book(
      { title: req.body.title, 
        author: req.body.author, 
        summary: req.body.summary,
        isbn: req.body.isbn,
        genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre.split(","),
        _id:req.params.id //This is required, or a new ID will be assigned!
       });
    
    var errors = req.validationErrors();
    if (errors) {
        // Re-render book with error information
        // Get all authors and genres for form
        var results = await zipit({
            title: 'Update Book',
            authors: Author.find(),
            genres: Genre.find(),
        })

        // Mark our selected genres as checked
        for (i = 0; i < results.genres.length; i++) {
            if (book.genre.indexOf(results.genres[i]._id) > -1) {
                results.genres[i].checked='true';
            }
        }

        res.render('book_form', results);
    } 
    else {
        // Data from form is valid. Update the record.
        Book.findByIdAndUpdate(req.params.id, book, {}, function (err,thebook) {
            if (err) { return next(err); }
            //successful - redirect to book detail page.
            res.redirect(thebook.url);
        });
    }
};