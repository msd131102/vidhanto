import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { appointmentsAPI } from '../services/api';

const BookingModal = ({ lawyer, isOpen, onClose, onBookingSuccess }) => {
  const [selectedType, setSelectedType] = useState('chat');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);

  const consultationTypes = [
    { id: 'chat', name: 'Chat', icon: '💬', fee: lawyer.consultationFees?.chat || 0 },
    { id: 'voice', name: 'Voice', icon: '📞', fee: lawyer.consultationFees?.voice || 0 },
    { id: 'video', name: 'Video', icon: '📹', fee: lawyer.consultationFees?.video || 0 }
  ];

  const selectedConsultation = consultationTypes.find(t => t.id === selectedType);
  const platformFee = Math.round(selectedConsultation.fee * 0.1);
  const totalFee = selectedConsultation.fee + platformFee;

  // 🔄 Regenerate slots on date change
  useEffect(() => {
    setSelectedTime('');
    setAvailableSlots([]);
    if (selectedDate) generateTimeSlots();
  }, [selectedDate]);

  // 🇮🇳 SLOT GENERATION (ALWAYS SHOW SLOTS)
  const generateTimeSlots = () => {
    const date = new Date(`${selectedDate}T00:00:00+05:30`);
    const day = date
      .toLocaleDateString('en-IN', { weekday: 'long' })
      .toLowerCase();

    const availability = lawyer?.availability?.[day];
    const slots = [];

    // Default Indian slots (10 AM – 7 PM)
    const addDefaultSlots = () => {
      for (let hour = 10; hour < 19; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    };

    // No availability → default slots
    if (!Array.isArray(availability) || availability.length === 0) {
      addDefaultSlots();
      setAvailableSlots(slots);
      return;
    }

    // Availability exists
    availability.forEach((item) => {
      let startTime, endTime;

      if (typeof item === 'object' && item?.start && item?.end) {
        startTime = item.start;
        endTime = item.end;
      } else if (typeof item === 'string' && item.includes('-')) {
        const [s, e] = item.split('-');
        startTime = s?.trim();
        endTime = e?.trim();
      }

      if (!startTime || !endTime) return;

      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);

      let h = sh;
      let m = sm;

      while (h < eh || (h === eh && m < em)) {
        slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
        m += 30;
        if (m >= 60) {
          m = 0;
          h++;
        }
      }
    });

    // Safety fallback
    if (slots.length === 0) addDefaultSlots();

    setAvailableSlots(slots);
  };

  const handleNext = () => {
    if (currentStep === 1 && (!selectedDate || !selectedTime)) {
      return toast.error('Please select date & time');
    }
    if (currentStep === 2 && !description.trim()) {
      return toast.error('Please enter case description');
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep === 1) return onClose();
    setCurrentStep(prev => prev - 1);
  };

  const handleBooking = async () => {
    try {
      setLoading(true);

      const scheduledDateTime = new Date(
        `${selectedDate}T${selectedTime}:00+05:30`
      );

      const res = await appointmentsAPI.createAppointment({
        lawyerId: lawyer._id,
        type: selectedType,
        scheduledDate: scheduledDateTime.toISOString(),
        duration: 30,
        description: description.trim()
      });

      toast.success('Appointment booked successfully');
      onBookingSuccess?.(res.data.appointment);
      onClose();
      resetForm();
    } catch (err) {
      toast.error(err.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedType('chat');
    setSelectedDate('');
    setSelectedTime('');
    setDescription('');
    setCurrentStep(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-xl overflow-hidden">

        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Book Appointment</h2>
          <button onClick={onClose} className="text-2xl">×</button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {currentStep === 1 && (
            <>
              {/* Consultation Type */}
              <div className="grid grid-cols-3 gap-3">
                {consultationTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 border rounded-lg ${
                      selectedType === type.id ? 'border-blue-600 bg-blue-50' : ''
                    }`}
                  >
                    <div className="text-xl">{type.icon}</div>
                    <p className="font-medium">{type.name}</p>
                    <p className="text-sm">₹{type.fee}</p>
                  </button>
                ))}
              </div>

              {/* Date */}
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="w-full border p-2 rounded"
              />

              {/* Slots */}
              <div className="grid grid-cols-4 gap-2">
                {availableSlots.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    className={`p-2 border rounded ${
                      selectedTime === slot ? 'bg-blue-100 border-blue-600' : ''
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </>
          )}

          {currentStep === 2 && (
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border p-3 rounded"
              placeholder="Describe your legal issue"
            />
          )}

          {currentStep === 3 && (
            <div className="bg-gray-50 p-4 rounded">
              <p>Consultation Fee: ₹{selectedConsultation.fee}</p>
              <p>Platform Fee: ₹{platformFee}</p>
              <p className="font-bold">Total: ₹{totalFee}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-between">
          <button onClick={handleBack} className="px-4 py-2 border rounded">
            Back
          </button>

          {currentStep < 3 ? (
            <button onClick={handleNext} className="px-6 py-2 bg-blue-600 text-white rounded">
              Next
            </button>
          ) : (
            <button
              onClick={handleBooking}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded"
            >
              {loading ? 'Booking...' : 'Confirm & Pay'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
