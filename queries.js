/**
 * All required queries – plp_bookstore.books
 * Copy/paste into mongosh or import { MongoClient } in Node.
 */

/* -------------------------------------------------------
   Basic CRUD
------------------------------------------------------- */
const db = connect('mongodb://127.0.0.1:27017/plp_bookstore');
const books = db.books;

// 1 — Find all books in a specific genre
books.find({ genre: 'Science Fiction' });

// 2 — Find books published after a certain year
books.find({ published_year: { $gt: 2015 } });

// 3 — Find books by a specific author
books.find({ author: 'James Clear' });

// 4 — Update the price of a specific book
books.updateOne(
  { title: 'Atomic Habits' },
  { $set: { price: 18.99 } }
);

// 5 — Delete a book by its title
books.deleteOne({ title: 'Educated' });

/* -------------------------------------------------------
   Advanced Queries
------------------------------------------------------- */
// A — Books in stock _and_ published after 2010
books.find({ in_stock: true, published_year: { $gt: 2010 } });

// B — Projection (only title, author, price)
books.find(
  { genre: 'Self-Help' },
  { _id: 0, title: 1, author: 1, price: 1 }
);

// C — Sorting by price
books.find().sort({ price: 1 });   // ascending
books.find().sort({ price: -1 });  // descending

// D — Pagination (5 per page)
const page = 2;                    // page numbers start at 1
const pageSize = 5;
books.find()
     .skip((page - 1) * pageSize)
     .limit(pageSize);

/* -------------------------------------------------------
   Aggregation Pipelines
------------------------------------------------------- */
// 1 — Average price by genre
books.aggregate([
  { $group: {
      _id: '$genre',
      avgPrice: { $avg: '$price' },
      count: { $sum: 1 }
  }},
  { $sort: { avgPrice: -1 } }
]);

// 2 — Author with the most books
books.aggregate([
  { $group: { _id: '$author', total: { $sum: 1 } } },
  { $sort: { total: -1 } },
  { $limit: 1 }
]);

// 3 — Books grouped by publication decade
books.aggregate([
  { $project: {
      decade: { $concat: [
        { $substr: ['$published_year', 0, 3] }, '0s'
      ]}
  }},
  { $group: { _id: '$decade', count: { $sum: 1 } } },
  { $sort: { _id: 1 } }
]);

/* -------------------------------------------------------
   Indexes and Performance
------------------------------------------------------- */
// 1 — Single-field index on title
books.createIndex({ title: 1 });

// 2 — Compound index on author + published_year
books.createIndex({ author: 1, published_year: -1 });

// 3 — Demonstrate improvement
//    (Run once _before_ and once _after_ creating the index)
books.find({ title: 'Dune' }).explain('executionStats');
