import React, {useEffect, useMemo, useState} from "react";
import {useNotification} from "../notyfications/NotyficationContext";
import axios from "axios";
import api from "../../utils/axiosConfig";
import {flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";
import {Link} from "react-router-dom";
import {Button, ButtonGroup, OverlayTrigger, Table, Tooltip} from "react-bootstrap";
import {formatDistanceToNow} from "date-fns";
import LeadStatusDropdown from "./LeadStatusDropdown";
import {ErrorIcon, LoaderIcon} from "react-hot-toast";
import {pl} from "date-fns/locale";
import {Chat, Eye, EyeFill, EyeSlash, Pencil, Plus, PlusCircle, Trash} from "react-bootstrap-icons";
import AddEditLeadModal from "./AddEditLeadModal";

const LeadList = () => {
    const {notify} = useNotification();
    const [leads, setLeads] = useState([]);
    const [selectedLeads, setSelectedLead] = useState(null)
    const [showModal,setShowModal] = useState(false)

    const truncateText = (text, maxLenght) => {
        if(text.length <= maxLenght) {
            return text
        }
        return text.substring(0,maxLenght) + "..."
    }

    const handleEdit = (lead) => {
        setSelectedLead(lead);
        setShowModal(true)
    }

    const handleClose = () => {
        setShowModal(false);
        setSelectedLead(null);
    }

    const resetSelectedLead = () => {
        setSelectedLead(null)
    }

    const fetchLeads = () => {
        api.get("/leads")
            .then( response => {setLeads(response.data)})
            .catch(error => {
                notify(error.message, "error")
            })
    }


    useEffect(() => {
        fetchLeads();
    }, []);

    const data = useMemo(() => leads, [leads])

    const handleStatusChange = (leadId, newStatus) => {
        setLeads(leads.map(lead => lead.id === leadId ? {...lead, leadStatus: newStatus} : lead))
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
                            {row.original.contactInfo ? row.original.contactInfo.clientBusinessName : null}
                        </Link>
                        )

                }
            },
            {
                id: 'desc',
                header: 'Opis',
                accessorFn: row => truncateText(row.description, 55)
            },

            {
                id: 'leadStatus',
                header: 'Status',
                cell: ({row}) => (<LeadStatusDropdown leadId={row.original.id} currentStatus={row.original.leadStatus}
                                                      onStatusChange={(newStatus) => handleStatusChange(row.original.id, newStatus)} />),

            },
            {
                id: 'updatedDate',
                header: 'Zaktualizowany',
                accessorFn: row => row.updatedAt,
                cell: ({row}) => {
                    const updatedAt = new Date(row.original.updatedAt);
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
            {
                id: 'assignedEmplyee',
                header: 'Handlowiec',
                cell: ({row}) => {
                    return(
                        <Link to={"/"}>
                            {row.original.assignedTo ? (
                                row.original.assignedTo.avatar ? (
                                    <>
                                        <img className="img-fluid" width="40" src={row.original.assignedTo.avatar}/>
                                    </>

                                ) : (
                                    "test"
                                )
                            ) : (
                                "brak"
                            )}

                        </Link>
                    )
                }
            },


        ]
        , [leads]);

    const table = useReactTable({data, columns, getCoreRowModel: getCoreRowModel()});

    return(
        <div className="card">
            <div>
                <ButtonGroup>
                    <button className="btn btn-soft-primary">Pokaż przypisane tylko do mnie</button>
                    <button className="btn btn-soft-primary">Pokaż przypisane tylko do mnie</button>
                </ButtonGroup>
            </div>
            <div className="border-0 card-header">
            <div className="d-flex align-items-center">
                    <h5 className="card-title mb-0 flex-grow-1">Lista Leadów</h5>
                    <div className="d-flex gap-2">
                        <div className="d-flex gap-2 flex-wrap">
                            <Link to="/leads/new" className="btn btn-soft-primary">Usuń zazaczone <Trash/></Link>
                            <Button onClick={() => handleEdit(null)} className="btn btn-soft-primary">Nowy lead <PlusCircle /></Button>

                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-0 card-body">
                <Table className="table-responsive table-card mt-3 mb-1 align-middle table-nowrap table">


                    <thead className="table-light">
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id}>
                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                    </thead>
                    <tbody>
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </Table>
            </div>


            {showModal && <AddEditLeadModal refresLeads={fetchLeads} leadToEdit={selectedLeads} show={showModal} handleClose={handleClose} />}


        </div>




    )
}

export default LeadList;