import React, {useEffect, useMemo, useState} from "react";
import {useNotification} from "../notyfications/NotyficationContext";
import axios from "axios";
import api from "../../utils/axiosConfig";
import {flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";
import {Link} from "react-router-dom";
import {Table} from "react-bootstrap";

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
                notify('Błąd pobieranie leadów z serwera. \n' + error, 'error');
            });
    }

    useEffect(() => {
        fetchLeads();
    }, []);

    const data = useMemo(() => leads, [leads])

    const columns = useMemo(() =>
        [
            {
                id:'id',
                header: 'ID',
                accesorFn: row => row.id
            },
            {
                id: 'name',
                header: 'nazwa',
                accesorFn: row => row.name
            }
        ]
    , []);

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
                </Table>
            </div>


        </div>


    )
}

export default LeadList;