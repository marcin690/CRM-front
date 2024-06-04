import React, {useEffect, useState, useMemo} from 'react';
import axios from 'axios';
import {useReactTable, getCoreRowModel, flexRender} from '@tanstack/react-table';
import {Table , } from "react-bootstrap";
import AddEditUserModal from "./AddEditUserModal";
import {useNotification} from "../notyfications/NotyficationContext";


const UsersList = () => {
    const { notify } = useNotification();

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    const handleEdit = (user) => {
        setSelectedUser(user);
    }

    const resetSelectedUsers = () =>{
        setSelectedUser(null)
    }

    const fetchUsers = () => {
        axios.get("/users")
            .then(response => {
                setUsers(response.data);
            })
            .catch(error => {
                notify(error, 'error');
            });
    };

    useEffect(() => {
        fetchUsers()
    }, []);

    const data = useMemo(() => users, [users]);

    const columns = useMemo(() => [
        {
            id: 'select',
            header: ({ table }) => (
                <input
                    type="checkbox"
                    checked={table.getIsAllRowsSelected()}
                    onChange={table.getToggleAllRowsSelectedHandler()}
                />
            ),
            cell: ({ row }) => (
                <input
                    type="checkbox"
                    checked={row.getIsSelected()}
                    onChange={row.getToggleSelectedHandler()}
                />
            ),
        },
        {
            id: 'id',
            header: 'ID',
            accessorFn: row => row.id,
        },
        {
            id: 'username',
            header: 'Username',
            accessorFn: row => row.username,
        },
        {
            id: 'name',
            header: 'Imię i nazwisko',
            accessorFn: row => row.fullname,
        },
        {
          id: 'phone',
            header: 'Numer telefonu',
            accessorFn: row => row.phone,
        },
        {
          id: 'email',
          header: 'Adres email',
          accessorFn: row => row.email,
        },
        {
            id: 'enabled',
            header: 'Enabled',
            accessorFn: row => row.enabled ? 'Yes' : 'No',
        },
        {
            id: 'edit',
            header: 'Edit',
            cell: ({ row }) => (
                <button className="btn btn-soft-primary" onClick={() => handleEdit(row.original)}>Edit</button>
            )
        }

    ], []);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const handleDeleteSelected = () => {
        const idsToDelete = table.getSelectedRowModel().rows.map(row => row.original.id);
        if(idsToDelete.length > 0) {
            axios.delete("/users", {data: idsToDelete})
                .then(() => {
                    setUsers(prevUsers => prevUsers.filter(users => !idsToDelete.includes(users.id)));
                    fetchUsers();
                })
                .catch (error => {
                console.error(error);
            });
        }
    }


    return (

        <div className="card">

            <div className="border-0 card-header">
                <div className="d-flex align-items-center"><h5 className="card-title mb-0 flex-grow-1">Lista
                    użytowników</h5>
                    <div className="d-flex gap-2">
                        <div onClick={handleDeleteSelected} className="d-flex gap-2 flex-wrap"><a className="btn btn-soft-primary" ><i
                            className="bx bx-trash align-bottom me-1"></i> Usuń zaznaczone </a></div>
                        <div className="d-flex gap-2 flex-wrap"><AddEditUserModal refreshUsers={fetchUsers} userToEdit={selectedUser} /></div>
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

    );
};

export default UsersList;
