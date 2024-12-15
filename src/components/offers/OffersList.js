import React, {useEffect, useMemo, useState} from "react";
import {useNotification} from "../notyfications/NotyficationContext";
import api from "../../utils/axiosConfig";
import {Link} from "react-router-dom";
import {Button} from "react-bootstrap";
import {Chat, Eye, Pencil, PlusCircle} from "react-bootstrap-icons";
import {flexRender, getCoreRowModel, getSortedRowModel, useReactTable} from "@tanstack/react-table";
import {formatPrice} from "../../utils/FormatPrice";
import Pagination from "../../utils/table/Pagination";
import DatePicker from "react-datepicker";
import {pl} from "date-fns/locale";
import fetchSellers from "../../utils/fetch/fetchSellers";
import {format} from "date-fns";
import CommentModal from "../modals/CommentModal";

const OffersList = () => {

    // Powiadomienia
    const {notify} = useNotification();


    const [offers, setOffers] = useState([])

    // Sortowanie tabeli
    const [sortingState, setSortingState] = useState([])

    // Paginacja
    const [currentPage, setCurrentPage] = useState(0)
    const [pageSize] = useState(20)
    const [totalPages, setTotalPages] = useState(0)
    const [links, setLinks] = useState({})

    // Wyszukiwarka
    const [searchName, setSearchName] = useState('')
    const [selectedEmployee, setSelectedEmployee] = useState("")
    const [selectedStatus, setSelectedStatus] = useState("")
    const [dateRange, setDateRange] = useState("")
    const [startDate, endDate] = dateRange || [null, null];
    const [users, setUsers] = useState([]); // Stan na sprzedawców


    // Comments
    const [currentClientGlobalId, setCurrentClientGlobalId] = useState(null)
    const [showCommentModal, setShowCommentModal] = useState(null);
    const [currentEntityId, setCurrentEntityId] = useState(null);
    const [currentEntityType, setCurrentEntityType] = useState(null)

    const handleShowComments = (clientGlobalId, entityType, entityId) => {
        setCurrentClientGlobalId(clientGlobalId);
        setCurrentEntityType(entityType);
        setCurrentEntityId(entityId);
        setShowCommentModal(true);
    };

    const handleCloseComments = () => {
        setShowCommentModal(false)
        setCurrentClientGlobalId(null)
    }



    // Pobranie ofert
    const fetchOffers = (filters = {}) => {


        const { searchName, employee, status, fromDate, toDate } = filters;
        const params = new URLSearchParams();

        params.append('page', currentPage)
        params.append('size', pageSize)

        if (searchName) params.append('name', searchName)
        if (employee) params.append('userId', employee);
        if (status) params.append('offerStatus', status);
        if (fromDate) params.append('startDate', fromDate);
        if (toDate) params.append('endDate', toDate);

        const url = `/offers/search?${params.toString()}`;


        api
            .get(url)
            .then(response =>{
                const {_embedded, page, _links } = response.data
                const offerData = _embedded?.offerDTOList || [];
                setOffers(offerData)
                setTotalPages(page.totalPages);
                setCurrentPage(page.number);
                setLinks(_links);
            })
            .catch(error => {
                notify(`Błąd podczas pobierania ofert: ${error.message}`, "error");
            })

    }



    const handleFilter = () => {

        const fromDate = startDate ? `${format(startDate, 'yyyy-MM-dd')}T00:00:00` : undefined;
        const toDate = endDate ? `${format(endDate, 'yyyy-MM-dd')}T23:59:59` : undefined;


        const filters = {
            name: searchName || undefined,
            employee: selectedEmployee || undefined,
            status: selectedStatus || undefined,
            fromDate,
            toDate,

        }

        console.log("Filtry przekazywane do fetchOffers:", filters);

        setCurrentPage(0)
        fetchOffers(filters)

    }

    const handleResetFilters = () => {
        setSearchName("")
        setSelectedEmployee('');
        setSelectedStatus('');
        setDateRange([null, null]); // Reset zakresu dat
        setCurrentPage(0); // Resetuj do pierwszej strony
        fetchOffers(); // Pobierz wszystkie oferty bez filtrów
    }

    // Obsługa zmiany strony
    const handlePageChange = (url) => {
        if (url) {
            fetchOffers(url); // Pobieramy dane dla nowej strony
        }
    };

    useEffect(() => {

        fetchSellers(setUsers);
        const fromDate = startDate ? `${format(startDate, 'yyyy-MM-dd')}T00:00:00` : undefined;
        const toDate = endDate ? `${format(endDate, 'yyyy-MM-dd')}T23:59:59` : undefined;

        fetchOffers({
            searchName,
            employee: selectedEmployee,
            status: selectedStatus,
            fromDate,
            toDate,
        });
    }, [searchName, selectedEmployee, selectedStatus, startDate, endDate]);

    const columns = useMemo(() => [
        {
            accessorKey: "id",
            header: "ID",
            sortingFn: "basic",
            cell: ({row}) => (    <Link to={`/offers/${row.original.id}`}>{row.original.id}</Link>)
        },
        {
            accessorKey: "name",
            header: "Nazwa",
            cell: ({row}) => (    <Link to={`/offers/${row.original.id}`}>{row.original.name}</Link>)


        },
        {
            accessorKey: "totalPrice",
            header: "Kwota",
            cell: ({row}) => formatPrice(row.original.totalPrice || 0, "PLN"),
            enableSorting: true, // Sortowanie włączone
            sortingFn: "basic"
        },
        {
            accessorKey: "lead.name",
            header: "Powiązanie",
            enableSorting: false,
            cell: ({row}) => {
                const {lead, project, client} = row.original;
                if (lead) return `Lead: ${lead.name}`;
                if (project) return `Projekt: ${project.name}`;
                if (client) return `Klient: ${client.clientFullName}`;
                return "Brak powiązania";},
        },
        {
            accessorKey: "userId",
            header: "handlowiec",
            cell: ({row}) => (
                <div>
                    {row.original.user?.avatar && (
                        <img
                            className="p-0 me-2 avatar"
                            width="25px"
                            src={row.original.user.avatar}
                            alt="Avatar"
                        />
                    )}
                    {row.original.user?.fullname || "Brak przypisanego handlowca"}
                </div>

            )


        },
        {
            accessorKey: "OfferStatus",
            header: "Status",
            enableSorting: false,
            cell: ({row}) => {
                const status = row.original.offerStatus || "Nieznany"
                const statusDescription = {
                    DRAFT: "Szkic",
                    SENT: "Wysłana",
                    ACCEPTED: "Zaakceptowana",
                    REJECTED: "Odrzucona",
                    SIGNED: "Podpisana umowa",
                }

                const statusClasses = {
                    SENT: "badge bg-info", // Niebieski
                    ACCEPTED: "badge bg-success", // Zielony
                    REJECTED: "badge bg-danger", // Czerwony
                    SIGNED: "badge bg-primary", // Granatowy
                }

                return (
                    <span className={statusClasses[status] || "badge bg-secondary"}>
                        {statusDescription[status] || "Nieznany"}
                    </span>
                )
            }
        },
        {
            accessorKey: "creationDate",
            header: "Data",
            cell: ({ row }) =>
                new Date(row.original.creationDate).toLocaleDateString("pl-PL", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }),
        },{
            accessorKey: "actions",
            header: "Akcje",
            enableSorting: false, // Nie sortujemy kolumny akcji
            cell: ({row}) => (
                <>
                    <Link to={`/offers/edit/${row.original.id}`} className="btn p-0 m-0">
                        <Pencil size={16} />
                    </Link>
                    <button
                        className="btn p-1 m-0"
                        onClick={() =>
                            handleShowComments(row.original.clientGlobalId, "LEAD", row.original.id)
                        }
                    >
                        <Chat/>
                    </button>
                    <Link to={`/offers/${row.original.id}`} className="btn p-0 m-0">
                        <Eye size={16} />
                    </Link>
                </>

            ),
        }
    ], [])

    // Konfiguracja tabeli z react-table
    const table = useReactTable({
        data: offers,
        columns,
        state: {
            sorting: sortingState,
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSortingState,
    });

    return (
        <>

            <div className="d-flex align-items-end justify-content-center gap-3 p-3 pb-5">
                <div>
                    <label>Nazwa</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Wpisz nazwę lub opis"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                    />
                </div>
                <div className="d-flex flex-column">
                    <label>Zakres dat</label>
                    <DatePicker
                        selectsRange
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(update) => setDateRange(update)}
                        isClearable
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Wybierz zakres"
                        className="form-control"
                    />
                </div>
                <div>
                    <label>Handlowiec</label>
                    <select
                        className="form-select"
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)} // Przechowuj ID wybranego użytkownika
                    >
                        <option value="">Wszyscy</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.fullname} {/* Wyświetla pełne imię i nazwisko */}
                            </option>
                        ))}
                    </select>

                </div>
                <div>
                    <label>Status</label>
                    <select
                        className="form-select"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <option value="">Dowolny</option>
                        <option value="DRAFT">Szkic</option>
                        <option value="SENT">Wysłana</option>
                        <option value="ACCEPTED">Zaakceptowana</option>
                        <option value="REJECTED">Odrzucona</option>
                    </select>
                </div>

                <div className="d-flex align-items-end">
                    <Button variant="primary" onClick={handleFilter}>
                        Filtruj
                    </Button>
                </div>
                <div className="d-flex align-items-end">
                    <Button variant="outline-primary" onClick={handleResetFilters}>
                        Reset
                    </Button>
                </div>
            </div>

            <div className="card">

                <div className="border-0 card-header">
                    <div className="d-flex align-items-center">
                        <h5 className="card-title mb-0 flex-grow-1">Lista Ofert</h5>
                        <div className="d-flex gap-2">
                            <div className="d-flex gap-2 flex-wrap">
                            <Button href="/offers/add" className="btn ">Dodaj ofertę <PlusCircle/></Button>


                            </div>
                        </div>
                    </div>
                </div>

                <table className="table-responsive  table-nowrap table">
                    <thead className="table-light">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    onClick={header.column.getToggleSortingHandler()}
                                    className={`${
                                        header.column.getCanSort() ? "sort" : ""
                                    } ${
                                        header.column.getIsSorted() === "asc"

                                            ? "sorted-asc"
                                            : header.column.getIsSorted() === "desc"
                                                ? "sorted-desc"
                                                : ""
                                    }`}
                                >
                                    {header.isPlaceholder ? null : (
                                        <>{flexRender(header.column.columnDef.header, header.getContext())}</>
                                    )}
                                </th>
                            ))}
                        </tr>
                    ))}
                    </thead>
                    <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id}>
                                    {cell.column.columnDef.cell
                                        ? cell.column.columnDef.cell(cell.getContext())
                                        : cell.getValue()
                                    }
                                </td>
                            ))}
                        </tr>
                    ))}

                    </tbody>
                </table>

                <Pagination
                    links={links}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                />

                <CommentModal
                    show={showCommentModal}
                    handleClose={handleCloseComments}
                    clientGlobalId={currentClientGlobalId}
                    entityType="LEAD"
                    entityId={currentEntityId}
                />


            </div>

        </>
    )


}

export default OffersList;