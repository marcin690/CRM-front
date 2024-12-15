import React from "react";
import PropTypes from "prop-types";

const Pagination = ({links, totalPages, currentPage, onPageChange, pageSize}) => {

        const handleLinkClick = (url) => {
            if (url) {
                onPageChange(url)
            }
        }

    const renderPageNumbers = () => {
        const pages = [];
        for (let i = 0; i < totalPages; i++) {
            pages.push(
                <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>

                    <button
                        className="page-link"
                        onClick={() => {
                            handleLinkClick(`?page=${i}&size=${pageSize}`);
                        }}
                    >
                        {i + 1}
                    </button>
                </li>
            );
        }
        return pages;
    };

        return (
            <div className=" d-flex justify-content-center align-items-center pt-4">
                <nav aria-label="Page navigation">
                    <ul className="pagination">
                        <li
                            className={`page-item ${!links.prev ? 'disabled' : ''}`}
                        >
                            <button className="page-link"
                                    onClick={() => {
                                        handleLinkClick(links.prev?.href)
                                    }}
                                    disabled={!links.prev}
                            >
                                Poprzednia strona
                            </button>
                        </li>
                        {renderPageNumbers()}

                        <li className={`page-item ${!links.next ? 'disabled' : ''}`}>
                            <button className="page-link"
                                    onClick={() => handleLinkClick(links.next?.href)}
                                    disabled={!links.next}
                            >
                                Następna strona
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>

        )

}
export default Pagination;