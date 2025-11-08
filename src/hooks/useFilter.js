import { useState } from "react";

export const useFilter = (initialData = []) => {
  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState(initialData);

  const filterData = (criteria) => {
    const result = initialData.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(criteria.toLowerCase())
      )
    );
    setFilteredData(result);
  };

  return {
    query,
    setQuery,
    filteredData,
    filterData,
  };
};
