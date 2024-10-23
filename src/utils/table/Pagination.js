import React from "react";
import PropTypes from "prop-types";

const Pagination = ({currentPage, totalPages, onPageChange}) => {

    const handlePreviousPage = () => {
        if (currentPage > 0){
            onPageChange(currentPage - 1)
        }
    }

    const handleNextPage = () => {
        if(currentPage < totalPages - 1){
            onPageChange(currentPage + 1)
        }
    }

    return (
        <div className="d-flex justify-content-between align-items-center">
            <button
                className="btn btn-primary"
                onClick={handlePreviousPage}
                disabled={currentPage === 0}
            >
                Poprzednia
            </button>

            <span>
                Strona {currentPage + 1 } z {totalPages}
            </span>

            <button
                className="btn btn-primary"
                onClick={handlePreviousPage}
                disabled={currentPage === totalPages - 1}
            >
                Poprzednia
            </button>

        </div>
    )

}

Pagination.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired
}

export default Pagination;