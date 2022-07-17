pragma solidity >=0.4.21 <0.6.0;

contract Event {
    constructor() public {}

    uint public articleCount = 0;
    mapping(uint => Article) public articles;

    struct Article {
        uint id;
        string title;
        string content;
        bool status;
    }

    event ArticleCreated(
        uint id,
        string title,
        string content,
        bool status
    );

    event ArticleDelete(
        uint id,
        string title,
        bool status
    );

    function createArticle(string memory _title, string memory _content) public {
        articleCount++;
        articles[articleCount] = Article(articleCount, _title, _content, true);
        emit ArticleCreated(articleCount, _title, _content, true);
    }

    function deleteArticle(uint _id) public {
        Article memory _article = articles[_id];
        _article.status = false;
        articles[_id] = _article;
        emit ArticleDelete(_id, _article.title, _article.status);
    }
}
