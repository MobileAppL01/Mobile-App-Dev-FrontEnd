
import axiosInstance from './axiosInstance';

export interface CourtAvailabilityResponse {
    courtId: number;
    courtName: string;
    date: string;
    bookedSlots: number[];
    availableSlots: number[];
    openHour: number;
    closeHour: number;
    pricePerHour: number;
}

export interface CreateBookingRequest {
    courtId: number;
    bookingDate: string;
    startHours: number[];
    paymentMethod: 'VNPAY' | 'CASH';
}

export const bookingService = {
    // Get court availability
    getCourtAvailability: async (courtId: number, date: string): Promise<CourtAvailabilityResponse | null> => {
        try {
            const response = await axiosInstance.get(`/courts/${courtId}/availability`, {
                params: { date }
            });
            return response.data.result;
        } catch (error) {
            console.error(`Error fetching availability for court ${courtId}:`, error);
            return null;
        }
    },

    // Create booking
    createBooking: async (request: CreateBookingRequest): Promise<any> => {
        try {
            const response = await axiosInstance.post('/bookings', request);
            return response.data.result;
        } catch (error) {
            console.error("Error creating booking:", error);
            throw error;
        }
    },

    // Get my booking history
    getMyBookings: async () => {
        try {
            const response = await axiosInstance.get('/bookings/my-history');
            return response.data.result;
        } catch (error) {
            console.error("Error fetching booking history:", error);
            return [];
        }
    }
};
