import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminTable = () => {
    const navigate = useNavigate();

    const admins = [
        { no: '01', name: 'Yuzar', email: 'yuzar@gmail.com', status: 'Terdaftar' },
        { no: '02', name: 'Gustika', email: 'gustika@gmail.com', status: 'Terdaftar' },
        { no: '03', name: 'Hamdan', email: 'hamdan@gmail.com', status: 'Terdaftar' },
        { no: '04', name: 'Fauzan', email: 'fauzan@gmail.com', status: 'Terdaftar' },
        { no: '05', name: 'Athallah', email: 'athallah@gmail.com', status: 'Terdaftar' },
    ];

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="max-w-lg w-full bg-white shadow-md rounded-lg border border-gray-300">
                <div className="bg-blue-500 text-white text-center py-3 border-b border-gray-300">
                    <h2 className="text-lg font-semibold">Admin Terdaftar</h2>
                </div>
                <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                        <tr className="border border-gray-300">
                            <th className="py-2 px-4 border border-gray-300">No</th>
                            <th className="py-2 px-4 border border-gray-300">Nama Admin</th>
                            <th className="py-2 px-4 border border-gray-300">Email</th>
                            <th className="py-2 px-4 border border-gray-300">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.map((admin, index) => (
                            <tr key={index} className="border border-gray-300">
                                <td className="py-2 px-4 border border-gray-300 text-center">{admin.no}</td>
                                <td className="py-2 px-4 border border-gray-300">{admin.name}</td>
                                <td className="py-2 px-4 border border-gray-300">{admin.email}</td>
                                <td className="py-2 px-4 border border-gray-300 text-center">
                                    <span className="bg-green-200 text-green-800 py-1 px-3 rounded-full text-xs">{admin.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="flex justify-center gap-4 py-4 border-t border-gray-300">
                    <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition">
                        Tambah Admin
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition"
                    >
                        Kembali
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminTable;