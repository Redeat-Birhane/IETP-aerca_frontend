import React from "react";
import "./Course.css";

const courses = [
  {
    id: 1,
    title: "Beginner’s Guide to Forex Trading",
    description:
      "Learn the basics of Forex markets, currency pairs, risk management, and trading psychology.",
    link: "https://www.investopedia.com/articles/forex/06/forexbasics.asp",
  },
  {
    id: 2,
    title: "Crypto Trading Fundamentals",
    description:
      "Understand cryptocurrency markets, technical analysis, and strategies for crypto trading.",
    link: "https://www.binance.com/en/academy/crypto-trading",
  },
  {
    id: 3,
    title: "Stock Market Trading for Beginners",
    description:
      "Get introduced to stock trading, chart patterns, and key indicators for stock analysis.",
    link: "https://www.investopedia.com/stock-trading-4427698",
  },
];

function CourseCard({ title, description, link }) {
  return (
    <div className="courseCard">
      <h3>{title}</h3>
      <p>{description}</p>
      <a href={link} target="_blank" rel="noopener noreferrer">
        Learn More
      </a>
    </div>
  );
}

export default function Course() {
  return (
    <div className="coursePage">
      <h1>Online Trading Courses</h1>
      <div className="courseList">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            title={course.title}
            description={course.description}
            link={course.link}
          />
        ))}
      </div>
    </div>
  );
}
