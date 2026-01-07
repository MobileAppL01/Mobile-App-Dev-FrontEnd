import axiosInstance from "./axiosInstance";

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
  paymentMethod: "VNPAY" | "CASH";
}

export interface HoldSlotRequest {
  courtId: number;
  bookingDate: string; // YYYY-MM-DD
  startHours: number[];
}

export interface HoldSlotResponse {
  bookingId: number;
  tempHeldUntil: string;
  totalAmount: number;
  message: string;
}

export interface ProcessPaymentRequest {
  bookingId: number;
  paymentMethod: "VNPAY" | "CASH" | "WALLET" | "BANK_TRANSFER";
}

export interface ProcessPaymentResponse {
  paymentId: number;
  paymentUrl: string; // For VNPAY
  qrCode: string; // For Banking
  status: string;
  message: string;
}

export interface PaymentInfoResponse {
  bookingId: number;
  totalAmount: number;
  status: string;
  // add other fields if needed
}

export const bookingService = {
  // --- PlayerBookingController Endpoints ---

  // Get court availability
  getCourtAvailability: async (
    courtId: number,
    date: string
  ): Promise<CourtAvailabilityResponse | null> => {
    try {
      const response = await axiosInstance.get(
        `/courts/${courtId}/availability`,
        {
          params: { date },
        }
      );
      return response.data.result;
    } catch (error) {
      console.error(`Error fetching availability for court ${courtId}:`, error);
      return null;
    }
  },

  // Create booking (Legacy/Simple)
  createBooking: async (request: CreateBookingRequest): Promise<any> => {
    try {
      const response = await axiosInstance.post("/bookings", request);
      return response.data.result;
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  },

  // Get my booking history
  getMyBookings: async () => {
    try {
      const response = await axiosInstance.get("/bookings/my-history");
      return response.data.result;
    } catch (error) {
      console.error("Error fetching booking history:", error);
      return [];
    }
  },

  getBookingDetail: async (id: number) => {
    try {
      const response = await axiosInstance.get(`/bookings/${id}`);
      return response.data.result;
    } catch (error) {
      console.error("Error fetching booking detail:", error);
      throw error;
    }
  },

  cancelBooking: async (id: number) => {
    try {
      const response = await axiosInstance.put(`/bookings/${id}/cancel`);
      return response.data;
    } catch (error) {
      console.error("Error cancelling booking:", error);
      throw error;
    }
  },

  // --- Enhanced Booking Payment Controller Endpoints ---

  // Step 1: Hold Slot
  holdSlot: async (request: HoldSlotRequest): Promise<HoldSlotResponse> => {
    const response = await axiosInstance.post(
      "/enhanced-booking-payment/step1-hold",
      request
    );
    return response.data;
  },

  // Step 2: Process Payment
  processPayment: async (
    request: ProcessPaymentRequest
  ): Promise<ProcessPaymentResponse> => {
    const response = await axiosInstance.post(
      "/enhanced-booking-payment/step2-payment",
      request
    );
    return response.data;
  },

  // Get Payment Info
  getPaymentInfo: async (bookingId: number): Promise<PaymentInfoResponse> => {
    const response = await axiosInstance.get(
      `/enhanced-booking-payment/${bookingId}/payment-info`
    );
    return response.data;
  },

  // Check Status
  checkPaymentStatus: async (paymentId: number) => {
    const response = await axiosInstance.get(
      `/enhanced-booking-payment/${paymentId}/status`
    );
    return response.data;
  },

  // Available Payment Methods
  getAvailablePaymentMethods: async () => {
    const response = await axiosInstance.get(
      "/enhanced-booking-payment/available-payment-methods"
    );
    return response.data;
  },

  // --- Owner APIs ---

  getRevenueStatistics: async (month: number, year: number) => {
    try {
      const response = await axiosInstance.get("/owner/statistics/revenue", {
        params: { month, year },
      });
      return response.data.result;
    } catch (error) {
      console.error("Error fetching revenue stats:", error);
      throw error;
    }
  },

  getOwnerBookings: async (params?: {
    locationId?: number;
    date?: string;
    status?: string;
  }) => {
    try {
      const response = await axiosInstance.get("/owner/bookings", { params });
      return response.data.result;
    } catch (error) {
      console.error("Error fetching owner bookings:", error);
      return [];
    }
  },

  getAllPlayerHistory: async () => {
    try {
      const response = await axiosInstance.get("/bookings/my-history");
      // Lưu ý: Service trả về thẳng mảng dữ liệu (result)
      return response.data.result;
    } catch (error) {
      console.error("Error fetching my history", error);
      return []; // Trả về mảng rỗng nếu lỗi để không crash app
    }
  },
};
