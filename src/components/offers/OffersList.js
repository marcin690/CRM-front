import React, {useEffect, useMemo, useState} from "react";
import {useNotification} from "../notyfications/NotyficationContext";
import api from "../../utils/axiosConfig";
import {Link} from "react-router-dom";
import {Button} from "react-bootstrap";
import {Pencil, PlusCircle, Trash} from "react-bootstrap-icons";
import {flexRender, getCoreRowModel, getSortedRowModel, useReactTable} from "@tanstack/react-table";
import header from "../../layouts/header";

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


    // Pobranie ofert
    const fetchOffers = (url = `/offers?page=${currentPage}&size=${pageSize}`) => {
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

    // Obsługa zmiany strony
    const handlePageChange = (url) => {
        if (url) {
            fetchOffers(url); // Pobieramy dane dla nowej strony
        }
    };

    useEffect(() => {
        fetchOffers()
    }, [currentPage])

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
            cell: ({ row }) => `${row.original.totalPrice?.toFixed(2) || "0.00"} PLN`,
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
            header: "handlowiec"
        },
        {
            accessorKey: "OfferStatus",
            header: "Status",
            enableSorting: false,
            cell: ({row}) => {
                const status = row.original.offerStatus || "Nieznany"
                const statusDescription = {
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
                <Link to={`/offers/edit/${row.original.id}`} className="btn p-0 m-0">
                    <Pencil size={16} />
                </Link>
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
        <div className="card">

            <div className="border-0 card-header">
                <div className="d-flex align-items-center">
                    <h5 className="card-title mb-0 flex-grow-1">Lista Ofert</h5>
                    <div className="d-flex gap-2">
                        <div className="d-flex gap-2 flex-wrap">
                            <Button  href="http://localhost:3000/offers/add" className="btn ">Dodaj nowy <PlusCircle/></Button>
                            <Button onClick={null}
                                    className="btn btn-soft-primary ">Usuń zaznaczone <Trash/></Button>

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

            <div className="d-flex justify-content-between align-items-center mt-3">
                <button
                    className="btn btn-primary"
                    disabled={!links.prev}
                    onClick={() => handlePageChange(links.prev?.href)}
                >
                    Poprzednia strona
                </button>
                <span>
                    Strona {currentPage + 1} z {totalPages}
                </span>
                <button
                    className="btn btn-primary"
                    disabled={!links.next}
                    onClick={() => handlePageChange(links.next?.href)}
                >
                    Następna strona
                </button>
            </div>
        </div>


    )


}

export default OffersList;