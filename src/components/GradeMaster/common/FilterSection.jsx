import React from "react";
import "./FilterSection.css";

const FilterSection = ({
  questionPaperType,
  handleQuestionTypeChange,
  selectedSubject,
  handleSubjectFilterChange,
  selectedYear,
  handleYearFilterChange,
  availableYears,
  hasOrganization
}) => {
  return (
    <div className="filterContainer">
      <label htmlFor="question-type-filter" className="filterLabel">
        Question Paper Type:
      </label>
      <select
        id="question-type-filter"
        className="filterDropdown"
        value={questionPaperType}
        onChange={handleQuestionTypeChange}
      >
        <option value="sample">Sample Question Papers</option>
        <option value="previous_year">Previous Year Question Papers</option>
        <option value="generated">Generated Question Papers</option>
        {hasOrganization && (
          <option value="organization">Organization Tests</option>
        )}
      </select>
      
      <label htmlFor="subject-filter" className="filterLabel">
        Filter by Subject:
      </label>
      <select
        id="subject-filter"
        className="filterDropdown"
        value={selectedSubject}
        onChange={handleSubjectFilterChange}
      >
        <option value="All Subjects">All Subjects</option>
        <option value="Psychology">Psychology</option>
        <option value="Political Science">Political Science</option>
        <option value="Accountancy">Accountancy</option>
        <option value="Chemistry">Chemistry</option>
        <option value="Biology">Biology</option>
        <option value="Computer Science">Computer Science</option>
      </select>

      {questionPaperType === "previous_year" && (
        <>
          <label htmlFor="year-filter" className="filterLabel">
            Filter by Year:
          </label>
          <select
            id="year-filter"
            className="filterDropdown"
            value={selectedYear}
            onChange={handleYearFilterChange}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </>
      )}
    </div>
  );
};

export default FilterSection; 