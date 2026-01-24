const paginate = (items, total, limit, offset) => {
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return {
    items,
    total,
    limit,
    offset,
    totalPages,
    currentPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  };
};

module.exports = { paginate };
