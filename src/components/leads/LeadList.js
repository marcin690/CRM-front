import React, {useEffect, useMemo, useState} from "react";
import {useNotification} from "../notyfications/NotyficationContext";
import axios from "axios";
import api from "../../utils/axiosConfig";
import {flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";
import {Link} from "react-router-dom";
import {Table} from "react-bootstrap";
import {formatDistanceToNow} from "date-fns";
import LeadStatusDropdown from "./LeadStatusDropdown";

const LeadList = () => {
    const {notify} = useNotification();
    const [leads, setLeads] = useState([]);

    const fetchLeads = () => {
        const token = localStorage.getItem('token');
        axios.get("http://localhost:8080/leads", {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                setLeads(response.data);
            })
            .catch(error => {
                if (error.response) {
                    console.error('Response error:', error.response); // Loguj szczegóły odpowiedzi w przypadku błędu
                } else {
                    console.error('Error:', error.message); // Loguj ogólny błąd
                }
                notify('Błąd pobieranie leadów z serwera. \n' + error, 'error');
            });
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
                accessorFn: row => row.description
            },
            {
                id: 'assignedEmplyee',
                header: 'Handlowiec',
                cell: ({row}) => {
                    return(
                        <Link to={"/"}>
                            {row.original.assignedTo ? (
                                row.original.assignedTo.avatar ? (
                                        <img className="img-fluid" width="40" src={row.original.assignedTo.avatar}/>
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
            {
                id: 'leadStatus',
                header: 'Status',
                cell: ({row}) => (<LeadStatusDropdown leadId={row.original.id} currentStatus={row.original.leadStatus}
                                                      onStatusChange={(newStatus) => handleStatusChange(row.original.id, newStatus)} />),

            },
            {
                id: 'createDate',
                header: 'Utworzony',
                accessorFn: (row) => formatDistanceToNow(new Date(row.createdAt), { addSuffix: true }),
            }


        ]
        , [leads]);

    const table = useReactTable({data, columns, getCoreRowModel: getCoreRowModel()});

    return(
        <div className="card">
            <div className="border-0 card-header">
                <div className="d-flex align-items-center">
                    <h5 className="card-title mb-0 flex-grow-1">Lista Leadów</h5>
                    <div className="d-flex gap-2">
                        <div className="d-flex gap-2 flex-wrap">
                            <Link to="/leads/new" className="btn btn-soft-primary">Nowy lead</Link>
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


        </div>


    )
}

export default LeadList;