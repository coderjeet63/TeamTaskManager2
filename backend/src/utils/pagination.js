const getPagination = (page = 1, limit = 10) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 50);

  return {
    currentPage,
    pageSize,
    skip: (currentPage - 1) * pageSize,
  };
};

module.exports = { getPagination };
