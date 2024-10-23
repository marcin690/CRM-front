import React, {useEffect, useMemo, useState} from "react";
import {useNotification} from "../notyfications/NotyficationContext";
import api from "../../utils/axiosConfig";
import {flexRender, getCoreRowModel, getSortedRowModel, useReactTable} from "@tanstack/react-table";
import {Link} from "react-router-dom";
import {Button, ButtonGroup, Image, OverlayTrigger, Table, Tooltip} from "react-bootstrap";
import {formatDistanceToNow} from "date-fns";
import LeadStatusDropdown from "./LeadStatusDropdown";
import {ErrorIcon, LoaderIcon} from "react-hot-toast";
import {pl} from "date-fns/locale";
import {Chat, Eye, EyeFill, EyeSlash, Pencil, Plus, PlusCircle, Trash} from "react-bootstrap-icons";
import AddEditLeadModal from "./AddEditLeadModal";
import useSelectableTable from "../../hooks/useSelectableTable";
import deleteItems from "../../utils/table/deleteItems";
import useLeadStatuses from "./hooks/useLeadStatuses";
import Pagination from "../../utils/table/Pagination";

const LeadList = () => {
    const {notify} = useNotification();
    const [leads, setLeads] = useState([]);
    const [selectedLeads, setSelectedLead] = useState(null)
    const [showModal,setShowModal] = useState(false)
    const [sortingState, setSortingState] = useState([{id: 'id', desc: true}])
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [users, setUsers] = useState([]); // Lista handlowców
    const [fromDate,setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [selectedStatus,setSelectedStatus] = useState('')
    const statuses = useLeadStatuses();

    // Paginacja
    const [currentPage, setCurrentPage] = useState(0); // Strona aktualna
    const [pageSize] = useState(10); // Ustalmy rozmiar strony
    const [totalPages, setTotalPages] = useState(0); // Całkowita liczba stron

    const {
        selectedItems,
        handleSelectItem,
        handleSelectAll,
        clearSelection,
        allSelected,
    } = useSelectableTable(leads)

    const truncateText = (text, maxLength) => {
        return typeof text === "string" ? (text.length > maxLength ? text.substring(0, maxLength) + "..." : text) : "";
    };


    const handleEdit = (lead) => {
        setSelectedLead(lead);
        setShowModal(true)
    }

    const handleClose = () => {
        setShowModal(false);
        setSelectedLead(null);
    }



    const fetchLeads = () => {
        api.get(`/leads?page=${currentPage}&size=${pageSize}`)
            .then( response => {setLeads(response.data)})
            .catch(error => {
                notify(error.message, "error")
            })
    }




    const handleStatusChange = (leadId, newStatus) => {
        setLeads(leads.map(lead => lead.id === leadId ? {...lead, leadStatusId: newStatus} : lead));
        fetchLeads();
    }



    const fetchSellers = async () => {
        try {
            const response = await api.get('/users/sellers');
            setUsers(response.data); // Zapisz handlowców w stanie
        } catch (error) {
            notify('Nie można pobrać listy użytkowników', 'error');
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
            console.log(error);
            notify(error.message, "error");
        }
    };

    useEffect(() => {
        fetchLeads();  // Pobieranie leadów
        fetchSellers();  // Pobieranie listy handlowców
    }, []);


    const filteredLeads = useMemo(() => {
        return leads.filter((lead) => {
            // Filtrowanie po pracowniku
            const employeeMatch = selectedEmployee ? lead.assignTo?.fullname === selectedEmployee : true;

            // filtrowanie po statusie
            const statusMatch = selectedStatus ? lead.leadStatusId === Number(selectedStatus) : true;

            // filtrowanie po dacie
            const leadDate = new Date(lead.creationDate)
            const from = fromDate ? new Date(fromDate) : null
            const to  = toDate ? new Date(toDate) : null

            let dateMatch = true;
            if(from && to) {
                dateMatch = leadDate >= from && leadDate <= to;
            } else if (from) {
                dateMatch = leadDate >= from
            } else if (to) {
                dateMatch = leadDate <= to
            }

            return employeeMatch && statusMatch && dateMatch;
        })
    },  [leads, selectedEmployee, selectedStatus, fromDate, toDate]);



    const data = useMemo(() => filteredLeads, [filteredLeads])

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
                            {row.original.clientBusinessName ? row.original.clientBusinessName : null}
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
                    console.log("Rendering row:", row.original);
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
                        <button className="btn  p-1 m-0 " onClick={() => handleEdit(row.original)}><Chat/></button>
                        <button className="btn  p-1 m-0 " onClick={() => handleEdit(row.original)}><Eye /></button>


                    </>

                )
            },


        ]
        , [leads, selectedLeads, users]);

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

    return(
        <div className="card">
            <div className="d-flex gap-3 p-3">
                <div>
                    <label>Data od</label>
                    <input
                        type="date"
                        className="form-control"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                    />
                </div>
                <div>
                    <label>Data do</label>
                    <input
                        type="date"
                        className="form-control"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                    />
                </div>

                <div>
                    <label>Pracownik</label>
                    <select
                        className="form-select"
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
                    >
                        <option value="">Dowolny</option>
                        {statuses.map(status => (
                            <option key={status.id} value={status.id}>
                                {status.statusDescription}
                            </option>
                        ))}
                    </select>
                </div>

            </div>
            <div className="border-0 card-header">
                <div className="d-flex align-items-center">
                    <h5 className="card-title mb-0 flex-grow-1">Lista Leadów</h5>
                    <div className="d-flex gap-2">
                        <div className="d-flex gap-2 flex-wrap">
                            <Button onClick={() => handleEdit(null)} className="btn ">Dodaj nowy <PlusCircle /></Button>
                            <Button onClick={handleDeleteSelected} disabled={selectedItems.length === 0} className="btn btn-soft-primary ">Usuń zaznaczone <Trash /></Button>

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

                <Pagination totalPages={totalPages} onPageChange={setCurrentPage} currentPage={currentPage} />
            </div>


            {showModal && <AddEditLeadModal refresLeads={fetchLeads} leadToEdit={selectedLeads} show={showModal} handleClose={handleClose} />}


        </div>




    )
}

export default LeadList;