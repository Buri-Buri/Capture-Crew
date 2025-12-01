import React, { useState, useEffect } from 'react';
import { getSellerBookings } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const Reports = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [earningsByMonth, setEarningsByMonth] = useState({});
    const [totalEarnings, setTotalEarnings] = useState(0);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await getSellerBookings();
            if (Array.isArray(data)) {
                const paidBookings = data.filter(b => b.payment_status === 'paid');
                setBookings(paidBookings);
                calculateStats(paidBookings);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        let total = 0;
        const monthly = {};

        data.forEach(booking => {
            const price = parseFloat(booking.service_price) || 0;
            total += price;

            const date = new Date(booking.booking_date);
            const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });

            if (!monthly[monthYear]) {
                monthly[monthYear] = 0;
            }
            monthly[monthYear] += price;
        });

        setTotalEarnings(total);
        setEarningsByMonth(monthly);
    };

    if (loading) return <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>Loading...</div>;

    return (
        <div className="container" style={{ paddingTop: '100px', maxWidth: '800px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Earnings Report</h2>
                <button onClick={() => navigate('/dashboard')} className="btn btn-outline">Back to Dashboard</button>
            </div>

            <div className="card" style={{ marginBottom: '2rem', textAlign: 'center', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white' }}>
                <h3>Total Lifetime Earnings</h3>
                <p style={{ fontSize: '3rem', fontWeight: 'bold' }}>৳{totalEarnings.toFixed(2)}</p>
            </div>

            <div className="grid" style={{ marginBottom: '2rem' }}>
                <div className="card">
                    <h3>Monthly Breakdown</h3>
                    {Object.keys(earningsByMonth).length > 0 ? (
                        <ul style={{ marginTop: '1rem' }}>
                            {Object.entries(earningsByMonth).map(([month, amount]) => (
                                <li key={month} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                                    <span>{month}</span>
                                    <span style={{ fontWeight: 'bold', color: '#10b981' }}>৳{amount.toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ color: 'var(--muted-foreground)', marginTop: '1rem' }}>No earnings yet.</p>
                    )}
                </div>
            </div>

            <div className="card">
                <h3>Transaction History</h3>
                {bookings.length > 0 ? (
                    <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem' }}>Date</th>
                                    <th style={{ padding: '1rem' }}>Service</th>
                                    <th style={{ padding: '1rem' }}>Customer</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((booking) => (
                                    <tr key={booking.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem' }}>{new Date(booking.booking_date).toLocaleDateString()}</td>
                                        <td style={{ padding: '1rem' }}>{booking.service_title}</td>
                                        <td style={{ padding: '1rem' }}>{booking.customer_name}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: '#10b981' }}>
                                            ৳{parseFloat(booking.service_price).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p style={{ color: 'var(--muted-foreground)', marginTop: '1rem', textAlign: 'center' }}>No transactions found.</p>
                )}
            </div>
        </div>
    );
};

export default Reports;
