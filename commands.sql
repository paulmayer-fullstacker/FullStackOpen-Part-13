-- Commands.sql:
CREATE TABLE blogs ( id SERIAL PRIMARY KEY, author TEXT, url TEXT NOT NULL, title TEXT NOT NULL, likes INTEGER DEFAULT 0 );

INSERT INTO blogs (author, url, title, likes) VALUES ('John Smith', 'https://johnsmith.org/', 'All about John Smith and his coding', 10);
INSERT INTO blogs (author, url, title, likes) VALUES ('Graham Green', 'https://grahamgreen.org/', 'The Power and the Glory', 20);