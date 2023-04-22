import React, { useState, useEffect, useRef } from "react";

import { copy, linkIcon, loader, tick } from "../assets";
import { useLazyGetSummaryQuery } from "../services/article";
import { deleteIcon } from "../assets";
import { MdDelete } from "react-icons/md";

type Article = {
  url: string;
  summary: string;
};
const Demo = () => {
  const [article, setArticle] = useState<Article>({
    url: "",
    summary: "",
  });

  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [copied, setCopied] = useState("");
  const [getSummary, { error, isFetching }] = useLazyGetSummaryQuery();

  useEffect(() => {
    const articles = localStorage.getItem("articles");
    let articlesFromLocalStorage: Article[] | null = null;
    if (articles) {
      articlesFromLocalStorage = JSON.parse(articles);
    }
    if (articlesFromLocalStorage) {
      setAllArticles(articlesFromLocalStorage);
    }
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const existingArticle = allArticles?.filter((item) => {
      return item.url === article.url;
    });
    if (existingArticle.length > 0) {
      setArticle(existingArticle[0]);
      console.log("Article Exists already");
    } else {
      const { data } = await getSummary({ articleUrl: article.url });
      if (data?.summary) {
        const newArticle = { ...article, summary: data.summary };
        setArticle(newArticle);
        const updatedAllArticles: Article[] = [newArticle, ...allArticles];
        setAllArticles(updatedAllArticles);
        localStorage.setItem("articles", JSON.stringify(updatedAllArticles));
        console.log(newArticle);
      }
    }
  };

  const handleCopy = (copyUrl: string) => {
    setCopied(copyUrl);
    navigator.clipboard.writeText(copyUrl);
    setTimeout(() => setCopied(""), 7000);
  };

  const handleDelete = (e, articleToBeDeleted: Article) => {
    e.stopPropagation();
    const updatedListOfArticles: Article[] = allArticles.filter((item) => {
      return item.url !== articleToBeDeleted.url;
    });
    setAllArticles(updatedListOfArticles);
    localStorage.setItem("articles", JSON.stringify(updatedListOfArticles));
  };

  return (
    <section className="mt-16 w-full max-w-xl">
      <div className="flex flex-col gap-2 w-full">
        <form
          onSubmit={handleSubmit}
          className=" relative flex justify-center items-center"
        >
          <img
            src={linkIcon}
            alt="Link_Icon"
            className="absolute left-0 my-2 ml-3 w-5"
          />
          <input
            type="url"
            placeholder="Enter a URL..."
            value={article.url}
            onChange={(e) => {
              setArticle({ ...article, url: e.target.value });
            }}
            className="url_input peer"
          />
          <button
            type="submit"
            className="submit_btn peer-focus:border-gray-700 peer-focus:text-gray-700"
          >
            ↵
          </button>
        </form>
        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
          {allArticles.map((item, idx) => {
            return (
              <div
                key={`link-${idx}`}
                onClick={() => setArticle(item)}
                className="link_card"
              >
                <div className="copy_btn" onClick={() => handleCopy(item.url)}>
                  <img
                    src={copied == item.url ? tick : copy}
                    alt="Copy Icon"
                    className="w-40% h-40% object-contain"
                  />
                </div>
                <p className="flex-1 font-satoshi text-blue-700 font-medium text-sm truncate">
                  {item.url}
                </p>
                <div
                  className="delete_btn"
                  onClick={(e) => handleDelete(e, item)}
                >
                  <MdDelete />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="my-10 max-w-full flex justify-center items-center">
        {isFetching ? (
          <img src={loader} alt="loader" className="w-20 h-20 object-contain" />
        ) : error ? (
          <p className="font-inter font-bold text-black text-center">
            Well, that wasn't supposed to happen...
            <br />
            <span className="font-satoshi font-normal text-gray-700">
              {error?.data?.error}
            </span>
          </p>
        ) : (
          article.summary && (
            <div className="flex flex-col gap-3">
              <h2 className="font-satoshi font-bold text-gray-600 text-xl">
                Article <span className="blue_gradient">Summary</span>
              </h2>
              <div className="summary_box">
                <p className="font-inter font-medium text-sm text-gray-700">
                  {article.summary}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
};

export default Demo;
