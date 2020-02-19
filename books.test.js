process.env.NODE_ENV = "test"

const request = require("supertest");
const app = require("./app");
const db = require("./db");
const Book = require("./models/book");

describe("Book Route Testing", function () {

    let b1;

    beforeEach(async function () {
        await db.query("DELETE FROM books");

        b1 = await Book.create({
            isbn: "0691161518",
            amazon_url: "http://a.co/eobPtX2",
            author: "Matthew Lane",
            language: "english",
            pages: 264,
            publisher: "Princeton University Press",
            title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            year: 2017
        });
    });

    describe("GET /books/", function () {
        test("can get all book", async function () {
            let response = await request(app)
                .get('/books');
            expect(response.statusCode).toEqual(200);
            expect(response.body).toEqual({books: [b1]});
        });
    });

    describe("GET /books/:isbn", function () {
        test("can get a book", async function () {
            let response = await request(app)
                .get(`/books/${b1.isbn}`)
            expect(response.statusCode).toEqual(200);
            expect(response.body).toEqual({book: b1})
        });
    });

    describe("POST /books/", function () {
        test("can create a book", async function () {
            let book = {
                isbn: "1234567890",
                amazon_url: "http://a.co/asdfja14",
                author: "Martin Kim",
                language: "korean",
                pages: 22000,
                publisher: "Rithm School",
                title: "Learning to use a computer",
                year: 2020
            }
            let response = await request(app)
                .post('/books').send(book);
            expect(response.statusCode).toEqual(201);
            expect(response.body).toEqual({book})
            
            const getBookResponse = await request(app).get('/books/1234567890');
            expect(getBookResponse.body).toEqual({book});
        });

        test("trying to create a book with invalid url", async function() {
            let book = {
                isbn: "1234567890",
                amazon_url: "notaURL",
                author: "Martin Kim",
                language: "korean",
                pages: 22000,
                publisher: "Rithm School",
                title: "Learning to use a computer",
                year: 2020
            }
            let response = await request(app)
                .post('/books').send(book);
            expect(response.statusCode).toEqual(400);
            expect(response.body.error.message[0]).toContain('amazon_url');
        });
    });

    describe("PUT /books/:isbn", function () {
        test("can update a book", async function () {
            let book = {
                amazon_url: "http://a.co/asdfja14",
                author: "Martin Kim",
                language: "korean",
                pages: 22000,
                publisher: "Rithm School",
                title: "Learning to use a computer",
                year: 2020
            }
            let response = await request(app)
                .put('/books/0691161518').send(book);
            expect(response.statusCode).toEqual(200);
            book.isbn = '0691161518'
            expect(response.body).toEqual({book})
            
            const getBookResponse = await request(app).get('/books/0691161518');
            expect(getBookResponse.body).toEqual({book});
        });

        test("trying to update a book with invalid url", async function() {
            let book = {
                amazon_url: "notaURL",
                author: "Martin Kim",
                language: "korean",
                pages: 22000,
                publisher: "Rithm School",
                title: "Learning to use a computer",
                year: 2020
            }
            let response = await request(app)
                .put('/books/0691161518').send(book);
            expect(response.statusCode).toEqual(400);
            expect(response.body.error.message[0]).toContain('amazon_url');
        });
    });

    describe("DELETE /books/:isbn", function () {
        test("can delete a book", async function () {
            let response = await request(app)
                .delete(`/books/${b1.isbn}`)
            expect(response.statusCode).toEqual(200);
            expect(response.body).toEqual({message: "Book deleted"})
        });
    });
});

afterAll(async function () {
    await db.end();
});
