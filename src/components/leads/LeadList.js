import React, {useEffect, useMemo, useState} from "react";
import {useNotification} from "../notyfications/NotyficationContext";
import api from "../../utils/axiosConfig";
import {flexRender, getCoreRowModel, getSortedRowModel, useReactTable} from "@tanstack/react-table";
import {Link} from "react-router-dom";
import {Button, ButtonGroup, Image, OverlayTrigger, Table, Tooltip} from "react-bootstrap";
import {formatDistanceToNow} from "date-fns";
import LeadStatusDropdown from "./LeadStatusDropdown";
import {ErrorIcon, LoaderIcon} from "react-hot-toast";

import {Chat, Eye, EyeFill, EyeSlash, Pencil, Plus, PlusCircle, Trash} from "react-bootstrap-icons";
import AddEditLeadModal from "./AddEditLeadModal";
import useSelectableTable from "../../hooks/useSelectableTable";
import deleteItems from "../../utils/table/deleteItems";
import useLeadStatuses from "./hooks/useLeadStatuses";
import Pagination from "../../utils/table/Pagination";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import { pl } from "date-fns/locale";
import CommentModal from "../modals/CommentModal";


const LeadList = () => {
    const {notify} = useNotification();
    const [leads, setLeads] = useState([]);
    const [selectedLeads, setSelectedLead] = useState(null)
    const [showModal,setShowModal] = useState(false)
    const [sortingState, setSortingState] = useState([{id: 'id', desc: true}])
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [users, setUsers] = useState([]); // Lista handlowców

    const [selectedStatus,setSelectedStatus] = useState('')
    const statuses = useLeadStatuses();
    const [links, setLinks] = useState([])

;

    // Filtrowanie

    const [dateRange, setDateRange] = useState([null, null])
    const [startDate, endDate] = dateRange
    const [searchTerm, setSearchTerm] = useState('')

    // Paginacja
    const [currentPage, setCurrentPage] = useState(0); // Strona aktualna
    const [pageSize] = useState(35); // Ustalmy rozmiar strony
    const [totalPages, setTotalPages] = useState(0); // Całkowita liczba stron


    // Comments
    const [currentClientGlobalId, setCurrentClientGlobalId] = useState(null)
    const [showCommentModal, setShowCommentModal] = useState(null);
    const [currentEntityType, setCurrentEntityType] = useState(null);
    const [currentEntityId, setCurrentEntityId] = useState(null)

    const {
        selectedItems,
        handleSelectItem,
        handleSelectAll,
        clearSelection,
        allSelected,
    } = useSelectableTable(leads)




    const handleEdit = (lead) => {
        setSelectedLead(lead);
        setShowModal(true)
    }

    const handleClose = () => {
        setShowModal(false);
        setSelectedLead(null);
    }





    const fetchLeads = (filters = {}) => {
        const { fromDate, toDate, employee, status, search } = filters;

        const params = new URLSearchParams();
        params.append('page', currentPage);
        params.append('size', pageSize);

        if (fromDate) params.append('fromDate', fromDate);
        if (toDate) params.append('toDate', toDate);
        if (employee) params.append('employee', employee);
        if (status) params.append('status', status);
        if (search) params.append('search', search);

        const url = `/leads?${params.toString()}`;

        api.get(url)
            .then(response => {
                const { _embedded, _links, page } = response.data;
                const leads = _embedded ? _embedded.leadDTOList : [];
                setLeads(leads);
                setTotalPages(page.totalPages);
                setLinks(_links);  // Ustawiamy linki do paginacji
                setCurrentPage(page.number); // Zapisz aktualną stronę
            })
            .catch(error => {
                const errorMessage =
                    error.response?.data?.message || // Próba odczytania wiadomości z backendu
                    error.response?.statusText ||   // Próba odczytania statusu HTTP
                    "Nieznany błąd";                // Domyślna wiadomość

                notify(`Bład: ${errorMessage}`, "error");
            });
    };



    const handlePageChange = (url) => {
        fetchLeads(url)
    }




    const handleStatusChange = (leadId, newStatus) => {
        setLeads(leads.map(lead => lead.id === leadId ? {...lead, leadStatusId: newStatus} : lead));
        fetchLeads();
    }
    const handleFilter = () => {
        const filters = {
            fromDate: startDate ? `${startDate.toISOString().split("T")[0]}T00:00:00` : undefined,
            toDate: endDate
                ? `${(startDate.getTime() === endDate.getTime() ?
                    new Date(endDate.setHours(23, 59, 59)) : endDate)
                    .toISOString()
                    .split("T")[0]}T23:59:59`
                : undefined,
            employee: selectedEmployee || undefined,
            status: selectedStatus || undefined,
            search: searchTerm || undefined,
        };
        setCurrentPage(0); // Resetowanie do pierwszej strony przy filtrowaniu
        fetchLeads(filters);
        console.log("Data początkowa:", startDate, "Data końcowa:", endDate);
    };


    const handleReset = () => {
        setDateRange([null, null]); // Resetowanie zakresu dat
        setSelectedEmployee('');
        setSelectedEmployee('');
        setSelectedStatus('');
        setSearchTerm('');
        setCurrentPage(0); // Resetowanie do pierwszej strony po zresetowaniu filtrów
        fetchLeads(); // Pobranie leadów bez filtrów
    };


    const fetchSellers = async () => {
        try {
            const response = await api.get('/users/sellers');
            setUsers(response.data); // Zapisz handlowców w stanie
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || // Próba odczytania wiadomości z backendu
                error.response?.statusText ||   // Próba odczytania statusu HTTP
                "Nieznany błąd";                // Domyślna wiadomość

            notify(`Bład: ${errorMessage}`, "error");
        }
    };

    const handleDeleteSelected = async () => {

        const selectedLeadName = leads
            .filter(lead => selectedItems.includes(lead.id))
            .map(lead => lead.name)
            .join(', ')

        const confirmDelete = window.confirm(`Czy na pewno chesz usunąć: ${selectedLeadName} ?`)

        if(!confirmDelete) {
            return;
        }



        try {
            await deleteItems('/leads', selectedItems); // Wywołanie API z tablicą ID do usunięcia
            notify("Rekordy: " + selectedItems + " zostały usunięte", "succes");

            // Aktualizacja stanu po udanym usunięciu
            setLeads(prevLeads => prevLeads.filter(lead => !selectedItems.includes(lead.id))); // Usuń z lokalnego stanu

            clearSelection(); // Wyczyść zaznaczenie po usunięciu

        } catch (error) {
            const errorMessage =
                error.response?.data?.message || // Próba odczytania wiadomości z backendu
                error.response?.statusText ||   // Próba odczytania statusu HTTP
                "Nieznany błąd";                // Domyślna wiadomość

            notify(`Bład: ${errorMessage}`, "error");
        }
    };

    useEffect(() => {
        fetchLeads();  // Pobieranie leadów
        fetchSellers();  // Pobieranie listy handlowców
    }, []);

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

    const columns = useMemo(() =>
        [
            {
                id:'id',
                header: 'ID',
                accessorFn: row => row.id
            },
            {
                id: 'name',
                header: 'Nazwa',
                accessorFn: row => row.name
            },
            {
                id: 'clientBusinessName',
                header: 'Firma',
                cell: ({row}) => {
                    return (
                        <Link to={"/"}>
                            {row.original.clientBusinessName
                                ? row.original.clientBusinessName + " (" + row.original.clientId + ")"
                                : null}
                        </Link>
                        )

                }
            },


            {
                id: 'leadStatus',
                header: 'Status',
                cell: ({row}) => ( <LeadStatusDropdown
                    key={row.original.leadStatusId}
                    leadId={row.original.id}
                    currentStatusId={row.original.leadStatusId}
                    onStatusChange={(newStatusId) => handleStatusChange(row.original.id, newStatusId)}
                />),
                enableSorting: true

            },
            {
                id: 'updatedDate',
                header: 'Zaktualizowany',
                accessorFn: row => row.updatedAt,
                cell: ({row}) => {
                    const updatedAt = new Date(row.original.lastModifiedDate);
                    return (
                        <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id={`tooltip-top-${row.id}`}>{updatedAt.toLocaleString()}</Tooltip>}
                        >
                            <span>
                              {formatDistanceToNow(updatedAt, { addSuffix: false, locale: pl })}
                            </span>
                        </OverlayTrigger>
                    )
                }


            },
            {
                id: 'offer',
                header: 'Oferta',
                cell: <ErrorIcon />
            },
            {
                id: 'assignedEmplyee',
                header: 'Przypisany',
                cell: ({row}) => {

                    return (
                        <>
                            {row.original.assignTo ? (
                                row.original.assignTo.fullname
                            ) : (
                                "Nieprzypisany"
                            )}

                        </>
                    )
                }
            },
            {
                id: 'actions',
                header: 'Akcje',
                cell: ({ row }) => (
                    <>
                        <button className="btn p-0 m-0" onClick={() => handleEdit(row.original)}><Pencil/></button>
                        <button
                            className="btn p-1 m-0"
                            onClick={() =>
                                handleShowComments(row.original.clientGlobalId, "LEAD", row.original.id)
                            }
                        >
                            <Chat/>
                        </button>


                    </>

                )
            },


        ]
        , [leads, selectedLeads, users]);


    const data = useMemo(() => leads, [leads])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting: sortingState,
        },
        onSortingChange: setSortingState
    });

    const handleKeyDown = (e) => {
        if (e.key = 'Enter') {
            handleFilter();
        }
    }



    return(
        <>
            <div className="d-flex align-items-end justify-content-center gap-3 p-3 pb-5">
                <div className="d-flex flex-column">
                    <label>Zakres dat</label>
                    <DatePicker
                        selectsRange={true}
                        startDate={startDate}
                        endDate={endDate}
                        showMonthDropdown={true}
                        showYearDropdown={true}
                        locale={pl}
                        onChange={(update) => setDateRange(update)}
                        isClearable={true}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Wybierz zakres"
                        className="form-control"
                        monthsShown={2}
                                />
                </div>


                <div>
                    <label>Pracownik</label>
                    <select
                        className="form-select"
                        onKeyDown={handleKeyDown}
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                    >
                        <option value="">Wszyscy</option>
                        {users.map(user => (
                            <option key={user.id} value={user.fullname}>
                                {user.fullname}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Status</label>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="form-select"
                        onKeyDown={handleKeyDown}
                    >
                        <option value="">Dowolny</option>
                        {statuses.map(status => (
                            <option key={status.id} value={status.id}>
                                {status.statusDescription}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Szukaj </label>
                    <input
                        type="text" className="form-control" placeholder="Opis, klient, nazwa, NIP"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>

                <div className="d-flex align-items-end">
                    <Button variant="primary" onClick={handleFilter} >
                        Filtruj
                    </Button>

                </div>
                <div className="d-flex align-items-end">
                    <Button variant="outline-primary" onClick={handleReset}>
                        Reset
                    </Button>

                </div>

            </div>

            <div className="card">

                <div className="border-0 card-header">
                    <div className="d-flex align-items-center">
                        <h5 className="card-title mb-0 flex-grow-1">Lista Leadów</h5>
                <div className="d-flex gap-2">
                    <div className="d-flex gap-2 flex-wrap">
                        <Button onClick={() => handleEdit(null)} className="btn ">Dodaj nowy <PlusCircle/></Button>
                        <Button onClick={handleDeleteSelected} disabled={selectedItems.length === 0}
                                className="btn btn-soft-primary ">Usuń zaznaczone <Trash/></Button>

                    </div>
                </div>
            </div>
        </div>

        <div className="pt-0 card-body">
            <Table className="table-responsive table-card mt-3 mb-1 align-middle table-nowrap table">


                <thead className="table-light">

                {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                        <th>
                            <input type="checkbox" onChange={handleSelectAll} checked={allSelected}/>
                        </th>
                        {headerGroup.headers.map(header => (
                            <th
                                key={header.id}
                                onClick={header.column.getToggleSortingHandler()}
                                className={header.column.getCanSort() ? "sort" : null}
                            >
                                {header.isPlaceholder ? null : (
                                    <>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </>
                                )}
                            </th>
                        ))}
                    </tr>
                ))}
                </thead>
                <tbody>

                {table.getRowModel().rows.map(row => (
                    <tr key={row.id}>
                        <td>
                            <input
                                type="checkbox"
                                checked={selectedItems.includes(row.original.id)}
                                onChange={() => handleSelectItem(row.original.id)}
                            />
                            </td>
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </Table>

                <Pagination
                    links={links}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                />
            </div>


            {showModal && <AddEditLeadModal refresLeads={fetchLeads} leadToEdit={selectedLeads} show={showModal} handleClose={handleClose} />}


        </div>
            <CommentModal
                show={showCommentModal}
                handleClose={handleCloseComments}
                clientGlobalId={currentClientGlobalId}
                entityType={currentEntityType}
                entityId={currentEntityId}
            />
        </>




    )


}

export default LeadList;