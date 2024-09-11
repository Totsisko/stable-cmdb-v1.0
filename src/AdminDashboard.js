import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase'; // Import Firestore
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import MenuButton from './MenuButton'; // Import the MenuButton component
import './AdminDashboard.css'; // Import the CSS file

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'appointments'));
      const fetchedAppointments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(fetchedAppointments);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status });
      toast.success('Appointment status updated!');
      // Add SMS notification sending code here
      fetchAppointments(); // Refresh appointments after status update
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status.');
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (loading) return <p>Loading appointments...</p>;

  // Filter appointments based on their status
  const pendingAppointments = appointments.filter(app => app.status === 'Pending');
  const confirmedAppointments = appointments.filter(app => app.status === 'Confirmed');
  const deniedAppointments = appointments.filter(app => app.status === 'Denied');

  return (
    <div className="dashboard-container">
      <MenuButton /> {/* Add MenuButton here */}
      <h1>Admin Dashboard</h1>
      <button className="button" onClick={() => navigate('/manage-events')}>Manage Events</button>
      <button className="button" onClick={() => navigate('/manage-accounts')}>Manage Accounts</button>
      <div className="appointment-list">
        <h2>Manage Appointments</h2>
        <div>
          <h3>Pending</h3>
          <ul>
            {pendingAppointments.length > 0 ? (
              pendingAppointments.map((appointment) => (
                <li key={appointment.id}>
                  Date: {appointment.date}, Time: {appointment.time}
                  <button className="button confirm-button" onClick={() => handleUpdateStatus(appointment.id, 'Confirmed')}>Confirm</button>
                  <button className="button deny-button" onClick={() => handleUpdateStatus(appointment.id, 'Denied')}>Deny</button>
                </li>
              ))
            ) : (
              <p className="no-appointments">No pending appointments</p>
            )}
          </ul>
        </div>
        <div>
          <h3>Confirmed</h3>
          <ul>
            {confirmedAppointments.length > 0 ? (
              confirmedAppointments.map((appointment) => (
                <li key={appointment.id}>
                  Date: {appointment.date}, Time: {appointment.time}
                </li>
              ))
            ) : (
              <p className="no-appointments">No confirmed appointments</p>
            )}
          </ul>
        </div>
        <div>
          <h3>Denied</h3>
          <ul>
            {deniedAppointments.length > 0 ? (
              deniedAppointments.map((appointment) => (
                <li key={appointment.id}>
                  Date: {appointment.date}, Time: {appointment.time}
                </li>
              ))
            ) : (
              <p className="no-appointments">No denied appointments</p>
            )}
          </ul>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AdminDashboard;
